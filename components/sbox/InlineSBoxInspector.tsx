'use client'

/**
 * InlineSBoxInspector — A compact, inline S-box inspector for block cipher step visualization.
 * Shows input/output, row/column mapping, inverse mapping, and AES GF(2^8) details.
 * Supports AES, DES, Camellia, Serpent, and SM4.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { 
  aesLookup, 
  desLookup, 
  getAesSBoxGrid, 
  getDesSBoxGrid,
  parseByteInput,
  type SBoxLookupResult 
} from '../../lib/symmetric/sboxExplorer'
import SBoxGrid from './SBoxGrid'

// S-box family types for the inline inspector
export type InlineSBoxFamily = 'aes' | 'aes-inv' | 'des' | 'camellia' | 'serpent' | 'sm4'

// Cipher-specific S-box data for additional ciphers
const CAMELLIA_SBOX1 = new Uint8Array([
  112, 130,  44, 236, 179,  39, 192, 229, 228, 133,  87,  53, 234,  12, 174,  65,
   35, 239, 107, 147,  69,  25, 165,  33, 237,  14,  79,  78,  29, 101, 146, 189,
  134, 184, 175, 143, 124, 235,  31, 206,  62,  48, 220,  95,  94, 197,  11,  26,
  166, 225,  57, 202, 213,  71,  93,  61, 217,   1,  90, 214,  81,  86, 108,  77,
  139,  13, 154, 102, 251, 204, 176,  45, 116,  18,  43,  32, 240, 177, 132, 153,
  223,  76, 203, 194,  52, 126, 118,   5, 109, 183, 169,  49, 209,  23,   4, 215,
   20,  88,  58,  97, 222,  27,  17,  28,  50,  15, 156,  22,  83,  24, 242,  34,
  254,  68, 207, 178, 195, 181, 122, 145,  36,   8, 232, 168,  96, 252, 105,  80,
  170, 208, 160, 125, 161, 137,  98, 151,  84,  91,  30, 149, 224, 255, 100, 210,
   16, 196,   0,  72, 163, 247, 117, 219, 138,   3, 230, 218,   9,  63, 221, 148,
  135,  92, 131,   2, 205,  74, 144,  51, 115, 103, 246, 243, 157, 127, 191, 226,
   82, 155, 216,  38, 200,  55, 198,  59, 129, 150, 111,  75,  19, 190,  99,  46,
  233, 121, 167, 140, 159, 110, 188, 142,  41, 245, 249, 182,  47, 253, 180,  89,
  120, 152,   6, 106, 231,  70, 113, 186, 212,  37, 171,  66, 136, 162, 141, 250,
  114,   7, 185,  85, 248, 238, 172,  10,  54,  73,  42, 104,  60,  56, 241, 164,
   64,  40, 211, 123, 187, 201,  67, 193,  21, 227, 173, 244, 119, 199, 128, 158
])

const SM4_SBOX = new Uint8Array([
  0xD6, 0x90, 0xE9, 0xFE, 0xCC, 0xE1, 0x3D, 0xB7, 0x16, 0xB6, 0x14, 0xC2, 0x28, 0xFB, 0x2C, 0x05,
  0x2B, 0x67, 0x9A, 0x76, 0x2A, 0xBE, 0x04, 0xC3, 0xAA, 0x44, 0x13, 0x26, 0x49, 0x86, 0x06, 0x99,
  0x9C, 0x42, 0x50, 0xF4, 0x91, 0xEF, 0x98, 0x7A, 0x33, 0x54, 0x0B, 0x43, 0xED, 0xCF, 0xAC, 0x62,
  0xE4, 0xB3, 0x1C, 0xA9, 0xC9, 0x08, 0xE8, 0x95, 0x80, 0xDF, 0x94, 0xFA, 0x75, 0x8F, 0x3F, 0xA6,
  0x47, 0x07, 0xA7, 0xFC, 0xF3, 0x73, 0x17, 0xBA, 0x83, 0x59, 0x3C, 0x19, 0xE6, 0x85, 0x4F, 0xA8,
  0x68, 0x6B, 0x81, 0xB2, 0x71, 0x64, 0xDA, 0x8B, 0xF8, 0xEB, 0x0F, 0x4B, 0x70, 0x56, 0x9D, 0x35,
  0x1E, 0x24, 0x0E, 0x5E, 0x63, 0x58, 0xD1, 0xA2, 0x25, 0x22, 0x7C, 0x3B, 0x01, 0x21, 0x78, 0x87,
  0xD4, 0x00, 0x46, 0x57, 0x9F, 0xD3, 0x27, 0x52, 0x4C, 0x36, 0x02, 0xE7, 0xA0, 0xC4, 0xC8, 0x9E,
  0xEA, 0xBF, 0x8A, 0xD2, 0x40, 0xC7, 0x38, 0xB5, 0xA3, 0xF7, 0xF2, 0xCE, 0xF9, 0x61, 0x15, 0xA1,
  0xE0, 0xAE, 0x5D, 0xA4, 0x9B, 0x34, 0x1A, 0x55, 0xAD, 0x93, 0x32, 0x30, 0xF5, 0x8C, 0xB1, 0xE3,
  0x1D, 0xF6, 0xE2, 0x2E, 0x82, 0x66, 0xCA, 0x60, 0xC0, 0x29, 0x23, 0xAB, 0x0D, 0x53, 0x4E, 0x6F,
  0xD5, 0xDB, 0x37, 0x45, 0xDE, 0xFD, 0x8E, 0x2F, 0x03, 0xFF, 0x6A, 0x72, 0x6D, 0x6C, 0x5B, 0x51,
  0x8D, 0x1B, 0xAF, 0x92, 0xBB, 0xDD, 0xBC, 0x7F, 0x11, 0xD9, 0x5C, 0x41, 0x1F, 0x10, 0x5A, 0xD8,
  0x0A, 0xC1, 0x31, 0x88, 0xA5, 0xCD, 0x7B, 0xBD, 0x2D, 0x74, 0xD0, 0x12, 0xB8, 0xE5, 0xB4, 0xB0,
  0x89, 0x69, 0x97, 0x4A, 0x0C, 0x96, 0x77, 0x7E, 0x65, 0xB9, 0xF1, 0x09, 0xC5, 0x6E, 0xC6, 0x84,
  0x18, 0xF0, 0x7D, 0xEC, 0x3A, 0xDC, 0x4D, 0x20, 0x79, 0xEE, 0x5F, 0x3E, 0xD7, 0xCB, 0x39, 0x48,
])

const SERPENT_SBOXES: readonly (readonly number[])[] = [
  [3, 8, 15, 1, 10, 6, 5, 11, 14, 13, 4, 2, 7, 0, 9, 12],
  [15, 12, 2, 7, 9, 0, 5, 10, 1, 11, 14, 8, 6, 13, 3, 4],
  [8, 6, 7, 9, 3, 12, 10, 15, 13, 1, 14, 4, 0, 11, 5, 2],
  [0, 15, 11, 8, 12, 9, 6, 3, 13, 1, 2, 4, 10, 7, 5, 14],
  [1, 15, 8, 3, 12, 0, 11, 6, 2, 5, 4, 10, 9, 14, 7, 13],
  [15, 5, 2, 11, 4, 10, 9, 12, 0, 3, 14, 8, 13, 6, 7, 1],
  [7, 2, 12, 5, 8, 4, 6, 11, 14, 9, 1, 15, 13, 3, 10, 0],
  [1, 13, 15, 0, 14, 8, 2, 11, 7, 4, 12, 10, 9, 3, 5, 6],
]

interface InlineSBoxInspectorProps {
  /** The S-box family to inspect */
  family: InlineSBoxFamily
  /** For DES, which S-box index (0-7) */
  desIndex?: number
  /** For Serpent, which S-box index (0-7) */
  serpentIndex?: number
  /** The input value to inspect (as hex string or number) */
  inputValue?: string | number
  /** Whether the inspector is initially expanded */
  initiallyExpanded?: boolean
  /** Callback when inspector is closed */
  onClose?: () => void
  /** Compact mode for inline display */
  compact?: boolean
}

const FAMILY_LABELS: Record<InlineSBoxFamily, string> = {
  aes: 'AES S-Box',
  'aes-inv': 'AES Inverse S-Box',
  des: 'DES S-Box',
  camellia: 'Camellia S-Box',
  serpent: 'Serpent S-Box',
  sm4: 'SM4 S-Box',
}

function toBinary(value: number, bits: number): string {
  return value.toString(2).padStart(bits, '0')
}

// AES GF(2^8) field multiplication details
function getAesGFDetails(input: number, output: number): string {
  // Simplified GF(2^8) explanation for AES
  const inputBin = toBinary(input, 8)
  const outputBin = toBinary(output, 8)
  
  // AES S-box = affine transformation of multiplicative inverse in GF(2^8)
  // Irreducible polynomial: x^8 + x^4 + x^3 + x + 1 (0x11B)
  return `AES GF(2^8): input ${inputBin} → inverse → affine → ${outputBin} (poly: 0x11B)`
}

// Generic 16x16 S-box lookup for Camellia, SM4
function lookupGeneric16x16(sbox: Uint8Array, input: number): SBoxLookupResult {
  if (!Number.isInteger(input) || input < 0 || input > 255) {
    throw new RangeError('Input must be an integer between 0 and 255.')
  }
  const row = (input >> 4) & 0xf
  const col = input & 0xf
  const output = sbox[row * 16 + col]
  return {
    row,
    col,
    output,
    explanation: `0x${input.toString(16).padStart(2, '0')} → row 0x${row.toString(16)}, col 0x${col.toString(16)} → 0x${output.toString(16).padStart(2, '0')}`,
  }
}

// Serpent 4x16 S-box lookup
function lookupSerpent(sboxIndex: number, input: number): SBoxLookupResult {
  if (!Number.isInteger(sboxIndex) || sboxIndex < 0 || sboxIndex >= 8) {
    throw new RangeError('Serpent S-box index must be between 0 and 7.')
  }
  if (!Number.isInteger(input) || input < 0 || input > 15) {
    throw new RangeError('Serpent S-box input must be a 4-bit nibble (0-15).')
  }
  const box = SERPENT_SBOXES[sboxIndex]
  const row = 0 // Serpent uses 4-bit input, effectively 1x16
  const col = input
  const output = box[col]
  return {
    row,
    col,
    output,
    explanation: `0x${input.toString(16)} → S${sboxIndex}[0x${input.toString(16)}] → 0x${output.toString(16)}`,
  }
}

// Get grid data for additional ciphers
function getCamelliaSBoxGrid(): number[][] {
  const rows: number[][] = []
  for (let r = 0; r < 16; r++) {
    rows.push(Array.from(CAMELLIA_SBOX1.slice(r * 16, r * 16 + 16)))
  }
  return rows
}

function getSm4SBoxGrid(): number[][] {
  const rows: number[][] = []
  for (let r = 0; r < 16; r++) {
    rows.push(Array.from(SM4_SBOX.slice(r * 16, r * 16 + 16)))
  }
  return rows
}

function getSerpentSBoxGrid(sboxIndex: number): number[][] {
  if (!Number.isInteger(sboxIndex) || sboxIndex < 0 || sboxIndex >= 8) {
    throw new RangeError('Serpent S-box index must be between 0 and 7.')
  }
  return [Array.from(SERPENT_SBOXES[sboxIndex])]
}

export default function InlineSBoxInspector({
  family,
  desIndex = 0,
  serpentIndex = 0,
  inputValue: propInputValue,
  initiallyExpanded = false,
  onClose,
  compact = false,
}: InlineSBoxInspectorProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded)
  const [inputValue, setInputValue] = useState(() => {
    if (propInputValue !== undefined) {
      return typeof propInputValue === 'number' 
        ? `0x${propInputValue.toString(16).padStart(2, '0')}` 
        : propInputValue
    }
    return family === 'des' ? '0b011011' : '0x53'
  })
  const containerRef = useRef<HTMLDivElement>(null)

  const isAes = family === 'aes' || family === 'aes-inv'
  const isDes = family === 'des'
  const isSerpent = family === 'serpent'
  const isCamellia = family === 'camellia'
  const isSm4 = family === 'sm4'
  
  const maxValue = isDes ? 63 : (isSerpent ? 15 : 255)
  const parsed = parseByteInput(inputValue)
  
  const inputError =
    parsed === null
      ? 'Enter a value.'
      : parsed < 0 || parsed > maxValue
        ? `Value must be between 0 and ${maxValue}.`
        : null

  // Compute lookup result
  const lookup = (() => {
    if (inputError || parsed === null) return null
    try {
      if (isAes) {
        return aesLookup(parsed, family === 'aes-inv')
      } else if (isDes) {
        return desLookup(desIndex, parsed)
      } else if (isCamellia) {
        return lookupGeneric16x16(CAMELLIA_SBOX1, parsed)
      } else if (isSm4) {
        return lookupGeneric16x16(SM4_SBOX, parsed)
      } else if (isSerpent) {
        return lookupSerpent(serpentIndex, parsed)
      }
      return null
    } catch {
      return null
    }
  })()

  // Get grid data
  const grid = (() => {
    if (isAes) {
      return getAesSBoxGrid(family === 'aes-inv')
    } else if (isDes) {
      return getDesSBoxGrid(desIndex)
    } else if (isCamellia) {
      return getCamelliaSBoxGrid()
    } else if (isSm4) {
      return getSm4SBoxGrid()
    } else if (isSerpent) {
      return getSerpentSBoxGrid(serpentIndex)
    }
    return []
  })()

  // Handle Escape key to close
  useEffect(() => {
    if (!isExpanded) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsExpanded(false)
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded, onClose])

  // Focus management when expanded
  useEffect(() => {
    if (isExpanded && containerRef.current) {
      containerRef.current.focus()
    }
  }, [isExpanded])

  const handleCellSelect = useCallback((row: number, col: number) => {
    if (isAes || isCamellia || isSm4) {
      setInputValue(`0x${((row << 4) | col).toString(16).padStart(2, '0')}`)
    } else if (isDes) {
      const rowBits = row.toString(2).padStart(2, '0')
      const colBits = col.toString(2).padStart(4, '0')
      const bits = rowBits[0] + colBits + rowBits[1]
      setInputValue(`0b${bits}`)
    } else if (isSerpent) {
      setInputValue(`0x${col.toString(16)}`)
    }
  }, [isAes, isCamellia, isSm4, isDes, isSerpent])

  const format = isDes ? 'decimal' : 'hex'

  if (compact && !isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700 transition-colors hover:border-teal-400 hover:bg-teal-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-teal-500 dark:hover:bg-teal-950/30"
        aria-label={`Inspect ${FAMILY_LABELS[family]}`}
      >
        <span className="font-mono">S-box</span>
        <svg className="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 ${
        compact ? 'p-3' : 'p-4'
      }`}
      tabIndex={isExpanded ? 0 : -1}
      role="dialog"
      aria-label={`${FAMILY_LABELS[family]} Inspector`}
      aria-modal={compact}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            {FAMILY_LABELS[family]}
          </h3>
          {isDes && <span className="text-xs text-zinc-500 dark:text-zinc-400">S{desIndex + 1}</span>}
          {isSerpent && <span className="text-xs text-zinc-500 dark:text-zinc-400">S{serpentIndex}</span>}
        </div>
        
        {compact && (
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false)
              onClose?.()
            }}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close inspector"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Input field */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          {isDes ? 'Input bits (0-63)' : isSerpent ? 'Input nibble (0-15)' : 'Input byte (0-255)'}
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isDes ? 'e.g. 0b011011, 27, or 0x1b' : isSerpent ? 'e.g. 0xA, 10, or 0b1010' : 'e.g. 0x53, 83, or 0b01010011'}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 font-mono text-sm text-zinc-900 outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-white"
          aria-invalid={Boolean(inputError)}
          aria-describedby="sbox-input-hint"
        />
        <p id="sbox-input-hint" className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Accepts hex (0x prefix), binary (0b prefix), or decimal.
        </p>
        {inputError && (
          <p role="alert" className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
            {inputError}
          </p>
        )}
      </div>

      {/* Lookup result */}
      {lookup && (
        <div className="mb-3 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-950/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Output</span>
            <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
              {isDes 
                ? `${lookup.output} (${toBinary(lookup.output, 4)})`
                : `0x${lookup.output.toString(16).padStart(2, '0')}`
              }
            </span>
          </div>
          <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {lookup.explanation}
          </p>
          {isAes && (
            <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
              {getAesGFDetails(parsed!, lookup.output)}
            </p>
          )}
        </div>
      )}

      {/* S-box grid */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <SBoxGrid
          grid={grid}
          activeRow={lookup?.row ?? null}
          activeCol={lookup?.col ?? null}
          label={`${FAMILY_LABELS[family]} lookup table`}
          format={format}
          onCellSelect={handleCellSelect}
        />
      </div>

      {/* Inverse mapping hint for applicable ciphers */}
      {(isAes || isCamellia || isSm4) && lookup && (
        <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium">Inverse mapping:</span> Find 0x{lookup.output.toString(16).padStart(2, '0')} in the table to see which input maps to it.
        </div>
      )}
    </div>
  )
}