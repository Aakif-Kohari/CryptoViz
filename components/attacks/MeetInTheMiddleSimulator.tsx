'use client'

import { useState } from 'react'
import { doubleDesEncrypt, meetInTheMiddleAttack, type MitmStep, type MitmResult } from '@/lib/attacks/meetInTheMiddle'
import { useAttackWorker } from '@/lib/hooks/useAttackWorker'

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, '')
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  return out
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const DEFAULT_PLAINTEXT = '0123456789abcdef'
const DEFAULT_KEY_A = '00000000000012ab'
const DEFAULT_KEY_B = '0000000000003ecd'

export default function MeetInTheMiddleSimulator() {
  const [plaintextHex, setPlaintextHex] = useState(DEFAULT_PLAINTEXT)
  const [keySpaceBits, setKeySpaceBits] = useState(16)
  const [steps, setSteps] = useState<MitmStep[]>([])
  const [result, setResult] = useState<MitmResult | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState<number | null>(null)

  const { runMitmAttack, cancel, loading: workerLoading, error: workerError } = useAttackWorker()

  async function runAttack() {
    setLocalError(null)
    setSteps([])
    setResult(null)
    const t0 = performance.now()
    setStartTime(t0)
    setElapsedMs(null)

    try {
      const plaintext = hexToBytes(plaintextHex)
      if (plaintext.length !== 8) {
        throw new Error('Plaintext must be exactly 16 hex characters (8 bytes).')
      }
      const keyA = hexToBytes(DEFAULT_KEY_A)
      const keyB = hexToBytes(DEFAULT_KEY_B)
      const ciphertext = doubleDesEncrypt(plaintext, keyA, keyB)
      const ciphertextHex = bytesToHex(ciphertext)

      if (typeof window !== 'undefined' && window.Worker) {
        // Run attack inside dedicated background Web Worker thread
        const attackResult = await runMitmAttack(
          plaintextHex,
          ciphertextHex,
          keySpaceBits,
          (step) => setSteps((prev) => [...prev, step])
        )
        setResult(attackResult)
      } else {
        // Fallback for non-worker environment
        const attackResult = meetInTheMiddleAttack(
          plaintext,
          ciphertext,
          keySpaceBits,
          (step) => setSteps((prev) => [...prev, step])
        )
        setResult(attackResult)
      }
      setElapsedMs(Math.round(performance.now() - t0))
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Something went wrong during attack execution.')
    }
  }

  function handleCancel() {
    cancel()
    setLocalError('Attack canceled by user.')
  }

  const activeError = localError || workerError

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
          1. Known plaintext / double-DES setup
        </h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          A demo message is encrypted with two chained DES keys,{' '}
          <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">C = E_k2(E_k1(P))</code>. The attacker
          knows <code>P</code> and <code>C</code> but neither key. Attack computations execute off-thread inside a background Web Worker.
        </p>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Plaintext block (16 hex chars / 8 bytes)
        </label>
        <input
          className="mb-4 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          value={plaintextHex}
          onChange={(e) => setPlaintextHex(e.target.value)}
        />
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Reduced keyspace size ({keySpaceBits} bits — {Math.pow(2, keySpaceBits).toLocaleString()} candidates per pass)
        </label>
        <input
          type="range"
          min={8}
          max={20}
          value={keySpaceBits}
          onChange={(e) => setKeySpaceBits(Number(e.target.value))}
          className="w-full"
          disabled={workerLoading}
        />
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={runAttack}
            disabled={workerLoading}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-500 dark:hover:bg-teal-400"
          >
            {workerLoading ? 'Searching in Web Worker…' : 'Run meet-in-the-middle attack'}
          </button>
          {workerLoading && (
            <button
              onClick={handleCancel}
              className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
            >
              Cancel Attack
            </button>
          )}
        </div>
        {activeError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{activeError}</p>}
      </div>

      {steps.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">2. Attack trace & progress</h2>
            {elapsedMs !== null && (
              <span className="font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">
                Completed in {elapsedMs} ms
              </span>
            )}
          </div>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={`step-${i}-${step.label}`} className="border-l-2 border-teal-500 pl-3">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{step.label}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">3. Recovered keys</h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            k1 = <code>{result.foundKeyAHex}</code>, k2 = <code>{result.foundKeyBHex}</code>
          </p>
          <p className="mt-2 text-sm font-semibold text-red-700 dark:text-red-400">
            Found in {result.attemptsUntilMatch.toLocaleString()} of {result.keyASearchSpace.toLocaleString()} possible
            backward-pass attempts — roughly 2×2^{keySpaceBits} work instead of 2^{keySpaceBits * 2} for a naive
            two-key brute force.
          </p>
        </div>
      )}
    </div>
  )
}
