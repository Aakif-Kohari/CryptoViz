import {
  RELIABILITY_BASELINE_CRITERIA,
  buildReliabilityReleaseChecklist,
  createDefaultReliabilityResults,
  getReliabilityStatusTone,
  summarizeReliabilityResults,
} from "../../lib/quality/reliabilityBaseline";

export default function ReliabilityBaselineDashboard() {
  const results = createDefaultReliabilityResults("warn");
  const summary = summarizeReliabilityResults(results);
  const checklist = buildReliabilityReleaseChecklist();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
          <div className="relative isolate px-6 py-10 sm:px-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.24),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_34%)]" />
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Release quality
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Reliability Baseline
            </h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
              A shared checklist for prioritizing bug fixes, validating
              correctness, and keeping releases focused on stable CryptoViz
              behavior before adding more features.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric label="Criteria" value={summary.total} />
          <Metric
            label="Required blockers"
            value={summary.requiredFailures.length}
          />
          <Metric label="Warnings" value={summary.warnings} />
          <Metric
            label="Release state"
            value={summary.releasable ? "Ready" : "Needs evidence"}
          />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black text-white">Baseline criteria</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Required items block release when they fail. Optional items should
            still be checked for touched UI, security, documentation, and
            performance areas.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {RELIABILITY_BASELINE_CRITERIA.map((criterion) => (
              <article
                key={criterion.id}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                    {criterion.area}
                  </span>
                  {criterion.required ? (
                    <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-200">
                      Required
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 text-xl font-black text-white">
                  {criterion.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {criterion.description}
                </p>
                <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/70 p-3 text-sm font-bold text-slate-300">
                  {criterion.verification}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">
              Default release checklist
            </h2>
            <ol className="mt-5 grid gap-3">
              {checklist.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-slate-300"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-slate-950">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </article>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">
              Current default state
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The dashboard starts in a warning state until checks are backed by
              evidence in a PR.
            </p>

            <div className="mt-5 grid gap-3">
              {results.slice(0, 5).map((result) => (
                <div
                  key={result.criterionId}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
                    {getReliabilityStatusTone(result.status)}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {result.message}
                  </p>
                  {result.evidence ? (
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {result.evidence}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-all text-2xl font-black text-white">{value}</p>
    </div>
  );
}
