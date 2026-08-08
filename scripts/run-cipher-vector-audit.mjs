#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import process from "node:process";

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const args = [
  "vitest",
  "run",
  "tests/unit/symmetric/publishedCipherVectors.test.ts",
  ...process.argv.slice(2),
];

console.log(`[cipher-vector-audit] Running: npx ${args.join(" ")}`);

const result = spawnSync(command, args, {
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    CI: process.env.CI ?? "true",
    TZ: process.env.TZ ?? "UTC",
  },
});

if (result.error) {
  console.error("[cipher-vector-audit] Failed to start Vitest:", result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
