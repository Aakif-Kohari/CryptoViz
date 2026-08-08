"use client";
import { useMemo, useState } from "react";
import {
  buildSipHashManualChecklist,
  calculateSipHash,
  getDefaultSipHashKey,
} from "../../lib/hash/siphashVisualizer";
export default function SipHashVisualizer() {
  const [message, setMessage] = useState("CryptoViz");
  const [keyHex, setKeyHex] = useState(getDefaultSipHashKey());
  const [cRounds, setCRounds] = useState(2);
  const [dRounds, setDRounds] = useState(4);
  const computed = useMemo(() => {
    try {
      return {
        result: calculateSipHash(message, keyHex, { cRounds, dRounds }),
        error: null,
      };
    } catch (e) {
      return {
        result: null,
        error: e instanceof Error ? e.message : "Unable to calculate SipHash.",
      };
    }
  }, [message, keyHex, cRounds, dRounds]);
  const checklist = buildSipHashManualChecklist();
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
          <div className="relative isolate px-6 py-10 sm:px-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.24),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_34%)]" />
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Hash visualizer
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
              SipHash Visualizer
            </h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
              Explore SipHash-2-4 as a keyed short-input hash. Edit the message,
              change the 128-bit key, and inspect how each message block updates
              the four 64-bit state words.
            </p>
          </div>
        </header>
        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Inputs</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              SipHash uses a 16-byte key. The default key is the common
              educational test key from 00 to 0F.
            </p>
            <label className="mt-6 block text-sm font-bold text-slate-200">
              Message
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 placeholder:text-slate-600 focus:ring-2"
              />
            </label>
            <label className="mt-5 block text-sm font-bold text-slate-200">
              128-bit key hex
              <input
                value={keyHex}
                onChange={(e) => setKeyHex(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 font-mono text-sm text-white outline-none ring-cyan-400/40 placeholder:text-slate-600 focus:ring-2"
              />
            </label>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-slate-200">
                Compression rounds: {cRounds}
                <input
                  type="range"
                  min={1}
                  max={4}
                  value={cRounds}
                  onChange={(e) => setCRounds(Number(e.target.value))}
                  className="mt-3 w-full accent-cyan-300"
                />
              </label>
              <label className="block text-sm font-bold text-slate-200">
                Final rounds: {dRounds}
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={dRounds}
                  onChange={(e) => setDRounds(Number(e.target.value))}
                  className="mt-3 w-full accent-cyan-300"
                />
              </label>
            </div>
            {computed.error ? (
              <div
                role="alert"
                className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-300/10 p-4 text-sm font-bold text-rose-100"
              >
                {computed.error}
              </div>
            ) : null}
          </aside>
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Digest</h2>
            {computed.result ? (
              <div className="mt-5 grid gap-4">
                <Metric
                  label="SipHash output"
                  value={computed.result.outputHex}
                  mono
                />
                <Metric
                  label="Decimal output"
                  value={computed.result.outputDecimal}
                  mono
                />
                <Metric
                  label="Message hex"
                  value={computed.result.messageHex || "∅"}
                  mono
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric
                    label="Blocks"
                    value={computed.result.blocks.length}
                  />
                  <Metric
                    label="Compression"
                    value={`${computed.result.cRounds} rounds`}
                  />
                  <Metric
                    label="Finalization"
                    value={`${computed.result.dRounds} rounds`}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-400">
                Fix the input error to calculate SipHash.
              </p>
            )}
          </section>
        </section>
        {computed.result ? (
          <>
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-black text-white">Message blocks</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Blocks are shown as 64-bit words. The final block includes the
                message length in the most significant byte.
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {computed.result.blocks.map((block, index) => (
                  <div
                    key={`${block}-${index}`}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Block {index + 1}
                    </p>
                    <p className="mt-2 break-all font-mono text-sm font-bold text-cyan-100">
                      {block}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-black text-white">State trace</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Follow v0, v1, v2, and v3 through initialization, compression,
                and finalization.
              </p>
              <div className="mt-5 overflow-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                  <thead className="bg-slate-900 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Step</th>
                      <th className="px-4 py-3">Round</th>
                      <th className="px-4 py-3">v0</th>
                      <th className="px-4 py-3">v1</th>
                      <th className="px-4 py-3">v2</th>
                      <th className="px-4 py-3">v3</th>
                      <th className="px-4 py-3">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computed.result.trace.map((row, index) => (
                      <tr
                        key={`${row.step}-${index}`}
                        className="border-t border-white/5"
                      >
                        <td className="px-4 py-3 font-bold text-white">
                          {row.step}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {row.round}
                        </td>
                        <td className="px-4 py-3 font-mono text-cyan-100">
                          {row.v0}
                        </td>
                        <td className="px-4 py-3 font-mono text-cyan-100">
                          {row.v1}
                        </td>
                        <td className="px-4 py-3 font-mono text-cyan-100">
                          {row.v2}
                        </td>
                        <td className="px-4 py-3 font-mono text-cyan-100">
                          {row.v3}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
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
