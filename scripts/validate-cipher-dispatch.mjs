/**
 * Static validation for issue #884.
 *
 * This script intentionally does not import the Vite worker because
 * import.meta.glob is a bundler primitive. It validates the architectural
 * invariant directly from source:
 *   1. the worker has no cipher switch
 *   2. the worker is small
 *   3. the registry-backed dispatcher is used
 */
import { readFile } from "node:fs/promises";

const workerPath = new URL("../lib/workers/cipher.worker.ts", import.meta.url);
const source = await readFile(workerPath, "utf8");
const lines = source.split(/\r?\n/).length;

if (lines >= 100) {
  throw new Error(`cipher.worker.ts must stay below 100 lines; found ${lines}.`);
}

if (/switch\s*\(\s*cipherId\s*\)/.test(source)) {
  throw new Error("cipher.worker.ts still contains a cipherId switch.");
}

if (!source.includes('from "./cipherDispatchRegistry"')) {
  throw new Error("cipher.worker.ts must use cipherDispatchRegistry.");
}

console.log(`cipher.worker.ts architecture OK (${lines} lines).`);
