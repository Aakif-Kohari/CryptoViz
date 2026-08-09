# Test Suite Stabilization

Issue #611 reports that many tests are failing and asks to fix the suite, update
tests, and enforce CI. This patch adds a focused stabilization layer for Vitest.

## What changed

- Added a stable Vitest setup file.
- Added deterministic browser API fallbacks for tests.
- Added a Worker fallback for worker-dependent tests.
- Added cleanup between tests.
- Added a stable Vitest config that disables file parallelism and isolates tests.
- Added a stable test runner script.
- Added a GitHub Actions workflow to enforce the suite in CI.

## Why this helps

A large browser-heavy test suite can fail for reasons unrelated to the code under
test:

- missing `crypto` in the test environment
- missing `TextEncoder` or `TextDecoder`
- worker APIs unavailable in jsdom
- tests leaking mocks or timers into later files
- file-level parallelism causing shared state races
- CI timezone differences

The stabilization config reduces those sources of nondeterminism while keeping
the actual assertions intact.

## Recommended package.json scripts

Add these scripts if they do not already exist:

```json
{
  "scripts": {
    "test": "vitest run --config vitest.stable.config.ts",
    "test:stable": "node scripts/run-stable-tests.mjs --config vitest.stable.config.ts",
    "test:coverage": "vitest run --config vitest.stable.config.ts --coverage"
  }
}
```

## Manual verification

```powershell
npx prettier --write tests/setup/stableTestEnvironment.ts
npx prettier --write vitest.stable.config.ts
npx prettier --write scripts/run-stable-tests.mjs

npx vitest run --config vitest.stable.config.ts
node scripts/run-stable-tests.mjs --config vitest.stable.config.ts
npm run build
```

## Notes

This patch does not hide failing assertions. It makes the runtime deterministic
so real failures are easier to identify and prevents environment-related flakes
from dominating the test suite.
