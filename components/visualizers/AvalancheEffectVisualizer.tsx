"use client";

import { useMemo, useState } from "react";
import {
  buildAvalancheManualChecklist,
  buildAvalancheResult,
  getAvalancheAlgorithmLabel,
  type AvalancheAlgorithm,
} from "../../lib/visualizers/avalancheEffect";

const ALGORITHMS: AvalancheAlgorithm[] = ["toy-feistel", "xor-rotate", "mixing-hash"];

export default function AvalancheEffectVisualizer() {
  const [message, setMessage] = useState("Avalanche");
  const [flippedBitIndex, setFlippedBitIndex] = useState(0);
  const [rounds, setRounds] = useState(8);
  const [algorithm, setAlgorithm] = useState<AvalancheAlgorithm>("toy-feistel");

  const result = useMemo(
    () =>
      buildAvalancheResult({
        message,
        flippedBitIndex,
        rounds,
        algorithm,
      }),
    [message, flippedBitIndex, rounds, algorithm],
  );

  const checklist = buildAvalancheManualChecklist();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
          <div className="relative isolate px-6 py-10 sm:px-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_32%)]" />
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Cryptography visualizer
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Avalanche Effect Visualizer
            </h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
              Flip one input bit and watch how the change spreads through every round.
              The heatmap, bit comparison, and statistics show whether a mixing design
              approaches the ideal avalanche effect.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Controls</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Edit the message, choose a toy round function, and flip exactly one bit.
            </p>

            <label className="mt-6 block text-sm font-bold text-slate-200">
              Message
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 placeholder:text-slate-600 focus:ring-2"
              />
            </label>

            <label className="mt-5 block text-sm font-bold text-slate-200">
              Algorithm
              <select
                value={algorithm}
                onChange={(event) => setAlgorithm(event.target.value as AvalancheAlgorithm)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
              >
                {ALGORITHMS.map((item) => (
                  <option key={item} value={item}>
                    {getAvalancheAlgorithmLabel(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 block text-sm font-bold text-slate-200">
              Rounds: {rounds}
              <input
                type="range"
                min={1}
                max={16}
                value={rounds}
                onChange={(event) => setRounds(Number(event.target.value))}
                className="mt-3 w-full accent-cyan-300"
              />
            </label>

            <label className="mt-5 block text-sm font-bold text-slate-200">
              Flipped bit index: {result.flippedBitIndex}
              <input
                type="range"
                min={0}
                max={63}
                value={result.flippedBitIndex}
                onChange={(event) => setFlippedBitIndex(Number(event.target.value))}
                className="mt-3 w-full accent-cyan-300"
              />
            </label>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Metric label="Final changed bits" value={`${result.finalChangedBitCount}/64`} />
              <Metric label="Final difference" value={`${result.finalPercentageDifference}%`} />
              <Metric label="Average difference" value={`${result.averagePercentageDifference}%`} />
              <Metric label="Peak changed bits" value={result.maxChangedBitCount} />
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Input bit comparison</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The changed bit is marked before the rounds begin.
            </p>

            <div className="mt-5 grid grid-cols-8 gap-1 sm:grid-cols-16">
              {result.originalMessageBits.split("").map((bit, index) => {
                const changed = result.changedMessageBits[index] !== bit;

                return (
                  <div
                    key={`${bit}-${index}`}
                    className={`rounded-lg border p-2 text-center font-mono text-xs font-bold ${
                      changed
                        ? "border-rose-300 bg-rose-300 text-slate-950"
                        : "border-white/10 bg-slate-900 text-slate-300"
                    }`}
                    title={`Bit ${index}: ${bit} -> ${result.changedMessageBits[index]}`}
                  >
                    {bit}/{result.changedMessageBits[index]}
                  </div>
                );
              })}
            </div>
          </section>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Round heatmap</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Each row is a round. Highlighted cells are output bits that changed.
              </p>
            </div>
            <p className="text-sm font-bold text-cyan-100">
              {getAvalancheAlgorithmLabel(algorithm)} · {rounds} rounds
            </p>
          </div>

          <div className="mt-5 overflow-auto rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <div className="grid min-w-[760px] gap-2">
              {result.heatmap.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-[72px_1fr] items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    R{rowIndex + 1}
                  </span>
                  <div className="grid grid-cols-64 gap-1">
                    {row.map((changed, bitIndex) => (
                      <span
                        key={`${rowIndex}-${bitIndex}`}
                        title={`Round ${rowIndex + 1}, bit ${bitIndex}: ${changed ? "changed" : "same"}`}
                        className={`h-3 rounded-sm ${
                          changed ? "bg-cyan-300" : "bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Round statistics</h2>
            <div className="mt-5 overflow-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                <thead className="bg-slate-900 text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Round</th>
                    <th className="px-4 py-3">Original output</th>
                    <th className="px-4 py-3">Changed output</th>
                    <th className="px-4 py-3">Changed bits</th>
                    <th className="px-4 py-3">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rounds.map((round) => (
                    <tr key={round.round} className="border-t border-white/5">
                      <td className="px-4 py-3 font-black text-white">{round.round}</td>
                      <td className="px-4 py-3 font-mono text-cyan-100">{round.originalHex}</td>
                      <td className="px-4 py-3 font-mono text-amber-100">{round.changedHex}</td>
                      <td className="px-4 py-3 text-slate-300">{round.changedBitCount}/64</td>
                      <td className="px-4 py-3 font-bold text-white">{round.percentageDifference}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Manual test checklist</h2>
            <ol className="mt-5 space-y-3">
              {checklist.map((item, index) => (
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
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
