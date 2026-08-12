"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_PQC_HUB_FILTER,
  buildPqcComparisonRows,
  buildPqcHubResult,
  buildPqcManualChecklist,
  type PqcDifficulty,
  type PqcHubFilter,
} from "../../lib/resources/postQuantumLearningHub";

function difficultyClass(difficulty: PqcDifficulty) {
  if (difficulty === "Advanced") return "border-red-300/40 bg-red-300/10 text-red-100";
  if (difficulty === "Intermediate") return "border-amber-300/40 bg-amber-300/10 text-amber-100";
  return "border-emerald-300/40 bg-emerald-300/10 text-emerald-100";
}

export default function PostQuantumLearningHub() {
  const [filters, setFilters] = useState<PqcHubFilter>(DEFAULT_PQC_HUB_FILTER);
  const result = useMemo(() => buildPqcHubResult(filters), [filters]);
  const comparisonRows = buildPqcComparisonRows();
  const checklist = buildPqcManualChecklist();

  function updateFilter<K extends keyof PqcHubFilter>(key: K, value: PqcHubFilter[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
          <div className="relative isolate px-6 py-10 sm:px-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_32%)]" />
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">Post-quantum cryptography</p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Post-Quantum Cryptography Learning Hub</h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                  Learn the big-picture differences between Kyber, Dilithium, Falcon, and SPHINCS+. Compare KEMs and signatures, see security assumptions, and connect each algorithm to CryptoViz resources.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <Metric label="Algorithms" value={result.summary.total} />
                <Metric label="KEM" value={result.summary.kem} />
                <Metric label="Signatures" value={result.summary.signatures} />
                <Metric label="Advanced" value={result.summary.advanced} />
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Filters</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Narrow the learning hub by family, difficulty, tag, or keyword.</p>
            <label className="mt-6 block text-sm font-bold text-slate-200">Search</label>
            <input value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Search lattice, hash-based, KEM..." className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 placeholder:text-slate-600 focus:ring-2" />
            <label className="mt-5 block text-sm font-bold text-slate-200">Family</label>
            <select value={filters.family} onChange={(event) => updateFilter("family", event.target.value as PqcHubFilter["family"])} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2">
              {result.families.map((family) => <option key={family} value={family}>{family}</option>)}
            </select>
            <label className="mt-5 block text-sm font-bold text-slate-200">Difficulty</label>
            <select value={filters.difficulty} onChange={(event) => updateFilter("difficulty", event.target.value as PqcHubFilter["difficulty"])} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2">
              {result.difficulties.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
            </select>
            <label className="mt-5 block text-sm font-bold text-slate-200">Tag</label>
            <select value={filters.tag} onChange={(event) => updateFilter("tag", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2">
              {result.tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
            <button type="button" onClick={() => setFilters(DEFAULT_PQC_HUB_FILTER)} className="mt-6 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-100">Reset filters</button>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Featured algorithm</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{result.featured ? `${result.featured.name} · ${result.featured.family}` : "No algorithm matches the selected filters."}</p>
              </div>
              <p className="text-sm font-bold text-cyan-100">{result.algorithms.length} result{result.algorithms.length === 1 ? "" : "s"}</p>
            </div>
            {result.featured ? (
              <article className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">{result.featured.status}</p>
                    <h3 className="mt-2 text-2xl font-black text-white">{result.featured.name}</h3>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${difficultyClass(result.featured.difficulty)}`}>{result.featured.difficulty}</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{result.featured.shortSummary}</p>
                <p className="mt-3 rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm leading-7 text-slate-300"><span className="font-bold text-white">Security basis:</span> {result.featured.securityBasis}</p>
                <p className="mt-3 rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm leading-7 text-slate-300"><span className="font-bold text-white">Primary use:</span> {result.featured.primaryUse}</p>
              </article>
            ) : <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm text-amber-100">No PQC algorithms match these filters. Reset filters or try a broader search.</div>}
          </section>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black text-white">Algorithm cards</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {result.algorithms.map((algorithm) => (
              <article key={algorithm.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">{algorithm.family}</p><h3 className="mt-2 text-2xl font-black text-white">{algorithm.name}</h3></div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${difficultyClass(algorithm.difficulty)}`}>{algorithm.difficulty}</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{algorithm.shortSummary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {algorithm.tags.map((tag) => <button key={tag} type="button" onClick={() => updateFilter("tag", tag)} className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-bold text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-100">{tag}</button>)}
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                  <ListBlock title="Key ideas" items={algorithm.keyIdeas} />
                  <ListBlock title="Strengths" items={algorithm.strengths} />
                  <ListBlock title="Tradeoffs" items={algorithm.tradeoffs} />
                </div>
                <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-sm font-bold text-white">CryptoViz connections</p>
                  <div className="mt-2 flex flex-wrap gap-2">{algorithm.visualizerConnections.map((connection) => <span key={connection} className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-300">{connection}</span>)}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Comparison table</h2>
            <div className="mt-5 overflow-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                <thead className="bg-slate-900 text-xs uppercase tracking-[0.18em] text-slate-400"><tr><th className="px-4 py-3">Algorithm</th><th className="px-4 py-3">Family</th><th className="px-4 py-3">Security basis</th><th className="px-4 py-3">Best for</th><th className="px-4 py-3">Tradeoff</th></tr></thead>
                <tbody>{comparisonRows.map((row) => <tr key={row.algorithm} className="border-t border-white/5"><td className="px-4 py-3 font-bold text-white">{row.algorithm}</td><td className="px-4 py-3 text-cyan-100">{row.family}</td><td className="px-4 py-3 text-slate-300">{row.basis}</td><td className="px-4 py-3 text-slate-300">{row.bestFor}</td><td className="px-4 py-3 text-slate-400">{row.tradeoff}</td></tr>)}</tbody>
              </table>
            </div>
          </article>
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Manual testing checklist</h2>
            <ol className="mt-5 space-y-3">{checklist.map((item, index) => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-slate-950">{index + 1}</span><span>{item}</span></li>)}</ol>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3"><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-white">{value}</p></div>;
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return <div><p className="text-sm font-black text-white">{title}</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}
