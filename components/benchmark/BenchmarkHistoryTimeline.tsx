"use client"

import { useMemo, useState } from "react"
import {
  DEFAULT_BENCHMARK_HISTORY_INPUT,
  buildBenchmarkHistoryManualChecklist,
  runBenchmarkHistoryTimeline,
  type BenchmarkHistoryInput,
  type BenchmarkMetric,
  type BenchmarkTimelinePoint,
} from "../../lib/benchmark/benchmarkHistoryTimeline"

function trendClass(trend: BenchmarkTimelinePoint["trend"]) {
  if (trend === "improved") return "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
  if (trend === "regressed") return "border-red-300/40 bg-red-300/10 text-red-100"
  if (trend === "unchanged") return "border-slate-300/30 bg-slate-300/10 text-slate-100"
  return "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
}

export default function BenchmarkHistoryTimeline() {
  const [input, setInput] = useState<BenchmarkHistoryInput>(
    DEFAULT_BENCHMARK_HISTORY_INPUT,
  )

  const result = useMemo(() => {
    try {
      return { value: runBenchmarkHistoryTimeline(input), error: null as string | null }
    } catch (caught) {
      return {
        value: null,
        error:
          caught instanceof Error
            ? caught.message
            : "Unable to render benchmark history timeline.",
      }
    }
  }, [input])

  const manualChecklist = buildBenchmarkHistoryManualChecklist()
  const maxPointValue = Math.max(...(result.value?.points.map((point) => point.value) ?? [1]))

  function updateInput<K extends keyof BenchmarkHistoryInput>(
    key: K,
    value: BenchmarkHistoryInput[K],
  ) {
    setInput((current) => ({ ...current, [key]: value }))
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
          <div className="relative isolate px-6 py-10 sm:px-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_32%)]" />
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Performance analysis
            </p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Benchmark History Timeline
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                  Track cryptographic benchmark results across multiple runs. Compare
                  throughput, latency, and memory trends to see whether a change is a
                  real improvement or a one-off fluctuation.
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <p className="text-sm font-bold text-cyan-100">Educational benchmark note</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  The timeline uses curated demo benchmark records so the feature is
                  deterministic and testable. Real benchmark data should be gathered in
                  a controlled environment.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Filters</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Choose which algorithm and benchmark metric to inspect.
            </p>

            <label className="mt-6 block text-sm font-bold text-slate-200">
              Algorithm
            </label>
            <select
              value={input.selectedAlgorithm}
              onChange={(event) => updateInput("selectedAlgorithm", event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
            >
              {result.value?.algorithms.map((algorithm) => (
                <option key={algorithm} value={algorithm}>
                  {algorithm}
                </option>
              ))}
            </select>

            <label className="mt-5 block text-sm font-bold text-slate-200">
              Metric
            </label>
            <select
              value={input.metric}
              onChange={(event) => updateInput("metric", event.target.value as BenchmarkMetric)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
            >
              <option value="throughput">Throughput</option>
              <option value="latency">Latency</option>
              <option value="memory">Memory</option>
            </select>

            <button
              type="button"
              onClick={() => setInput(DEFAULT_BENCHMARK_HISTORY_INPUT)}
              className="mt-6 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-100"
            >
              Reset timeline
            </button>

            {result.error ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100"
              >
                {result.error}
              </div>
            ) : null}
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">
              {result.value?.metricLabel ?? "Metric"} timeline
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {result.value?.explanation}
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {result.value?.points.map((point) => (
                <article
                  key={point.id}
                  className={`rounded-2xl border p-4 ${trendClass(point.trend)}`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] opacity-70">
                        {point.date}
                      </p>
                      <p className="mt-1 text-2xl font-black">{point.formattedValue}</p>
                    </div>
                    <span className="rounded-full border border-current/30 px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
                      {point.trend}
                    </span>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-950/50">
                    <div
                      className="h-full rounded-full bg-current"
                      style={{ width: `${Math.max(8, (point.value / maxPointValue) * 100)}%` }}
                    />
                  </div>

                  <p className="mt-3 text-sm leading-6 opacity-90">{point.notes}</p>
                  <p className="mt-2 font-mono text-xs opacity-80">
                    delta: {point.deltaFromPrevious === null ? "first run" : point.deltaFromPrevious.toFixed(2)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </section>

        {result.value ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Algorithm summaries</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Summary cards compare each algorithm using the currently selected metric.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {result.value.summaries.map((summary) => (
                <article
                  key={summary.algorithm}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black text-white">{summary.algorithm}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {summary.runs} runs · latest {summary.latestDate}
                      </p>
                    </div>
                    <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
                      {summary.trend}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Metric label="Latest" value={summary.latestValue.toFixed(input.metric === "latency" ? 2 : 0)} />
                    <Metric label="Best" value={summary.bestValue.toFixed(input.metric === "latency" ? 2 : 0)} />
                    <Metric label="Worst" value={summary.worstValue.toFixed(input.metric === "latency" ? 2 : 0)} />
                    <Metric label="Average" value={summary.averageValue.toFixed(input.metric === "latency" ? 2 : 0)} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {result.value ? (
          <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-black text-white">Run table</h2>
              <div className="mt-5 max-h-96 overflow-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[780px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 bg-slate-900 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Algorithm</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3">Trend</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.value.points.map((point) => (
                      <tr key={point.id} className="border-t border-white/5">
                        <td className="px-4 py-3 font-mono text-slate-300">{point.date}</td>
                        <td className="px-4 py-3 font-semibold text-white">{point.algorithm}</td>
                        <td className="px-4 py-3 font-mono text-cyan-100">{point.formattedValue}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${trendClass(point.trend)}`}>
                            {point.trend}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{point.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-black text-white">Manual testing checklist</h2>
              <ol className="mt-5 space-y-3">
                {manualChecklist.map((item, index) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-slate-950">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </aside>
          </section>
        ) : null}
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-lg font-black text-cyan-100">{value}</p>
    </div>
  )
}
