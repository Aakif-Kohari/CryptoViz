# Worker Cache Optimization

Issue #622 focuses on the worker cache lifecycle and reducing overhead.

This update adds a reusable bounded worker cache that can be used by cipher,
hash, KDF, benchmark, and visualization workers without duplicating cache logic.

## What changed

- Added a generic `WorkerCache<TValue>` utility.
- Added stable cache-key generation for nested options.
- Added LRU eviction.
- Added TTL expiration.
- Added approximate memory limiting.
- Added cache statistics.
- Added cipher-worker cache helper functions.
- Added tests for lifecycle, eviction, TTL, stable keys, and cache bypass.

## Why this reduces overhead

Worker operations can be expensive when the same algorithm/input/options are
requested repeatedly from visualizer UI interactions. A bounded cache prevents
unnecessary recomputation while avoiding unbounded memory growth.

## Suggested integration pattern

```ts
import { withWorkerCache } from "@/lib/workers/cipherWorkerCache";

const result = withWorkerCache(
  {
    algorithm: "AES-GCM",
    operation: "encrypt",
    input,
    options,
    version: "aes-gcm-v1",
  },
  () => expensiveWorkerCalculation(input, options),
);
```

## Manual testing

1. Run the focused worker cache tests.
2. Confirm repeated requests return cached results.
3. Confirm disabled cache mode still recomputes.
4. Confirm TTL expiration removes stale entries.
5. Confirm LRU eviction removes the least recently used entry.
6. Confirm `npm run lint` and `npm run build` still pass.
