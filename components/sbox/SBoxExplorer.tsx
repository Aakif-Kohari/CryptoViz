'use client'

/**
 * SBoxExplorer — pick a substitution box (AES forward/inverse, or one of the
 * eight DES boxes), type an input value, and see exactly which row/column it
 * maps to and what comes out. Meant to make "S-box lookup" a concrete,
 * clickable thing instead of an abstract table in a spec.
 */

import { useMemo, useState } from 'react'
import {
  DES_S_BOX_COUNT,
  SBOX_FAMILY_LABELS,
  aesLookup,
  desLookup,
  getAesSBoxGrid,
  getDesSBoxGrid,
  parseByteInput,
  type SBoxFamily,
} from '../../lib/symmetric/sboxExplorer'
import SBoxGrid from './SBoxGrid'

const FAMILIES: SBoxFamily[] = ['aes', 'aes-inv', 'des']

function toBinary(value: number, bits: number): string {
  return value.toString(2).padStart(bits, '0')
}

export default function SBoxExplorer() {
  const [family, setFamily] = useState<SBoxFamily>('aes')
  const [desIndex, setDesIndex] = useState(0)
  const [rawInput, setRawInput] = useState('0x53')

  const isAes = family === 'aes' || family === 'aes-inv'
  const maxValue = isAes ? 255 : 63
  const parsed = parseByteInput(rawInput)
  const inputError =
    parsed === null
      ? 'Enter a value.'
      : parsed < 0 || parsed > maxValue
        ? `Value must be between 0 and ${maxValue}${isAes ? ' (a byte)' : ' (6 bits)'}.`
        : null

  const grid = useMemo(
    () => (isAes ? getAesSBoxGrid(family === 'aes-inv') : getDesSBoxGrid(desIndex)),
    [isAes, family, desIndex],
  )

  const lookup = useMemo(() => {
    if (inputError || parsed === null) return null
    try {
      return isAes ? aesLookup(parsed, family === 'aes-inv') : desLookup(desIndex, parsed)
    } catch {
      return null
    }
  }, [inputError, parsed, isAes, family, desIndex])

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="grid gap-2">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            S-box family
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="S-box family">
            {FAMILIES.map((item) => {
              const active = item === family
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFamily(item)}
                  aria-pressed={active}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-teal-500 bg-teal-500 text-white'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-teal-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
                  }`}
                >
                  {SBOX_FAMILY_LABELS[item]}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isAes
              ? 'A single 16x16 byte-substitution table. The high nibble picks the row, the low nibble picks the column.'
              : 'DES uses eight distinct 4x16 boxes. Pick which one below — each consumes 6 bits and outputs a 4-bit nibble.'}
          </p>
        </div>

        {!isAes && (
          <div className="grid gap-2">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              DES box
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="DES S-box selector">
              {Array.from({ length: DES_S_BOX_COUNT }, (_, i) => {
                const active = i === desIndex
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDesIndex(i)}
                    aria-pressed={active}
                    className={`h-8 w-10 rounded-md border text-xs font-semibold transition-colors ${
                      active
                        ? 'border-teal-500 bg-teal-500 text-white'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-teal-400 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-300'
                    }`}
                  >
                    S{i + 1}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <label className="grid gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {isAes ? 'Input byte (0-255)' : 'Input bits (0-63)'}
          <input
            type="text"
            value={rawInput}
            onChange={(event) => setRawInput(event.target.value)}
            placeholder={isAes ? 'e.g. 0x53, 83, or 0b01010011' : 'e.g. 0b011011, 27, or 0x1b'}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 font-mono text-sm font-normal text-zinc-900 outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-white"
            aria-invalid={Boolean(inputError)}
            aria-describedby="sbox-input-hint"
          />
          <span id="sbox-input-hint" className="font-normal text-zinc-500 dark:text-zinc-400">
            Accepts hex (0x prefix or bare hex digits), binary (0b prefix), or decimal.
          </span>
        </label>

        {inputError && (
          <p role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">
            {inputError}
          </p>
        )}
      </section>

      <section
        aria-label="Lookup result"
        aria-live="polite"
        className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
      >
        {lookup ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                {SBOX_FAMILY_LABELS[family]}
                {!isAes && ` — S${desIndex + 1}`}
              </h2>
              <p className="font-mono text-sm text-zinc-600 dark:text-zinc-300">
                output = {isAes ? `0x${lookup.output.toString(16).padStart(2, '0')}` : lookup.output}
                {!isAes && ` (${toBinary(lookup.output, 4)})`}
              </p>
            </div>
            <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              {lookup.explanation}
            </p>
            <SBoxGrid
              grid={grid}
              activeRow={lookup.row}
              activeCol={lookup.col}
              label={
                isAes
                  ? `${SBOX_FAMILY_LABELS[family]} lookup table`
                  : `DES S${desIndex + 1} lookup table`
              }
              format={isAes ? 'hex' : 'decimal'}
              onCellSelect={(row, col) => {
                // Reverse the row/col back into an input value so clicking a
                // cell directly also updates the input field.
                if (isAes) {
                  setRawInput(`0x${((row << 4) | col).toString(16).padStart(2, '0')}`)
                } else {
                  const rowBits = row.toString(2).padStart(2, '0')
                  const colBits = col.toString(2).padStart(4, '0')
                  const bits = rowBits[0] + colBits + rowBits[1]
                  setRawInput(`0b${bits}`)
                }
              }}
            />
          </>
        ) : (
          <SBoxGrid
            grid={grid}
            activeRow={null}
            activeCol={null}
            label={
              isAes
                ? `${SBOX_FAMILY_LABELS[family]} lookup table`
                : `DES S${desIndex + 1} lookup table`
            }
            format={isAes ? 'hex' : 'decimal'}
          />
        )}
      </section>
    </div>
  )
}
