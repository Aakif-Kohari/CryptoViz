"use client"

import { useMemo } from "react"
import Rc4PermutationGrid from "./Rc4PermutationGrid"
import ChaChaMatrixGrid from "./ChaChaMatrixGrid"
import ShiftRegisterVisualizer from "./ShiftRegisterVisualizer"
import type { CipherStep } from "../../lib/cipher/types"

type VisualState =
  | {
      mode: "permutation"
      values: number[]
      i?: number
      j?: number
      emitted?: number
    }
  | {
      mode: "matrix"
      values: string[][]
      active?: number[]
      phase?: string
    }
  | {
      mode: "registers"
      registers: Array<{
        name: string
        bits: number[]
        clockBit?: number
        taps?: number[]
      }>
      majority?: number
      outputBit?: number
      feedback?: number[]
    }

interface StreamCipherVisualizerProps {
  cipherId: string
  step?: CipherStep
  stepIndex: number
  stepCount: number
}

const MATRIX_CIPHERS = new Set(["chacha20", "salsa20", "xsalsa20"])
const REGISTER_CIPHERS = new Set(["trivium", "a5-1", "grain128"])

export default function StreamCipherVisualizer({
  cipherId,
  step,
  stepIndex,
  stepCount,
}: StreamCipherVisualizerProps) {
  const visual = useMemo(
    () => (step as (CipherStep & { visualState?: VisualState }) | undefined)?.visualState,
    [step],
  )

  if (!visual) return null

  const title =
    cipherId === "rc4"
      ? "RC4 permutation state"
      : MATRIX_CIPHERS.has(cipherId)
        ? `${cipherId === "chacha20" ? "ChaCha20" : "Salsa20"} state matrix`
        : "Shift-register state"

  return (
    <section
      aria-label={`${title} visualizer`}
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Step {Math.min(stepIndex + 1, stepCount)} of {stepCount}
          </p>
        </div>
        <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-700 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-300">
          Instrumented state
        </span>
      </div>

      {visual.mode === "permutation" && (
        <Rc4PermutationGrid
          values={visual.values}
          i={visual.i}
          j={visual.j}
          emitted={visual.emitted}
        />
      )}

      {visual.mode === "matrix" && (
        <ChaChaMatrixGrid
          values={visual.values}
          active={visual.active ?? []}
          phase={visual.phase}
        />
      )}

      {visual.mode === "registers" && (
        <ShiftRegisterVisualizer
          registers={visual.registers}
          majority={visual.majority}
          outputBit={visual.outputBit}
          feedback={visual.feedback}
        />
      )}
    </section>
  )
}
