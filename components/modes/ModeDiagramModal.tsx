'use client'

import React, { useEffect } from 'react'

interface ModeDiagramModalProps {
  isOpen: boolean
  onClose: () => void
  selectedMode?: string
}

export default function ModeDiagramModal({ isOpen, onClose, selectedMode = 'CBC' }: ModeDiagramModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mode-diagram-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <h2 id="mode-diagram-title" className="text-xl font-bold text-zinc-900 dark:text-white">
              AES Block Cipher Modes & Error Propagation Architecture
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              NIST SP 800-38A feedback flows and error propagation horizon comparison.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Close diagram modal"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* ECB Diagram Card */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400">ECB (Electronic Codebook)</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Each 16-byte block is encrypted independently with no feedback: <code className="font-mono">C_i = E_K(P_i)</code>.
            </p>
            <div className="mt-3 flex items-center justify-center rounded-lg bg-white p-4 dark:bg-zinc-900 font-mono text-xs text-zinc-700 dark:text-zinc-300">
              P_i ──► [ AES Encrypt (Key) ] ──► C_i
            </div>
            <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Horizon: Flipped byte corrupts exactly 1 block (16 bytes). Identical blocks produce identical ciphertext.
            </span>
          </div>

          {/* CBC Diagram Card */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400">CBC (Cipher Block Chaining)</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Plaintext is XORed with previous ciphertext block: <code className="font-mono">C_i = E_K(P_i ⊕ C_{`i-1`})</code> (IV for block 0).
            </p>
            <div className="mt-3 flex items-center justify-center rounded-lg bg-white p-4 dark:bg-zinc-900 font-mono text-xs text-zinc-700 dark:text-zinc-300">
              P_i ⊕ C_{`i-1`} ──► [ AES Encrypt (Key) ] ──► C_i ──► (Feeds next block)
            </div>
            <span className="mt-2 inline-block rounded bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800 dark:bg-red-950/60 dark:text-red-300">
              Horizon: Full Cascade! Changing byte i alters C_i and EVERY subsequent block (C_{`i+1`}, C_{`i+2`}, ...).
            </span>
          </div>

          {/* CFB Diagram Card */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400">CFB (Cipher Feedback)</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Previous ciphertext block is encrypted to produce keystream: <code className="font-mono">C_i = P_i ⊕ E_K(C_{`i-1`})</code>.
            </p>
            <div className="mt-3 flex items-center justify-center rounded-lg bg-white p-4 dark:bg-zinc-900 font-mono text-xs text-zinc-700 dark:text-zinc-300">
              C_{`i-1`} ──► [ AES Encrypt (Key) ] ──⊕ P_i ──► C_i
            </div>
            <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Horizon: 1 byte in-block + entire next block corrupted upon decryption.
            </span>
          </div>

          {/* OFB & CTR Diagram Card */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400">OFB & CTR (Stream Cipher Modes)</h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Generates independent keystream bytes: <code className="font-mono">C_i = P_i ⊕ KeyStream_i</code>.
            </p>
            <div className="mt-3 flex items-center justify-center rounded-lg bg-white p-4 dark:bg-zinc-900 font-mono text-xs text-zinc-700 dark:text-zinc-300">
              Nonce/Counter ──► [ AES Encrypt (Key) ] ──⊕ P_i ──► C_i
            </div>
            <span className="mt-2 inline-block rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Horizon: Exact 1-byte local change! Zero error propagation to adjacent bytes or blocks.
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400"
          >
            Close Diagram Viewer
          </button>
        </div>
      </div>
    </div>
  )
}
