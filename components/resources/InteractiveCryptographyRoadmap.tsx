"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_ROADMAP_FILTER,
  DEFAULT_ROADMAP_PROGRESS,
  buildRoadmapManualChecklist,
  buildRoadmapResult,
  setRoadmapNodeStatus,
  type RoadmapFilter,
  type RoadmapProgress,
  type RoadmapStatus,
} from "../../lib/resources/cryptographyRoadmap";

function statusClass(status: RoadmapStatus, locked: boolean) {
  if (locked) return "border-slate-600 bg-slate-900/80 text-slate-400";
  if (status === "completed") return "border-emerald-300/40 bg-emerald-300/10 text-emerald-100";
  if (status === "in-progress") return "border-amber-300/40 bg-amber-300/10 text-amber-100";
  return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
}

export default function InteractiveCryptographyRoadmap() {
  const [filters, setFilters] = useState<RoadmapFilter>(DEFAULT_ROADMAP_FILTER);
  const [progress, setProgress] = useState<RoadmapProgress>(DEFAULT_ROADMAP_PROGRESS);
  const result = useMemo(() => buildRoadmapResult(filters, progress), [filters, progress]);
  const checklist = buildRoadmapManualChecklist();

  function updateFilter<K extends keyof RoadmapFilter>(key: K, value: RoadmapFilter[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function updateStatus(nodeId: string, status: RoadmapStatus) {
    setProgress((current) => setRoadmapNodeStatus(current, nodeId, status));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
          <div className="relative isolate px-6 py-10 sm:px-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.18),transparent_32%)]" />
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">Learning path</p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Interactive Cryptography Roadmap
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                  Follow a guided path from fundamentals to cryptanalysis. Track progress,
                  unlock dependent topics, and jump into CryptoViz resources at the right time.
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <p className="text-sm font-bold text-cyan-100">Next recommended</p>
                <p className="mt-2 text-2xl font-black text-white">
                  {result.nextRecommended?.title ?? "Roadmap complete"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {result.nextRecommended?.description ?? "All available roadmap nodes are completed."}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Metric label="Total topics" value={result.summary.total} />
          <Metric label="Completed" value={result.summary.completed} />
          <Metric label="In progress" value={result.summary.inProgress} />
          <Metric label="Not started" value={result.summary.notStarted} />
          <Metric label="Remaining" value={`${result.summary.estimatedMinutesRemaining} min`} />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Progress</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Mark topics as you learn. Completion updates instantly in this page.
              </p>
            </div>
            <p className="text-4xl font-black text-cyan-100">{result.summary.completionPercent}%</p>
          </div>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-900">
            <div className="h-full rounded-full bg-cyan-300" style={{ width: `${result.summary.completionPercent}%` }} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Filters</h2>

            <label className="mt-6 block text-sm font-bold text-slate-200">Search</label>
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search AES, hashing, KDF..."
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 placeholder:text-slate-600 focus:ring-2"
            />

            <label className="mt-5 block text-sm font-bold text-slate-200">Level</label>
            <select
              value={filters.level}
              onChange={(event) => updateFilter("level", event.target.value as RoadmapFilter["level"])}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
            >
              {result.levels.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>

            <label className="mt-5 block text-sm font-bold text-slate-200">Category</label>
            <select
              value={filters.category}
              onChange={(event) => updateFilter("category", event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
            >
              {result.categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>

            <button
              type="button"
              onClick={() => setFilters(DEFAULT_ROADMAP_FILTER)}
              className="mt-6 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-100"
            >
              Reset filters
            </button>

            <button
              type="button"
              onClick={() => setProgress(DEFAULT_ROADMAP_PROGRESS)}
              className="mt-3 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-100"
            >
              Reset progress
            </button>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Roadmap topics</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {result.nodes.length} topic{result.nodes.length === 1 ? "" : "s"} match the current filters.
            </p>

            <div className="mt-5 grid gap-5">
              {result.nodes.map((node) => (
                <article key={node.id} className={`rounded-2xl border p-5 ${statusClass(node.status, node.locked)}`}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-current/30 px-2.5 py-1 text-xs font-black">{node.level}</span>
                        <span className="rounded-full border border-current/30 px-2.5 py-1 text-xs font-black">{node.category}</span>
                        {node.locked ? <span className="rounded-full border border-slate-500/40 px-2.5 py-1 text-xs font-black text-slate-400">locked</span> : null}
                      </div>
                      <h3 className="mt-3 text-2xl font-black text-white">{node.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{node.description}</p>
                      <p className="mt-3 text-sm font-bold text-cyan-100">Estimated time: {node.estimatedMinutes} minutes</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(["not-started", "in-progress", "completed"] as RoadmapStatus[]).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateStatus(node.id, status)}
                          disabled={node.locked && status !== "not-started"}
                          className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
                            node.status === status
                              ? "border-cyan-300 bg-cyan-300 text-slate-950"
                              : "border-white/10 text-slate-300 hover:border-cyan-300/50 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
                          }`}
                        >
                          {status.replace("-", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {node.dependencyLabels.length > 0 ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
                      <span className="font-bold text-white">Prerequisites:</span> {node.dependencyLabels.join(", ")}
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-black text-white">Learning outcomes</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300">
                        {node.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-black text-white">Related resources</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {node.resources.map((resource) => (
                          <span key={resource} className="rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1 text-xs font-bold text-slate-300">
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black text-white">Manual testing checklist</h2>
          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            {checklist.map((item, index) => (
              <li key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm leading-6 text-slate-300">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-slate-950">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}
