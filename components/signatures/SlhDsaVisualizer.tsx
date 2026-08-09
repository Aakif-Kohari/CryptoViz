"use client";

import { useMemo, useState } from "react";
import {
  SLH_DSA_PARAMETER_SETS,
  buildSlhDsaManualChecklist,
  buildSlhDsaVisualization,
  getSlhDsaConceptCards,
} from "../../lib/signatures/slhDsaVisualizer";

export default function SlhDsaVisualizer() {
  const [message, setMessage] = useState("CryptoViz post-quantum signature");
  const [parameterSetName, setParameterSetName] = useState(
    SLH_DSA_PARAMETER_SETS[0].name,
  );

  const model = useMemo(
    () => buildSlhDsaVisualization(message, parameterSetName),
    [message, parameterSetName],
  );
  const conceptCards = getSlhDsaConceptCards();
  const checklist = buildSlhDsaManualChecklist();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
          <div className="relative isolate px-6 py-10 sm:px-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.24),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_34%)]" />
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Post-quantum signatures
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
              SLH-DSA / SPHINCS+ Visualizer
            </h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
              Explore how a stateless hash-based signature connects FORS, WOTS+,
              and an XMSS-style hypertree so a verifier can recompute the public
              root.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Controls</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              This is an educational visualization. It uses toy hashes for
              readable traces, not a production SLH-DSA implementation.
            </p>

            <label className="mt-6 block text-sm font-bold text-slate-200">
              Message
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
              />
            </label>

            <label className="mt-5 block text-sm font-bold text-slate-200">
              Parameter set
              <select
                value={parameterSetName}
                onChange={(event) => setParameterSetName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
              >
                {SLH_DSA_PARAMETER_SETS.map((params) => (
                  <option key={params.name} value={params.name}>
                    {params.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Metric
                label="Security level"
                value={`Level ${model.parameterSet.securityLevel}`}
              />
              <Metric
                label="Tree height"
                value={model.parameterSet.treeHeight}
              />
              <Metric
                label="Layers"
                value={model.parameterSet.hypertreeLayers}
              />
              <Metric label="FORS trees" value={model.parameterSet.forsTrees} />
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">
              Signature overview
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {model.parameterSet.note}
            </p>

            <div className="mt-5 grid gap-4">
              <Metric label="Message digest" value={model.messageDigest} mono />
              <Metric label="Computed public root" value={model.root} mono />
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric
                  label="Estimated signature"
                  value={`${model.signatureSizeEstimateBytes.toLocaleString()} bytes`}
                />
                <Metric
                  label="FORS height"
                  value={model.parameterSet.forsHeight}
                />
                <Metric
                  label="Verification"
                  value={model.accepted ? "accepted" : "rejected"}
                />
              </div>
            </div>
          </section>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {conceptCards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                Concept
              </p>
              <h2 className="mt-3 text-xl font-black text-white">
                {card.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {card.description}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black text-white">FORS reveal</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            The digest selects one leaf from each FORS tree. Each reveal
            includes a secret leaf and a compact displayed authentication path.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {model.forsReveals.slice(0, 9).map((reveal) => (
              <article
                key={reveal.treeIndex}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  FORS tree {reveal.treeIndex + 1}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Selected leaf: {reveal.leafIndex}
                </p>
                <p className="mt-2 break-all font-mono text-xs text-cyan-100">
                  secret {reveal.secret}
                </p>
                <p className="mt-1 break-all font-mono text-xs text-amber-100">
                  leaf {reveal.publicLeaf}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {reveal.authPath.map((node, index) => (
                    <span
                      key={`${node}-${index}`}
                      className="rounded bg-slate-950 px-2 py-1 font-mono text-[10px] text-slate-300"
                    >
                      {node.slice(0, 6)}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Hypertree path</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Verification starts at the FORS public key, checks WOTS+
              signatures, and climbs layer by layer until reaching the public
              root.
            </p>

            <div className="mt-5 grid gap-3">
              {model.hypertree.map((node) => (
                <div
                  key={`${node.layer}-${node.hash}`}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-black text-white">{node.label}</p>
                    <p className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">
                      layer {node.layer}
                    </p>
                  </div>
                  <p className="mt-2 break-all font-mono text-sm text-cyan-100">
                    {node.hash}
                  </p>
                  {node.parentHash ? (
                    <p className="mt-2 break-all font-mono text-xs text-slate-500">
                      parent → {node.parentHash}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">
              Verification steps
            </h2>
            <div className="mt-5 grid gap-3">
              {model.verificationSteps.map((step) => (
                <div
                  key={step.label}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                >
                  <p className="text-sm font-black text-white">{step.label}</p>
                  <p className="mt-2 font-mono text-xs text-cyan-100">
                    {step.formula}
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-amber-100">
                    {step.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {step.note}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">
              Standards references
            </h2>
            <ul className="mt-5 grid gap-3">
              {model.references.map((reference) => (
                <li
                  key={reference}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm font-bold text-slate-300"
                >
                  {reference}
                </li>
              ))}
            </ul>
          </aside>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">
              Manual test checklist
            </h2>
            <ol className="mt-5 grid gap-3 md:grid-cols-2">
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
          </aside>
        </section>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 break-all text-lg font-black text-white ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
