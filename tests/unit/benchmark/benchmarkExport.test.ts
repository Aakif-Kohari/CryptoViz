import { describe, expect, it } from "vitest";
import type { BenchmarkResult, DeviceInfo } from "@/types/benchmark";
import {
  BENCHMARK_EXPORT_SCHEMA,
  BENCHMARK_EXPORT_SCHEMA_VERSION,
  exportBenchmarkAsJson,
  exportBenchmarkAsMarkdown,
} from "@/lib/benchmark/benchmarkExport";

const environment: DeviceInfo = {
  userAgent: "Mozilla/5.0 TestBrowser/1.0",
  hardwareConcurrency: 8,
  language: "en-US",
  platform: "Win32",
  timezone: "Africa/Lagos",
  screen: {
    width: 1920,
    height: 1080,
    colorDepth: 24,
    pixelDepth: 24,
  },
};

const results: BenchmarkResult[] = [
  {
    cipherId: "aes",
    cipherName: "AES|256",
    category: "symmetric",
    inputSize: 1024,
    direction: "encrypt",
    iterations: 100,
    averageTime: 1.234567,
    minTime: 1.001,
    maxTime: 1.98765,
    stdDev: 0.25,
    totalTime: 123.4567,
    operationsPerSecond: 810.005,
    timestamp: new Date("2026-08-17T12:00:00.000Z"),
    workerExecutionTime: 1.5,
    renderTime: 3.2,
    memoryUsage: 4096,
    implementation: "JavaScript",
    status: "success",
  },
  {
    cipherId: "sha256",
    cipherName: "SHA-256",
    category: "hash",
    inputSize: 2048,
    direction: "hash",
    iterations: 100,
    averageTime: 0.5,
    minTime: 0.4,
    maxTime: 0.8,
    stdDev: 0.1,
    totalTime: 50,
    operationsPerSecond: 2000,
    timestamp: new Date("2026-08-17T12:00:01.000Z"),
    memoryUsage: undefined,
  },
];

describe("benchmark exporters", () => {
  it("generates a valid GitHub-flavored Markdown table", () => {
    const markdown = exportBenchmarkAsMarkdown(results, environment);

    expect(markdown).toContain(
      "| Cipher | Category | Average Time | Ops/sec | Memory Growth | Environment |",
    );
    expect(markdown).toContain("| --- | --- | ---: | ---: | ---: | --- |");
    expect(markdown).toContain("AES\\|256");
    expect(markdown).toContain("1.2346 ms");
    expect(markdown).toContain("810 ops/s");
    expect(markdown).toContain("4.00 KB");
    expect(markdown).toContain("8 logical cores");
    expect(markdown).toContain("UA: Mozilla/5.0 TestBrowser/1.0");
    expect(markdown).toContain("Warm-up runs: 1");
    expect(markdown).toContain("Measured iterations: 100");
  });

  it("includes the requested benchmark metadata and all metrics in JSON", () => {
    const json = exportBenchmarkAsJson(results, environment);
    const report = JSON.parse(json);

    expect(report.schema).toBe(BENCHMARK_EXPORT_SCHEMA);
    expect(report.schemaVersion).toBe(BENCHMARK_EXPORT_SCHEMA_VERSION);
    expect(report.timestamp).toBe("2026-08-17T12:00:00.000Z");
    expect(report.environment.userAgent).toBe(environment.userAgent);
    expect(report.environment.hardwareConcurrency).toBe(8);
    expect(report.benchmark.iterations).toBe(100);
    expect(report.benchmark.warmUpRuns).toBe(1);
    expect(report.benchmark.inputSizes).toEqual([1024, 2048]);
    expect(report.results).toHaveLength(2);

    expect(report.results[0]).toMatchObject({
      cipherId: "aes",
      averageTimeMs: 1.234567,
      operationsPerSecond: 810.005,
      memoryGrowthBytes: 4096,
      stdDevMs: 0.25,
      varianceMs2: 0.0625,
      workerExecutionTimeMs: 1.5,
      renderTimeMs: 3.2,
    });

    expect(report.results[1].memoryGrowthBytes).toBeNull();
  });

  it("returns a useful empty Markdown report", () => {
    const markdown = exportBenchmarkAsMarkdown([], environment);

    expect(markdown).toContain("# Benchmark Report");
    expect(markdown).toContain("No benchmark results are available.");
  });

  it("rejects invalid warm-up counts", () => {
    expect(() =>
      exportBenchmarkAsMarkdown(results, environment, { warmUpRuns: -1 }),
    ).toThrow("Warm-up runs must be a non-negative integer.");

    expect(() =>
      exportBenchmarkAsJson(results, environment, { warmUpRuns: 1.5 }),
    ).toThrow("Warm-up runs must be a non-negative integer.");
  });
});
