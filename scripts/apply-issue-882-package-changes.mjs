import fs from "node:fs";

const packagePath = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

pkg.scripts = {
  ...pkg.scripts,
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:a11y": "playwright test tests/e2e/accessibility.spec.ts --project=chromium",
  "test:visual": "playwright test tests/e2e/visual.spec.ts --project=chromium",
};

pkg.devDependencies = {
  ...pkg.devDependencies,
  "@axe-core/playwright": "^4.11.0",
  "@playwright/test": "^1.54.2",
};

fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log("Updated package.json for issue #882.");
