
'use client'
import { useMemo, useState } from 'react'
import type { CipherResult } from '../../lib/cipher/types'
import { analyzeCipherOutputs, type ByteDiff } from '../../lib/utils/cipherDiff'
import { synchronizeComparisonSteps } from '../../lib/utils/cipherComparison'

interface Props {
  leftResult: CipherResult | null
  rightResult: CipherResult | null
  leftName: string
  rightName: string
  synchronizedStep: number
  onSynchronizedStepChange: (step: number) => void
}
function byteLabel(value: number | null): string {
  return value === null ? '—' : value.toString(16).padStart(2, '0').toUpperCase()
}
function HeatCell({ item }: { item: ByteDiff }) {
  const cls = item.status === 'match'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
    : item.status === 'different'
      ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300'
      : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300'
  return (
    <button
      type="button"
      title={`Byte ${item.index}: A=${byteLabel(item.a)}, B=${byteLabel(item.b)}, differing bits=${item.differingBits}`}
      aria-label={`Byte ${item.index}, ${item.status}`}
      className={`min-w-12 rounded-md border px-1.5 py-2 font-mono text-[10px] ${cls}`}
    >
      <span className="block font-bold">{byteLabel(item.a)} / {byteLabel(item.b)}</span>
      <span className="block opacity-70">#{item.index}</span>
    </button>
  )
}
export default function ComparisonDiffAnalyzer({
  leftResult, rightResult, leftName, rightName, synchronizedStep, onSynchronizedStepChange,
}: Props) {
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false)
  const analysis = useMemo(() => {
    if (!leftResult || !rightResult) return null
    return analyzeCipherOutputs(
      leftResult.output, rightResult.output,
      leftResult.outputEncoding, rightResult.outputEncoding,
    )
  }, [leftResult, rightResult])
  const steps = useMemo(
    () => synchronizeComparisonSteps(leftResult?.steps.length ?? 0, rightResult?.steps.length ?? 0),
    [leftResult?.steps.length, rightResult?.steps.length],
  )
  if (!leftResult || !rightResult) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-950/30">
        <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Comparison analysis</h2>
        <p className="mt-1 text-xs text-zinc-500">Run both ciphers to unlock bit-level diff, heatmap and synchronized playback.</p>
      </section>
    )
  }
  const visible = analysis!.byteDiffs.filter((item) => !showOnlyDiffs || item.status !== 'match')
  const selected = steps[Math.min(synchronizedStep, Math.max(steps.length - 1, 0))]
  const leftStep = selected && selected.left >= 0 ? leftResult.steps[selected.left] : undefined
  const rightStep = selected && selected.right >= 0 ? rightResult.steps[selected.right] : undefined
  return (
    <section aria-label="Cipher comparison analysis" className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-600">Diff analyzer</p>
          <h2 className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">Bit-level output analysis</h2>
          <p className="mt-1 text-xs text-zinc-500">{leftName} vs {rightName}</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          <input type="checkbox" checked={showOnlyDiffs} onChange={(e) => setShowOnlyDiffs(e.target.checked)} />
          Differences only
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Hamming distance" value={`${analysis!.hammingDistance} bits`} />
        <Metric label="Bit difference" value={`${analysis!.bitDifferencePercentage.toFixed(2)}%`} />
        <Metric label={`${leftName} entropy`} value={`${analysis!.entropyA.toFixed(3)} bits/byte`} />
        <Metric label={`${rightName} entropy`} value={`${analysis!.entropyB.toFixed(3)} bits/byte`} />
      </div>
      <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Byte alignment heatmap</h3>
            <p className="mt-1 text-[10px] text-zinc-400">Green = match · amber = substitution · red = length delta</p>
          </div>
          <span className="font-mono text-[10px] text-zinc-400">{analysis!.bytesA.length} / {analysis!.bytesB.length} bytes</span>
        </div>
        <div className="flex max-h-48 flex-wrap gap-1.5 overflow-auto">
          {visible.map((item) => <HeatCell key={item.index} item={item} />)}
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Synchronized step playback</h3>
            <p className="mt-1 text-[10px] text-zinc-400">Both traces advance on one timeline; shorter traces stay on their final available step.</p>
          </div>
          <span className="font-mono text-xs text-teal-600">Step {steps.length ? synchronizedStep + 1 : 0} / {steps.length}</span>
        </div>
        <input
          className="mt-3 w-full accent-teal-600"
          type="range" min={0} max={Math.max(steps.length - 1, 0)}
          value={Math.min(synchronizedStep, Math.max(steps.length - 1, 0))}
          onChange={(e) => onSynchronizedStepChange(Number(e.target.value))}
          disabled={!steps.length}
          aria-label="Synchronized comparison step"
        />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <StepCard name={leftName} step={leftStep} />
          <StepCard name={rightName} step={rightStep} />
        </div>
      </div>
    </section>
  )
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40"><div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{label}</div><div className="mt-1 font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{value}</div></div>
}
function StepCard({ name, step }: { name: string; step?: CipherResult['steps'][number] }) {
  return <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40"><div className="text-[10px] font-bold uppercase tracking-wider text-teal-600">{name}</div><div className="mt-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200">{step?.label ?? 'No trace step'}</div><div className="mt-1 break-all font-mono text-[10px] text-zinc-500">{step?.outputState ?? '—'}</div><p className="mt-1 text-[10px] text-zinc-400">{step?.sublabel || step?.note || ''}</p></div>
}
