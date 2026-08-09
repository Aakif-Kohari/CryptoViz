"use client"

import { useMemo, useState } from "react"
import {
  DEFAULT_LINEAR_CRYPTOANALYSIS_INPUT,
  buildLinearCryptanalysisManualChecklist,
  runLinearCryptanalysisDemo,
  type LinearApproximation,
  type LinearCryptanalysisInput,
} from "../../lib/attacks/linearCryptanalysisDemo"

function strengthClass(strength: LinearApproximation["strength"]) {
  if (strength === "strong") return "border-red-300/40 bg-red-300/10 text-red-100"
  if (strength === "moderate") return "border-amber-300/40 bg-amber-300/10 text-amber-100"
  return "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
}

export default function LinearCryptanalysisDemo() {
  const [input, setInput] = useState<LinearCryptanalysisInput>(
    DEFAULT_LINEAR_CRYPTOANALYSIS_INPUT,
  )

  const result = useMemo(() => {
    try {
      return { value: runLinearCryptanalysisDemo(input), error: null as string | null }
    } catch (caught) {
      return {
        value: null,
        error:
          caught instanceof Error
            ? caught.message
            : "Unable to run linear cryptanalysis demo.",
      }
    }
  }, [input])

  const manualChecklist = buildLinearCryptanalysisManualChecklist()

  function updateInput<K extends keyof LinearCryptanalysisInput>(
    key: K,
    value: LinearCryptanalysisInput[K],
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
              Cryptanalysis
            </p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Linear Cryptanalysis Demo
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                  Explore how linear approximations can reveal statistical bias in a
                  tiny toy cipher. Choose masks, inspect plaintext/ciphertext pairs,
                  and see whether the relation holds more often than chance.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5">
                <p className="text-sm font-bold text-amber-100">Toy cipher only</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  This page uses a 4-bit educational S-box. It does not attack real
                  systems and does not implement production cryptanalysis tooling.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Approximation controls</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Masks select which bits are XORed together before comparing parity.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-slate-200">
                Plaintext mask
                <input
                  value={input.plaintextMask}
                  onChange={(event) => updateInput("plaintextMask", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 font-mono text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
                />
              </label>

              <label className="block text-sm font-bold text-slate-200">
                Ciphertext mask
                <input
                  value={input.ciphertextMask}
                  onChange={(event) => updateInput("ciphertextMask", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 font-mono text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
                />
              </label>

              <label className="block text-sm font-bold text-slate-200">
                Toy key nibble
                <input
                  value={input.keyNibble}
                  onChange={(event) => updateInput("keyNibble", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 font-mono text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
                />
              </label>

              <label className="block text-sm font-bold text-slate-200">
                Samples
                <input
                  type="number"
                  min={4}
                  max={64}
                  value={input.sampleCount}
                  onChange={(event) => updateInput("sampleCount", Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 font-mono text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => setInput(DEFAULT_LINEAR_CRYPTOANALYSIS_INPUT)}
              className="mt-6 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-100"
            >
              Reset demo
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
            <h2 className="text-2xl font-black text-white">Bias summary</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              A random relation should hold about 50% of the time. A larger distance
              from 50% means a stronger toy-cipher linear bias.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Metric label="Matches" value={result.value?.approximation.matches ?? "—"} />
              <Metric label="Misses" value={result.value?.approximation.misses ?? "—"} />
              <Metric
                label="Probability"
                value={
                  result.value
                    ? `${(result.value.approximation.probability * 100).toFixed(1)}%`
                    : "—"
                }
              />
              <div
                className={`rounded-2xl border p-4 ${
                  result.value
                    ? strengthClass(result.value.approximation.strength)
                    : "border-white/10 bg-slate-900/70 text-slate-300"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.24em] opacity-70">
                  Bias strength
                </p>
                <p className="mt-2 text-3xl font-black">
                  {result.value?.approximation.strength ?? "—"}
                </p>
              </div>
            </div>

            {result.value ? (
              <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-5">
                <p className="text-sm font-bold text-cyan-100">Explanation</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {result.value.explanation}
                </p>
                <p className="mt-3 font-mono text-sm text-white">
                  bias = {result.value.approximation.bias.toFixed(3)}
                </p>
              </div>
            ) : null}
          </section>
        </section>

        {result.value ? (
          <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-black text-white">Sample pairs</h2>
              <div className="mt-5 max-h-96 overflow-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 bg-slate-900 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Plain</th>
                      <th className="px-4 py-3">Cipher</th>
                      <th className="px-4 py-3">Plain parity</th>
                      <th className="px-4 py-3">Cipher parity</th>
                      <th className="px-4 py-3">Relation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.value.samples.map((sample) => (
                      <tr key={sample.index} className="border-t border-white/5">
                        <td className="px-4 py-3 font-mono text-slate-400">{sample.index + 1}</td>
                        <td className="px-4 py-3 font-mono text-cyan-100">{sample.plaintext}</td>
                        <td className="px-4 py-3 font-mono text-amber-100">{sample.ciphertext}</td>
                        <td className="px-4 py-3 font-mono text-white">{sample.plaintextParity}</td>
                        <td className="px-4 py-3 font-mono text-white">{sample.ciphertextParity}</td>
                        <td className="px-4 py-3">
                          {sample.relationHolds ? (
                            <span className="rounded-full bg-emerald-300 px-2.5 py-1 text-xs font-black text-slate-950">
                              holds
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-300">
                              misses
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-black text-white">Toy S-box</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {result.value.sboxTable.map((row) => (
                  <div key={row.input} className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      {row.inputBits}
                    </p>
                    <p className="mt-1 font-mono text-lg font-black text-cyan-100">
                      {row.input} → {row.output}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-400">
                      {row.outputBits}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </section>
        ) : null}

        {result.value ? (
          <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-black text-white">Mitigation notes</h2>
              <div className="mt-5 grid gap-4">
                {result.value.mitigationNotes.map((note) => (
                  <div key={note} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm leading-7 text-slate-300">
                    {note}
                  </div>
                ))}
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
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  )
}
