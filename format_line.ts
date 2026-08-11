diff --git a/format_line.ts b/format_line.ts
index 1a2b3c4..5d6e7f8 100644
--- a/format_line.ts
@@ -10,7 +10,7 @@ function formatLine(input: string): string {
   return input.replace(/\s+/g, ' ');
 }
 
-// @ts-ignore
+// TODO: Resolve type safety issue
 function transformLine(input: any) {
   return formatLine(input);
 }
