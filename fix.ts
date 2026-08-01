import { Project, _Identifier, Node } from "ts-morph";
import * as fs from "fs";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const report = JSON.parse(fs.readFileSync('unused2.json', 'utf8'));

for (const item of report) {
  const sourceFile = project.getSourceFile(item.file);
  if (!sourceFile) continue;

  let fileChanged = false;

  for (const unused of item.unused) {
    const line = unused.line;
    // Extract the variable name from the message.
    // e.g. "'keystream' is assigned a value but never used."
    // e.g. "'key' is defined but never used."
    const match = unused.msg.match(/'([^']+)'/);
    if (!match) continue;
    const varName = match[1];
    
    // Sometimes eslint reports unused vars which we can prefix with _
    // Let's find identifiers on that line with that name
    const descendants = sourceFile.getDescendants();
    for (const node of descendants) {
      if (Node.isIdentifier(node) && node.getText() === varName) {
        if (node.getStartLineNumber() === line) {
          // If it's a declaration, rename it
          try {
            node.rename(`_${varName}`);
            fileChanged = true;
          } catch (_e) {
            // rename might fail if it's not a valid rename location or read-only
          }
        }
      }
    }
  }

  if (fileChanged) {
    sourceFile.saveSync();
  }
}
