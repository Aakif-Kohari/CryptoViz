'use client'

import React, { useMemo } from 'react'
import type { CipherStep } from '@/lib/cipher/types'

interface HillMatrixVisualizerProps {
  step?: CipherStep
  keyString?: string
  currentStepIndex?: number
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

function egcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0]
  const [g, x, y] = egcd(b, a % b)
  return [g, y, x - Math.floor(a / b) * y]
}

function modInverse(a: number, m: number): number | null {
  const [g, x] = egcd(mod(a, m), m)
  if (g !== 1) return null
  return mod(x, m)
}

export default function HillMatrixVisualizer({
  step,
  keyString = '',
}: HillMatrixVisualizerProps) {
  // Parse key matrix
  const keyAnalysis = useMemo(() => {
    const clean = keyString.toUpperCase().replace(/[^A-Z]/g, '')
    if (clean.length !== 4) {
      return null
    }
    const nums = clean.split('').map((c) => c.charCodeAt(0) - 65)
    const k00 = nums[0]
    const k01 = nums[1]
    const k10 = nums[2]
    const k11 = nums[3]

    const detRaw = k00 * k11 - k01 * k10
    const detMod26 = mod(detRaw, 26)
    const detInv = modInverse(detMod26, 26)
    const isInvertible = detInv !== null

    const invMatrix = isInvertible
      ? [
          [mod(detInv * k11, 26), mod(detInv * -k01, 26)],
          [mod(detInv * -k10, 26), mod(detInv * k00, 26)],
        ]
      : null

    return {
      letters: clean.split(''),
      matrix: [
        [k00, k01],
        [k10, k11],
      ],
      detRaw,
      detMod26,
      detInv,
      isInvertible,
      invMatrix,
    }
  }, [keyString])

  // Extract active vector information from step
  const vectorAnalysis = useMemo(() => {
    if (!step || !step.inputState || step.inputState.length < 2) {
      return null
    }
    // Only analyze if inputState has 2 letters (polygraphic block)
    const inLetters = step.inputState.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2)
    const outLetters = (step.outputState || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2)

    if (inLetters.length !== 2) return null

    const p0 = inLetters.charCodeAt(0) - 65
    const p1 = inLetters.charCodeAt(1) - 65

    const c0 = outLetters.length >= 1 ? outLetters.charCodeAt(0) - 65 : 0
    const c1 = outLetters.length >= 2 ? outLetters.charCodeAt(1) - 65 : 0

    // Check if matrix is in step
    let activeMatrix = keyAnalysis?.matrix
    if (step.matrix && Array.isArray(step.matrix) && step.matrix.length === 2) {
      activeMatrix = [
        [parseInt(step.matrix[0][0], 10), parseInt(step.matrix[0][1], 10)],
        [parseInt(step.matrix[1][0], 10), parseInt(step.matrix[1][1], 10)],
      ]
    }

    if (!activeMatrix) return null

    const prod0 = activeMatrix[0][0] * p0 + activeMatrix[0][1] * p1
    const prod1 = activeMatrix[1][0] * p0 + activeMatrix[1][1] * p1

    return {
      inLetters,
      outLetters,
      p0,
      p1,
      c0,
      c1,
      matrix: activeMatrix,
      prod0,
      prod1,
    }
  }, [step, keyAnalysis])

  if (!keyAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
          Enter a 4-letter key (e.g. &quot;HILL&quot;) to view the 2×2 Hill Matrix dot-product visualizer.
        </div>
      </div>
    )
  }

  const isDecryption = step?.label?.toLowerCase().includes('invert') || step?.note?.toLowerCase().includes('k^-1')

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="mb-4 flex w-full max-w-2xl items-center justify-between gap-3">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          2×2 Hill Cipher Matrix Transformation (mod 26)
        </h5>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            keyAnalysis.isInvertible
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
              : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400'
          }`}
        >
          {keyAnalysis.isInvertible
            ? `det(K) = ${keyAnalysis.detMod26} (Coprime with 26 ✓)`
            : `det(K) = ${keyAnalysis.detMod26} (Non-Invertible ✗)`}
        </span>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-12">
        {/* Key Matrix Display Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 md:col-span-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {isDecryption ? 'Decryption Inverse Matrix K⁻¹' : 'Key Matrix K'}
            </span>
            <span className="font-mono text-xs text-zinc-400">
              {keyAnalysis.letters.join(' ')}
            </span>
          </div>

          {/* 2x2 Matrix Grid */}
          <div className="my-2 flex items-center justify-center gap-3">
            <span className="text-3xl font-light text-zinc-400">(</span>
            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              {(isDecryption && keyAnalysis.invMatrix ? keyAnalysis.invMatrix : keyAnalysis.matrix).map(
                (row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`k-${r}-${c}`}
                      className="flex h-10 w-12 flex-col items-center justify-center rounded-lg border border-teal-500/30 bg-teal-50/50 text-sm font-bold text-teal-700 dark:border-teal-500/20 dark:bg-teal-950/30 dark:text-teal-300"
                    >
                      <span>{val}</span>
                    </div>
                  ))
              )}
            </div>
            <span className="text-3xl font-light text-zinc-400">)</span>
          </div>

          <div className="mt-3 border-t border-zinc-100 pt-2 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <div>
              det(K) = ({keyAnalysis.matrix[0][0]} × {keyAnalysis.matrix[1][1]}) − ({keyAnalysis.matrix[0][1]} × {keyAnalysis.matrix[1][0]}) = {keyAnalysis.detRaw} ≡{' '}
              <strong>{keyAnalysis.detMod26}</strong> (mod 26)
            </div>
            {keyAnalysis.isInvertible && (
              <div className="mt-0.5">
                det(K)⁻¹ mod 26 = <strong>{keyAnalysis.detInv}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Vector Transformation & Dot Product */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 md:col-span-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Vector Dot Product
            </span>
            {vectorAnalysis && (
              <span className="rounded bg-teal-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                Block: &apos;{vectorAnalysis.inLetters}&apos; → &apos;{vectorAnalysis.outLetters}&apos;
              </span>
            )}
          </div>

          {vectorAnalysis ? (
            <div className="flex flex-col gap-2 font-mono text-xs">
              {/* Equation 1 */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>
                    C₁ = ({vectorAnalysis.matrix[0][0]}×{vectorAnalysis.p0} + {vectorAnalysis.matrix[0][1]}×{vectorAnalysis.p1})
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    = {vectorAnalysis.prod0} ≡ {vectorAnalysis.c0} (&apos;{vectorAnalysis.outLetters[0] || '?'}&apos;)
                  </span>
                </div>
              </div>

              {/* Equation 2 */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>
                    C₂ = ({vectorAnalysis.matrix[1][0]}×{vectorAnalysis.p0} + {vectorAnalysis.matrix[1][1]}×{vectorAnalysis.p1})
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    = {vectorAnalysis.prod1} ≡ {vectorAnalysis.c1} (&apos;{vectorAnalysis.outLetters[1] || '?'}&apos;)
                  </span>
                </div>
              </div>

              <div className="mt-1 text-[11px] text-zinc-400">
                Input vector: [{vectorAnalysis.inLetters[0]}={vectorAnalysis.p0}, {vectorAnalysis.inLetters[1]}={vectorAnalysis.p1}]ᵀ
              </div>
            </div>
          ) : (
            <div className="flex h-28 flex-col items-center justify-center text-center text-xs text-zinc-400">
              <span>Step through execution to inspect vector transformations.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
