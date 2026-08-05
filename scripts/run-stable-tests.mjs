#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import process from "node:process";

const passthroughArgs = process.argv.slice(2);
const hasVitestConfig = existsSync("vitest.config.ts") || existsSync("vitest.config.js") || existsSync("vite.config.ts");
const command = process.platform === "win32" ? "npx.cmd" : "npx";

const args = [
  "vitest",
  "run",
  "--pool=forks",
  "--isolate=true",
  "--fileParallelism=false",
  "--reporter=default",
  "--reporter=json",
  "--outputFile=.test-results/vitest-results.json",
  ...passthroughArgs,
];

if (!hasVitestConfig) {
  console.warn("[stable-tests] No Vitest/Vite config found. Vitest will use defaults.");
}

console.log(`[stable-tests] Running: npx ${args.join(" ")}`);

const result = spawnSync(command, args, {
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, "--max-old-space-size=4096"].filter(Boolean).join(" "),
    CI: process.env.CI ?? "true",
    TZ: process.env.TZ ?? "UTC",
  },
});

if (result.error) {
  console.error("[stable-tests] Failed to start Vitest:", result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
