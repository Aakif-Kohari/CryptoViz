import { describe, expect, it } from "vitest"
import {
  BENCHMARK_HISTORY_RUNS,
  DEFAULT_BENCHMARK_HISTORY_INPUT,
  buildAlgorithmSummaries,
  buildBenchmarkHistoryManualChecklist,
  buildTimelinePoints,
  getBenchmarkAlgorithms,
  runBenchmarkHistoryTimeline,
  validateBenchmarkHistoryInput,
} from "../../../lib/benchmark/benchmarkHistoryTimeline"

describe("benchmark history timeline utilities", () => {
  it("lists available benchmark algorithms", () => {
    expect(getBenchmarkAlgorithms()).toEqual(["AES-GCM", "ChaCha20", "SHA-256"])
  })

  it("validates timeline input", () => {
    expect(validateBenchmarkHistoryInput(DEFAULT_BENCHMARK_HISTORY_INPUT)).toEqual(
      DEFAULT_BENCHMARK_HISTORY_INPUT,
    )

    expect(() =>
      validateBenchmarkHistoryInput({
        selectedAlgorithm: "Unknown",
        metric: "throughput",
      }),
    ).toThrow(/not available/i)
  })

  it("builds ordered timeline points with trend labels", () => {
    const points = buildTimelinePoints("AES-GCM", "throughput")

    expect(points).toHaveLength(5)
    expect(points[0].trend).toBe("first")
    expect(points[1].trend).toBe("improved")
    expect(points[3].trend).toBe("regressed")
  })

  it("handles lower-is-better metrics correctly", () => {
    const points = buildTimelinePoints("AES-GCM", "latency")

    expect(points[0].trend).toBe("first")
    expect(points[1].trend).toBe("improved")
    expect(points[3].trend).toBe("regressed")
  })

  it("builds algorithm summaries for the selected metric", () => {
    const summaries = buildAlgorithmSummaries("throughput")

    expect(summaries).toHaveLength(3)
    expect(summaries.find((summary) => summary.algorithm === "AES-GCM")?.trend).toBe(
      "improving",
    )
    expect(summaries.every((summary) => summary.runs === 5)).toBe(true)
  })

  it("runs benchmark history timeline result", () => {
    const result = runBenchmarkHistoryTimeline(DEFAULT_BENCHMARK_HISTORY_INPUT)

    expect(result.points).toHaveLength(5)
    expect(result.summaries).toHaveLength(3)
    expect(result.metricLabel).toBe("Throughput")
    expect(result.metricUnit).toBe("MB/s")
    expect(result.explanation).toMatch(/sustained trends/i)
  })

  it("contains stable demo run data", () => {
    expect(BENCHMARK_HISTORY_RUNS).toHaveLength(15)
    expect(BENCHMARK_HISTORY_RUNS[0]).toMatchObject({
      id: "run-001",
      algorithm: "AES-GCM",
    })
  })

  it("builds manual testing checklist", () => {
    const checklist = buildBenchmarkHistoryManualChecklist()

    expect(checklist[0]).toMatch(/open the benchmark history/i)
    expect(checklist).toContain(
      "Switch metric between throughput, latency, and memory and confirm units update.",
    )
  })
})
