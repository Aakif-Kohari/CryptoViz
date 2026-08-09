import { describe, expect, it } from "vitest";
import {
  WorkerCache,
  createWorkerCacheKey,
} from "../../../lib/workers/workerCache";
import {
  createCipherWorkerCacheKey,
  getCachedWorkerResult,
  setCachedWorkerResult,
  withWorkerCache,
} from "../../../lib/workers/cipherWorkerCache";

describe("worker cache lifecycle", () => {
  it("creates stable keys independent of object property order", () => {
    expect(createWorkerCacheKey([{ b: 2, a: 1 }, "AES"])).toBe(
      createWorkerCacheKey([{ a: 1, b: 2 }, "AES"]),
    );
  });

  it("tracks hits and misses", () => {
    const cache = new WorkerCache<string>({ maxEntries: 3 });

    expect(cache.get("missing")).toBeUndefined();
    cache.set("a", "alpha");
    expect(cache.get("a")).toBe("alpha");

    expect(cache.stats()).toMatchObject({ entries: 1, hits: 1, misses: 1 });
  });

  it("evicts least-recently-used entries when max entries is exceeded", () => {
    const cache = new WorkerCache<string>({ maxEntries: 2 });

    cache.set("a", "alpha");
    cache.set("b", "bravo");
    expect(cache.get("a")).toBe("alpha");
    cache.set("c", "charlie");

    expect(cache.get("a")).toBe("alpha");
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe("charlie");
    expect(cache.stats().evictions).toBe(1);
  });

  it("expires entries using TTL", () => {
    let now = 1000;
    const cache = new WorkerCache<string>({ ttlMs: 50, now: () => now });

    cache.set("a", "alpha");
    expect(cache.get("a")).toBe("alpha");

    now = 1051;
    expect(cache.get("a")).toBeUndefined();
    expect(cache.stats().expirations).toBe(1);
  });

  it("supports getOrCreate without duplicate factory calls", () => {
    const cache = new WorkerCache<string>({ maxEntries: 3 });
    let calls = 0;

    const first = cache.getOrCreate("key", () => {
      calls += 1;
      return "value";
    });
    const second = cache.getOrCreate("key", () => {
      calls += 1;
      return "other";
    });

    expect(first).toBe("value");
    expect(second).toBe("value");
    expect(calls).toBe(1);
  });

  it("creates deterministic cipher worker cache keys", () => {
    const first = createCipherWorkerCacheKey({
      algorithm: "AES",
      operation: "encrypt",
      input: "hello",
      options: { iv: "1", key: "2" },
    });

    const second = createCipherWorkerCacheKey({
      algorithm: "AES",
      operation: "encrypt",
      input: "hello",
      options: { key: "2", iv: "1" },
    });

    expect(first).toBe(second);
  });

  it("stores and reads cached worker results through helper functions", () => {
    const cache = new WorkerCache<string>();
    const request = {
      algorithm: "SHA-256",
      operation: "hash" as const,
      input: "hello",
    };

    expect(getCachedWorkerResult(cache, request)).toBeUndefined();
    setCachedWorkerResult(cache, request, "digest");
    expect(getCachedWorkerResult(cache, request)).toBe("digest");
  });

  it("wraps worker execution with shared cache when enabled", () => {
    let calls = 0;
    const request = {
      algorithm: "XXHash",
      operation: "hash" as const,
      input: "hello",
      version: `test-${Math.random()}`,
    };

    const first = withWorkerCache(request, () => {
      calls += 1;
      return "result";
    });

    const second = withWorkerCache(request, () => {
      calls += 1;
      return "other";
    });

    expect(first).toBe("result");
    expect(second).toBe("result");
    expect(calls).toBe(1);
  });

  it("bypasses cache when disabled", () => {
    let calls = 0;
    const request = {
      algorithm: "AES",
      operation: "encrypt" as const,
      input: "hello",
      version: `disabled-${Math.random()}`,
    };

    withWorkerCache(
      request,
      () => {
        calls += 1;
        return "one";
      },
      { enabled: false },
    );

    withWorkerCache(
      request,
      () => {
        calls += 1;
        return "two";
      },
      { enabled: false },
    );

    expect(calls).toBe(2);
  });
});
