'use client'

import { useMemo, useState, useId, useEffect } from 'react'
import { type AesMode } from '@/lib/cipher/symmetric/aes'
import { cryptoWorkerClient } from '@/lib/workers/cryptoWorkerClient'
import ModeDiagramModal from './ModeDiagramModal'

const MODES: { id: AesMode; name: string; blurb: string; horizon: string }[] = [
  {
    id: 'ECB',
    name: 'ECB',
    blurb: 'Only the changed block differs; equal blocks stay equal.',
    horizon: 'Horizon: Exactly 1 block affected (16 bytes)',
  },
  {
    id: 'CBC',
    name: 'CBC',
    blurb: 'The changed block and every block after it differ.',
    horizon: 'Horizon: Cascades across changed block & ALL downstream blocks',
  },
  {
    id: 'CFB',
    name: 'CFB',
    blurb: 'One byte in-block, then every following block differs.',
    horizon: 'Horizon: 1 byte in-block + entire next block corrupted',
  },
  {
    id: 'OFB',
    name: 'OFB',
    blurb: 'Keystream is independent — only the one byte differs.',
    horizon: 'Horizon: Exact 1-byte local change (No propagation)',
  },
  {
    id: 'CTR',
    name: 'CTR',
    blurb: 'Counter keystream — only the one byte differs.',
    horizon: 'Horizon: Exact 1-byte local change (No propagation)',
  },
]

const KEY = '2b7e151628aed2a6abf7158809cf4f3c'
const IV = '000102030405060708090a0b0c0d0e0f'
const BLOCK_SIZE = 16

function flipByte(text: string, index: number): string {
  if (index < 0 || index >= text.length) return text
  const code = text.charCodeAt(index)
  const next = code === 65 ? 66 : 65 // 'A' <-> 'B'
  return text.slice(0, index) + String.fromCharCode(next) + text.slice(index + 1)
}

function chunkArray<T>(arr: T[], size: number): { blockIndex: number; startIndex: number; items: T[] }[] {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push({
      blockIndex: Math.floor(i / size),
      startIndex: i,
      items: arr.slice(i, i + size),
    })
  }
  return chunks
}

export default function ModesLab() {
  const [text, setText] = useState('The magic words are squeamish ossifrage.')
  const [flipIndex, setFlipIndex] = useState(4)
  const [hoveredByteIndex, setHoveredByteIndex] = useState<number | null>(null)
  const [isDiagramOpen, setIsDiagramOpen] = useState(false)
  const [selectedDiagramMode, setSelectedDiagramMode] = useState<string>('CBC')

  const textInputId = useId()
  const rangeInputId = useId()

  const safeIndex = Math.min(flipIndex, Math.max(0, text.length - 1))
  const flipped = useMemo(() => flipByte(text, safeIndex), [text, safeIndex])
  const activeFlippedBlockIndex = Math.floor(safeIndex / BLOCK_SIZE)

  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    const calculate = async () => {
      setLoading(true)
      try {
        const result = await cryptoWorkerClient.runCryptoOperation<any[]>('batchModesLab', {
          text,
          flipped,
          key: KEY,
          iv: IV,
          modes: MODES.map((m) => m.id),
        })

        if (active) {
          const merged = MODES.map((m, i) => ({
            ...m,
            ...result[i],
          }))
          setRows(merged)
        }
      } catch (err) {
        console.error('Worker failed:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    calculate()
    return () => {
      active = false
    }
  }, [text, flipped])

  return (
    <div className="flex flex-col gap-6">
      {/* Top Input & Byte Flipper Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mb-4 flex items-center justify-between">
          <label htmlFor={textInputId} className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Plaintext (ASCII)
          </label>

          <button
            type="button"
            onClick={() => setIsDiagramOpen(true)}
            className="rounded-lg border border-teal-500/40 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/40"
          >
            View Mode Chaining Diagrams & Feedback Flow →
          </button>
        </div>

        <input
          id={textInputId}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2.5 font-mono text-sm text-zinc-900 outline-none transition-all focus:border-teal-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-teal-400"
        />

        <div className="mt-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor={rangeInputId} className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Flip one plaintext byte (position {safeIndex} in Block {activeFlippedBlockIndex})
            </label>
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              key {KEY.slice(0, 8)}… · iv {IV.slice(0, 8)}…
            </span>
          </div>
          <input
            id={rangeInputId}
            type="range"
            min={0}
            max={Math.max(0, text.length - 1)}
            value={safeIndex}
            onChange={(e) => setFlipIndex(parseInt(e.target.value, 10))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-teal-600 dark:bg-zinc-700 dark:accent-teal-400"
          />
          <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
            {text.slice(0, safeIndex)}
            <span className="rounded bg-amber-200 px-0.5 font-bold text-zinc-900 dark:bg-amber-500/40 dark:text-amber-100">
              {text.slice(safeIndex, safeIndex + 1) || '·'}
            </span>
            {text.slice(safeIndex + 1)}
          </p>
        </div>
      </div>

      {/* Mode Comparison Rows with Structured 16-Byte Block Cards */}
      <div className="flex flex-col gap-4">
        {rows.map((row) => {
          const changedBlocks = chunkArray(row.changed, BLOCK_SIZE)
          const diffBlocks = chunkArray(row.diff, BLOCK_SIZE)

          return (
            <div
              key={row.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40 shadow-sm"
            >
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-base font-bold text-teal-600 dark:text-teal-400">
                    {row.name}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{row.blurb}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {row.horizon}
                  </span>
                  <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    {row.changedCount}/{row.total} bytes changed
                  </span>
                </div>
              </div>

              {/* Structured 16-Byte Block Layout */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {changedBlocks.map((blk) => {
                  const bIdx = blk.blockIndex
                  const diffItems = diffBlocks[bIdx]?.items || []
                  const isBlockAffected = diffItems.some(Boolean)
                  const containsFlippedByte = bIdx === activeFlippedBlockIndex

                  return (
                    <div
                      key={`blk-${row.id}-${bIdx}`}
                      className={`rounded-lg border p-3 transition-all ${
                        containsFlippedByte
                          ? 'border-amber-400 bg-amber-50/30 dark:border-amber-500/50 dark:bg-amber-950/20'
                          : isBlockAffected
                          ? 'border-red-200 bg-red-50/20 dark:border-red-900/40 dark:bg-red-950/10'
                          : 'border-zinc-200 bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-950/30'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Block {bIdx} [{blk.startIndex}–{blk.startIndex + blk.items.length - 1}]
                        </span>
                        {isBlockAffected && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-red-700 dark:bg-red-950/80 dark:text-red-300">
                            Corrupted
                          </span>
                        )}
                      </div>

                      {/* 16-Byte Hex Grid */}
                      <div className="grid grid-cols-8 gap-1">
                        {blk.items.map((b: string, i: number) => {
                          const globalIdx = blk.startIndex + i
                          const isDiff = diffItems[i]
                          const isHovered = hoveredByteIndex === globalIdx

                          return (
                            <span
                              key={`b-${globalIdx}`}
                              onMouseEnter={() => setHoveredByteIndex(globalIdx)}
                              onMouseLeave={() => setHoveredByteIndex(null)}
                              className={`rounded px-1 py-0.5 text-center font-mono text-[11px] transition-colors cursor-default ${
                                isHovered
                                  ? 'bg-teal-500 text-white ring-2 ring-teal-400'
                                  : isDiff
                                  ? 'bg-amber-200 font-bold text-zinc-900 dark:bg-amber-500/40 dark:text-amber-100'
                                  : 'bg-white text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                              }`}
                              aria-label={`Byte ${globalIdx}: ${b} (${isDiff ? 'changed' : 'unchanged'})`}
                            >
                              {b}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mode Diagram Modal */}
      <ModeDiagramModal
        isOpen={isDiagramOpen}
        onClose={() => setIsDiagramOpen(false)}
        selectedMode={selectedDiagramMode}
      />
    </div>
  )
}
