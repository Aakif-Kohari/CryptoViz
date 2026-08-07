'use client'

import { useMemo, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import CipherComparisonPanel from '../../components/compare/CipherComparisonPanel'
import ComparisonControls from '../../components/compare/ComparisonControls'
import { CIPHER_REGISTRY } from '../../lib/cipher/registry'
import { swapComparisonSelection } from '../../lib/utils/cipherComparison'
import type { CipherResult } from '../../lib/cipher/types'
import { downloadCSV } from '../../lib/utils/csvExport'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const DEFAULT_LEFT_CIPHER = 'caesar'
const DEFAULT_RIGHT_CIPHER = 'vigenere'

export default function ComparePage() {
  const [leftCipherId, setLeftCipherId] = useState(DEFAULT_LEFT_CIPHER)
  const [rightCipherId, setRightCipherId] = useState(DEFAULT_RIGHT_CIPHER)
  const [sharedInput, setSharedInput] = useState('ATTACKATDAWN')
  const [resetToken, setResetToken] = useState(0)

  const [leftResult, setLeftResult] = useState<CipherResult | null>(null)
  const [rightResult, setRightResult] = useState<CipherResult | null>(null)

  const leftCipher = useMemo(
    () =>
      CIPHER_REGISTRY.find((cipher) => cipher.id === leftCipherId) ??
      CIPHER_REGISTRY[0],
    [leftCipherId],
  )

  const rightCipher = useMemo(
    () =>
      CIPHER_REGISTRY.find((cipher) => cipher.id === rightCipherId) ??
      CIPHER_REGISTRY[1],
    [rightCipherId],
  )

  const handleSwap = () => {
    const next = swapComparisonSelection({
      leftCipherId,
      rightCipherId,
    })
    setLeftCipherId(next.leftCipherId)
    setRightCipherId(next.rightCipherId)
    setLeftResult(rightResult)
    setRightResult(leftResult)
  }

  const handleReset = () => {
    setLeftCipherId(DEFAULT_LEFT_CIPHER)
    setRightCipherId(DEFAULT_RIGHT_CIPHER)
    setSharedInput('ATTACKATDAWN')
    setLeftResult(null)
    setRightResult(null)
    setResetToken((current) => current + 1)
  }

  const handleExport = () => {
    const headers = ['Cipher', 'Output Length', 'Duration (ms)', 'Steps']
    const rows = []

    if (leftResult) {
      rows.push([
        leftCipher.name,
        leftResult.output.length,
        leftResult.durationMs.toFixed(4),
        leftResult.steps.length,
      ])
    }
    if (rightResult) {
      rows.push([
        rightCipher.name,
        rightResult.output.length,
        rightResult.durationMs.toFixed(4),
        rightResult.steps.length,
      ])
    }

    if (rows.length === 0) return

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    downloadCSV(csv, 'comparison-results.csv')
  }

  const chartData = useMemo(() => {
    const data = []
    if (leftResult) {
      data.push({
        name: leftCipher.name,
        duration: leftResult.durationMs,
      })
    }
    if (rightResult) {
      data.push({
        name: rightCipher.name,
        duration: rightResult.durationMs,
      })
    }
    return data
  }, [leftResult, rightResult, leftCipher.name, rightCipher.name])

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <header className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
              Comparison workspace
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Compare two ciphers side by side
            </h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              Run the same input through two algorithms while keeping separate
              keys, directions, options, results, loading states, and errors.
            </p>
          </header>

          <button
            type="button"
            onClick={handleExport}
            disabled={!leftResult && !rightResult}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Results
          </button>
        </div>

        <ComparisonControls
          ciphers={CIPHER_REGISTRY}
          leftCipherId={leftCipher.id}
          rightCipherId={rightCipher.id}
          sharedInput={sharedInput}
          onLeftCipherChange={setLeftCipherId}
          onRightCipherChange={setRightCipherId}
          onSharedInputChange={setSharedInput}
          onSwap={handleSwap}
          onReset={handleReset}
        />

        {chartData.length > 0 && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Execution Time Comparison (ms)</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#71717a' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#71717a' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', backgroundColor: 'var(--color-bg, #18181b)' }}
                    itemStyle={{ fontSize: '14px', fontWeight: 500, color: '#0d9488' }}
                    labelStyle={{ color: '#a1a1aa' }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="duration" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <section
          aria-label="Cipher comparison results"
          className="grid gap-6 lg:grid-cols-2"
        >
          <CipherComparisonPanel
            key={`left-${leftCipher.id}`}
            cipher={leftCipher}
            sharedInput={sharedInput}
            panelLabel="Cipher A"
            resetToken={resetToken}
            onResult={setLeftResult}
          />
          <CipherComparisonPanel
            key={`right-${rightCipher.id}`}
            cipher={rightCipher}
            sharedInput={sharedInput}
            panelLabel="Cipher B"
            resetToken={resetToken}
            onResult={setRightResult}
          />
        </section>
      </main>
    </div>
  )
}
