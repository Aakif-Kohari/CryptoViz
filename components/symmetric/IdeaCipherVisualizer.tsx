"use client"

import { useMemo, useState } from "react"
import {
  DEFAULT_IDEA_CIPHER_INPUT,
  buildIdeaCipherManualChecklist,
  runIdeaCipherVisualization,
  type IdeaCipherInput,
} from "../../lib/symmetric/ideaCipherVisualizer"

export default function IdeaCipherVisualizer() {
  const [input, setInput] = useState<IdeaCipherInput>(DEFAULT_IDEA_CIPHER_INPUT)
  const [activeRound, setActiveRound] = useState(0)
  const result = useMemo(() => {
    try { return { value: runIdeaCipherVisualization(input), error: null as string | null } }
    catch (caught) { return { value: null, error: caught instanceof Error ? caught.message : "Unable to run IDEA visualizer." } }
  }, [input])
  const round = result.value?.rounds[activeRound]
  const manualChecklist = buildIdeaCipherManualChecklist()
  function updateInput<K extends keyof IdeaCipherInput>(key: K, value: IdeaCipherInput[K]) {
    setActiveRound(0); setInput((current) => ({ ...current, [key]: value }))
  }
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
          <div className="relative isolate px-6 py-10 sm:px-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_32%)]" />
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">Symmetric cryptography</p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">IDEA Cipher Visualizer</h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">Step through IDEA encryption for one 64-bit block. Inspect the 128-bit key schedule, 52 generated subkeys, eight full rounds, and the final output transformation.</p>
              </div>
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5">
                <p className="text-sm font-bold text-amber-100">Legacy cipher note</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">IDEA is mainly useful for learning block-cipher design today. For new systems, prefer modern authenticated encryption.</p>
              </div>
            </div>
          </div>
        </header>
        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Input block</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">IDEA encrypts a 64-bit block using a 128-bit key.</p>
            <label className="mt-6 block text-sm font-bold text-slate-200">Plaintext block, 16 hex chars</label>
            <input value={input.plaintextHex} onChange={(event) => updateInput("plaintextHex", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 font-mono text-sm text-white outline-none ring-cyan-400/40 focus:ring-2" />
            <label className="mt-5 block text-sm font-bold text-slate-200">IDEA key, 32 hex chars</label>
            <input value={input.keyHex} onChange={(event) => updateInput("keyHex", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 font-mono text-sm text-white outline-none ring-cyan-400/40 focus:ring-2" />
            <button type="button" onClick={() => { setInput(DEFAULT_IDEA_CIPHER_INPUT); setActiveRound(0) }} className="mt-6 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-100">Reset demo</button>
            {result.error ? <div role="alert" className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">{result.error}</div> : null}
            <div className="mt-6 grid gap-3"><Metric label="Subkeys" value={result.value?.subkeys.length ?? "—"} /><Metric label="Rounds" value={result.value?.rounds.length ?? "—"} /><Metric label="Ciphertext" value={result.value?.ciphertextHex ?? "—"} mono /></div>
          </aside>
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Round selector</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Each full round consumes six 16-bit subkeys. The final transform consumes the last four subkeys.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {result.value?.rounds.map((item, index) => (<button key={item.round} type="button" onClick={() => setActiveRound(index)} className={`rounded-2xl border p-4 text-left transition ${activeRound === index ? "border-cyan-300/70 bg-cyan-300/10" : "border-white/10 bg-slate-900/70 hover:border-cyan-300/50"}`}><p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Round {item.round}</p><p className="mt-2 break-all font-mono text-xs text-cyan-100">{item.output.join(" ")}</p></button>))}
            </div>
          </section>
        </section>
        {round ? <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"><p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-300">Active IDEA round</p><h2 className="mt-2 text-3xl font-black text-white">Round {round.round}</h2><p className="mt-4 text-base leading-8 text-slate-300">{round.note}</p><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Input X1",round.x1],["Input X2",round.x2],["Input X3",round.x3],["Input X4",round.x4],["Mul X1 × K1",round.afterMultiply1],["Add X2 + K2",round.afterAdd2],["Add X3 + K3",round.afterAdd3],["Mul X4 × K4",round.afterMultiply4],["XOR path 1",round.xor13],["XOR path 2",round.xor24],["Mix 1",round.mix1],["Mix 2",round.mix2]].map(([label,value])=><Info key={label} label={label} value={value} />)}</div></article><aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black text-white">Round subkeys</h2><div className="mt-5 grid grid-cols-2 gap-3">{round.subkeys.map((key,index)=><div key={`${round.round}-${key}-${index}`} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">K{round.round}.{index+1}</p><p className="mt-2 font-mono text-lg font-black text-cyan-100">{key}</p></div>)}</div><h3 className="mt-6 text-xl font-black text-white">Round output</h3><p className="mt-3 break-all rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 font-mono text-xl text-cyan-100">{round.output.join(" ")}</p></aside></section> : null}
        {result.value ? <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"><article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black text-white">Output transform</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Info label="Y1" value={result.value.outputTransform.y1}/><Info label="Y2" value={result.value.outputTransform.y2}/><Info label="Y3" value={result.value.outputTransform.y3}/><Info label="Y4" value={result.value.outputTransform.y4}/></div><p className="mt-5 break-all rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 font-mono text-2xl font-black text-emerald-100">{result.value.ciphertextHex}</p></article><aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black text-white">Security notes</h2><div className="mt-5 flex flex-col gap-3">{result.value.securityNotes.map((note)=><div key={note} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm leading-7 text-slate-300">{note}</div>)}</div></aside></section> : null}
        {result.value ? <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black text-white">Subkey schedule</h2><div className="mt-5 grid gap-2 sm:grid-cols-4 md:grid-cols-8">{result.value.subkeys.map((key,index)=><div key={`${key}-${index}`} className="rounded-xl border border-white/10 bg-slate-900/70 p-3"><p className="text-xs font-bold text-slate-500">K{index+1}</p><p className="mt-1 font-mono text-sm text-cyan-100">{key}</p></div>)}</div></section> : null}
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black text-white">Manual testing checklist</h2><ol className="mt-5 grid gap-3 md:grid-cols-2">{manualChecklist.map((item,index)=><li key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm leading-6 text-slate-300"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-slate-950">{index+1}</span><span>{item}</span></li>)}</ol></section>
      </section>
    </main>
  )
}
function Metric({ label, value, mono = false }: { label: string; value: string | number; mono?: boolean }) { return <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"><p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{label}</p><p className={`mt-2 break-all ${mono ? "font-mono text-sm text-cyan-200" : "text-3xl font-black text-white"}`}>{value}</p></div> }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p><p className="mt-2 break-all font-mono text-lg font-black text-cyan-100">{value}</p></div> }
