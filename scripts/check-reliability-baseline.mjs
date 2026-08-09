#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import process from "node:process";

const checks = [
  {
    name: "focused reliability tests",
    command: "npx",
    args: ["vitest", "run", "tests/unit/quality/reliabilityBaseline.test.ts"],
  },
  {
    name: "lint",
    command: "npm",
    args: ["run", "lint"],
  },
  {
    name: "build",
    command: "npm",
    args: ["run", "build"],
  },
];

const isWindows = process.platform === "win32";
let failed = false;

for (const check of checks) {
  const command = isWindows ? `${check.command}.cmd` : check.command;
  console.log(
    `\n[reliability-baseline] Running ${check.name}: ${check.command} ${check.args.join(" ")}`,
  );

  const result = spawnSync(command, check.args, {
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      CI: process.env.CI ?? "true",
      TZ: process.env.TZ ?? "UTC",
    },
  });

  if (result.error || result.status !== 0) {
    failed = true;
    console.error(`[reliability-baseline] ${check.name} failed.`);
    break;
  }
}

if (failed) {
  process.exit(1);
}

console.log("\n[reliability-baseline] Required reliability checks passed.");
