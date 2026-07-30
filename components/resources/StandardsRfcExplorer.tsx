"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_STANDARDS_FILTER,
  buildStandardsExplorerResult,
  buildStandardsManualChecklist,
  type StandardsFilter,
} from "../../lib/resources/standardsRfcExplorer";

export default function StandardsRfcExplorer() {
  const [filters, setFilters] = useState<StandardsFilter>(
    DEFAULT_STANDARDS_FILTER,
  );

  const result = useMemo(
    () => buildStandardsExplorerResult(filters),
    [filters],
  );
  const manualChecklist = buildStandardsManualChecklist();

  function updateFilter<K extends keyof StandardsFilter>(
    key: K,
    value: StandardsFilter[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
          <div className="relative isolate px-6 py-10 sm:px-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_32%)]" />
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Standards index
            </p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Standards & RFC Explorer
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                  Explore important cryptography RFCs, FIPS standards, and NIST
                  publications. Filter by type, topic, status, or keyword to
                  connect CryptoViz visualizers with authoritative references.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <Metric label="Total" value={result.summary.total} />
                <Metric label="RFCs" value={result.summary.rfc} />
                <Metric label="FIPS" value={result.summary.fips} />
                <Metric label="NIST" value={result.summary.nist} />
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Filters</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Search the index or narrow it by publication type, topic, or
              status.
            </p>

            <label className="mt-6 block text-sm font-bold text-slate-200">
              Search
            </label>
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search TLS, AES, SHA, HKDF..."
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 placeholder:text-slate-600 focus:ring-2"
            />

            <label className="mt-5 block text-sm font-bold text-slate-200">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(event) =>
                updateFilter(
                  "type",
                  event.target.value as StandardsFilter["type"],
                )
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
            >
              {result.types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <label className="mt-5 block text-sm font-bold text-slate-200">
              Topic
            </label>
            <select
              value={filters.topic}
              onChange={(event) => updateFilter("topic", event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
            >
              {result.topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>

            <label className="mt-5 block text-sm font-bold text-slate-200">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(event) =>
                updateFilter(
                  "status",
                  event.target.value as StandardsFilter["status"],
                )
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
            >
              {result.statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setFilters(DEFAULT_STANDARDS_FILTER)}
              className="mt-6 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-100"
            >
              Reset filters
            </button>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Featured reference
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {result.featured
                    ? `${result.featured.number} · ${result.featured.topic}`
                    : "No publication matches the selected filters."}
                </p>
              </div>
              <p className="text-sm font-bold text-cyan-100">
                {result.standards.length} result
                {result.standards.length === 1 ? "" : "s"}
              </p>
            </div>

            {result.featured ? (
              <article className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
                      {result.featured.type} · {result.featured.year}
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-white">
                      {result.featured.title}
                    </h3>
                  </div>
                  <StatusBadge status={result.featured.status} />
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {result.featured.summary}
                </p>
                <p className="mt-3 rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm leading-7 text-slate-300">
                  <span className="font-bold text-white">Why it matters:</span>{" "}
                  {result.featured.relevance}
                </p>

                <a
                  href={result.featured.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-xl border border-cyan-300/40 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/10"
                >
                  Open source document
                </a>
              </article>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm text-amber-100">
                No standards match these filters. Reset filters or try a broader
                search.
              </div>
            )}
          </section>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black text-white">Indexed standards</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Each card links a standard to CryptoViz learning topics and
            visualizer concepts.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {result.standards.map((standard) => (
              <article
                key={standard.id}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                      {standard.number}
                    </p>
                    <h3 className="mt-2 text-xl font-black text-white">
                      {standard.title}
                    </h3>
                  </div>
                  <StatusBadge status={standard.status} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateFilter("type", standard.type)}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-bold text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-100"
                  >
                    {standard.type}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFilter("topic", standard.topic)}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-bold text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-100"
                  >
                    {standard.topic}
                  </button>
                  {standard.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {standard.summary}
                </p>
                <p className="mt-3 rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm leading-6 text-slate-400">
                  {standard.relevance}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-400">
                    {standard.year}
                  </span>
                  <a
                    href={standard.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-cyan-100 hover:text-cyan-200"
                  >
                    Open document
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black text-white">
            Manual testing checklist
          </h2>
          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            {manualChecklist.map((item, index) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm leading-6 text-slate-300"
              >
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
    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "Active"
      ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
      : status === "Superseded"
        ? "border-red-300/40 bg-red-300/10 text-red-100"
        : "border-amber-300/40 bg-amber-300/10 text-amber-100";

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-black ${className}`}
    >
      {status}
    </span>
  );
}
