export type BenchmarkMetric = "throughput" | "latency" | "memory"

export interface BenchmarkRun {
  id: string
  date: string
  algorithm: string
  throughputMbps: number
  latencyMs: number
  memoryKb: number
  notes: string
}

export interface BenchmarkHistoryInput {
  selectedAlgorithm: string
  metric: BenchmarkMetric
}

export interface BenchmarkTimelinePoint {
  id: string
  date: string
  algorithm: string
  value: number
  formattedValue: string
  deltaFromPrevious: number | null
  trend: "first" | "improved" | "regressed" | "unchanged"
  notes: string
}

export interface BenchmarkAlgorithmSummary {
  algorithm: string
  runs: number
  latestValue: number
  bestValue: number
  worstValue: number
  averageValue: number
  latestDate: string
  trend: "improving" | "regressing" | "stable" | "single-run"
}

export interface BenchmarkHistoryResult {
  input: BenchmarkHistoryInput
  algorithms: string[]
  points: BenchmarkTimelinePoint[]
  summaries: BenchmarkAlgorithmSummary[]
  metricLabel: string
  metricUnit: string
  explanation: string
}

export const DEFAULT_BENCHMARK_HISTORY_INPUT: BenchmarkHistoryInput = {
  selectedAlgorithm: "AES-GCM",
  metric: "throughput",
}

export const BENCHMARK_HISTORY_RUNS: BenchmarkRun[] = [
  {
    id: "run-001",
    date: "2026-07-01",
    algorithm: "AES-GCM",
    throughputMbps: 810,
    latencyMs: 1.42,
    memoryKb: 184,
    notes: "Initial browser worker benchmark with default chunk size.",
  },
  {
    id: "run-002",
    date: "2026-07-04",
    algorithm: "AES-GCM",
    throughputMbps: 842,
    latencyMs: 1.35,
    memoryKb: 181,
    notes: "Reduced message-copy overhead in worker transfer path.",
  },
  {
    id: "run-003",
    date: "2026-07-08",
    algorithm: "AES-GCM",
    throughputMbps: 865,
    latencyMs: 1.29,
    memoryKb: 178,
    notes: "Buffer reuse improved encryption throughput.",
  },
  {
    id: "run-004",
    date: "2026-07-12",
    algorithm: "AES-GCM",
    throughputMbps: 858,
    latencyMs: 1.31,
    memoryKb: 177,
    notes: "Minor regression after additional trace instrumentation.",
  },
  {
    id: "run-005",
    date: "2026-07-16",
    algorithm: "AES-GCM",
    throughputMbps: 892,
    latencyMs: 1.22,
    memoryKb: 174,
    notes: "Trace sampling changed from every block to selected checkpoints.",
  },
  {
    id: "run-006",
    date: "2026-07-01",
    algorithm: "ChaCha20",
    throughputMbps: 760,
    latencyMs: 1.58,
    memoryKb: 156,
    notes: "Initial stream cipher benchmark.",
  },
  {
    id: "run-007",
    date: "2026-07-04",
    algorithm: "ChaCha20",
    throughputMbps: 784,
    latencyMs: 1.51,
    memoryKb: 154,
    notes: "Loop unrolling in quarter-round helper.",
  },
  {
    id: "run-008",
    date: "2026-07-08",
    algorithm: "ChaCha20",
    throughputMbps: 801,
    latencyMs: 1.47,
    memoryKb: 153,
    notes: "Reduced state-array allocations.",
  },
  {
    id: "run-009",
    date: "2026-07-12",
    algorithm: "ChaCha20",
    throughputMbps: 799,
    latencyMs: 1.49,
    memoryKb: 153,
    notes: "Stable run after documentation-only changes.",
  },
  {
    id: "run-010",
    date: "2026-07-16",
    algorithm: "ChaCha20",
    throughputMbps: 815,
    latencyMs: 1.43,
    memoryKb: 151,
    notes: "Improved block counter handling.",
  },
  {
    id: "run-011",
    date: "2026-07-01",
    algorithm: "SHA-256",
    throughputMbps: 610,
    latencyMs: 2.08,
    memoryKb: 122,
    notes: "Initial hash benchmark.",
  },
  {
    id: "run-012",
    date: "2026-07-04",
    algorithm: "SHA-256",
    throughputMbps: 628,
    latencyMs: 2.02,
    memoryKb: 121,
    notes: "Message schedule array reused per chunk.",
  },
  {
    id: "run-013",
    date: "2026-07-08",
    algorithm: "SHA-256",
    throughputMbps: 641,
    latencyMs: 1.97,
    memoryKb: 120,
    notes: "Reduced conversions between bytes and words.",
  },
  {
    id: "run-014",
    date: "2026-07-12",
    algorithm: "SHA-256",
    throughputMbps: 646,
    latencyMs: 1.95,
    memoryKb: 120,
    notes: "Small improvement from helper inlining.",
  },
  {
    id: "run-015",
    date: "2026-07-16",
    algorithm: "SHA-256",
    throughputMbps: 659,
    latencyMs: 1.9,
    memoryKb: 119,
    notes: "Cleaner compression loop with fewer temporary objects.",
  },
]

const METRIC_CONFIG: Record<
  BenchmarkMetric,
  {
    label: string
    unit: string
    higherIsBetter: boolean
    getValue: (run: BenchmarkRun) => number
  }
> = {
  throughput: {
    label: "Throughput",
    unit: "MB/s",
    higherIsBetter: true,
    getValue: (run) => run.throughputMbps,
  },
  latency: {
    label: "Latency",
    unit: "ms",
    higherIsBetter: false,
    getValue: (run) => run.latencyMs,
  },
  memory: {
    label: "Memory",
    unit: "KB",
    higherIsBetter: false,
    getValue: (run) => run.memoryKb,
  },
}

export function getBenchmarkAlgorithms(runs: BenchmarkRun[] = BENCHMARK_HISTORY_RUNS): string[] {
  return Array.from(new Set(runs.map((run) => run.algorithm))).sort()
}

export function validateBenchmarkHistoryInput(input: BenchmarkHistoryInput): BenchmarkHistoryInput {
  const algorithms = getBenchmarkAlgorithms()

  if (!algorithms.includes(input.selectedAlgorithm)) {
    throw new Error("Selected algorithm is not available in benchmark history.")
  }

  if (!["throughput", "latency", "memory"].includes(input.metric)) {
    throw new Error("Unsupported benchmark metric.")
  }

  return input
}

function formatMetric(value: number, metric: BenchmarkMetric): string {
  const config = METRIC_CONFIG[metric]
  const decimals = metric === "throughput" || metric === "memory" ? 0 : 2
  return `${value.toFixed(decimals)} ${config.unit}`
}

function compareTrend(
  current: number,
  previous: number | null,
  metric: BenchmarkMetric,
): BenchmarkTimelinePoint["trend"] {
  if (previous === null) return "first"
  if (current === previous) return "unchanged"

  const higherIsBetter = METRIC_CONFIG[metric].higherIsBetter
  const improved = higherIsBetter ? current > previous : current < previous
  return improved ? "improved" : "regressed"
}

export function buildTimelinePoints(
  algorithm: string,
  metric: BenchmarkMetric,
  runs: BenchmarkRun[] = BENCHMARK_HISTORY_RUNS,
): BenchmarkTimelinePoint[] {
  const config = METRIC_CONFIG[metric]
  const filteredRuns = runs
    .filter((run) => run.algorithm === algorithm)
    .sort((a, b) => a.date.localeCompare(b.date))

  let previousValue: number | null = null

  return filteredRuns.map((run) => {
    const value = config.getValue(run)
    const delta = previousValue === null ? null : value - previousValue
    const point: BenchmarkTimelinePoint = {
      id: run.id,
      date: run.date,
      algorithm: run.algorithm,
      value,
      formattedValue: formatMetric(value, metric),
      deltaFromPrevious: delta,
      trend: compareTrend(value, previousValue, metric),
      notes: run.notes,
    }
    previousValue = value
    return point
  })
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function summaryTrend(values: number[], metric: BenchmarkMetric): BenchmarkAlgorithmSummary["trend"] {
  if (values.length <= 1) return "single-run"
  const first = values[0]
  const latest = values.at(-1) ?? first

  if (latest === first) return "stable"

  const higherIsBetter = METRIC_CONFIG[metric].higherIsBetter
  const improving = higherIsBetter ? latest > first : latest < first
  return improving ? "improving" : "regressing"
}

export function buildAlgorithmSummaries(
  metric: BenchmarkMetric,
  runs: BenchmarkRun[] = BENCHMARK_HISTORY_RUNS,
): BenchmarkAlgorithmSummary[] {
  const config = METRIC_CONFIG[metric]

  return getBenchmarkAlgorithms(runs).map((algorithm) => {
    const algorithmRuns = runs
      .filter((run) => run.algorithm === algorithm)
      .sort((a, b) => a.date.localeCompare(b.date))
    const values = algorithmRuns.map(config.getValue)
    const latestRun = algorithmRuns.at(-1)

    return {
      algorithm,
      runs: algorithmRuns.length,
      latestValue: values.at(-1) ?? 0,
      bestValue: config.higherIsBetter ? Math.max(...values) : Math.min(...values),
      worstValue: config.higherIsBetter ? Math.min(...values) : Math.max(...values),
      averageValue: average(values),
      latestDate: latestRun?.date ?? "",
      trend: summaryTrend(values, metric),
    }
  })
}

export function runBenchmarkHistoryTimeline(
  rawInput: BenchmarkHistoryInput,
): BenchmarkHistoryResult {
  const input = validateBenchmarkHistoryInput(rawInput)
  const config = METRIC_CONFIG[input.metric]

  return {
    input,
    algorithms: getBenchmarkAlgorithms(),
    points: buildTimelinePoints(input.selectedAlgorithm, input.metric),
    summaries: buildAlgorithmSummaries(input.metric),
    metricLabel: config.label,
    metricUnit: config.unit,
    explanation:
      "Benchmark history helps distinguish one-off performance changes from sustained trends across repeated runs. Use the same environment and input sizes when comparing results.",
  }
}

export function buildBenchmarkHistoryManualChecklist(): string[] {
  return [
    "Open the Benchmark History Timeline page.",
    "Confirm the default AES-GCM throughput timeline renders.",
    "Switch algorithms and confirm timeline points update.",
    "Switch metric between throughput, latency, and memory and confirm units update.",
    "Confirm improved and regressed points use different trend labels.",
    "Confirm algorithm summary cards update for the selected metric.",
    "Resize to mobile width and confirm timeline and tables remain usable.",
  ]
}
