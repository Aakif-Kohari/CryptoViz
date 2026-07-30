import type { Metadata } from "next"
import BenchmarkHistoryTimeline from "../../../components/benchmark/BenchmarkHistoryTimeline"

export const metadata: Metadata = {
  title: "Benchmark History Timeline | CryptoViz",
  description:
    "Interactive benchmark history timeline for cryptographic algorithms, showing throughput, latency, memory, trend labels, and summaries.",
}

export default function BenchmarkHistoryTimelinePage() {
  return <BenchmarkHistoryTimeline />
}
