'use client'

import { useState } from 'react'

import {
  asciiToBinary,
  asciiToHex,
  binaryToAscii,
  binaryToHex,
  hexToAscii,
  hexToBinary,
} from '@/lib/utils/converter'

type EncodingType = 'ascii' | 'hex' | 'binary'

export default function HexBinaryAsciiConverter() {
  const [from, setFrom] = useState<EncodingType>('ascii')
  const [to, setTo] = useState<EncodingType>('hex')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const convert = () => {
    setError('')

    try {
      let result = ''

      if (from === to) {
        result = input
      } else if (from === 'ascii' && to === 'hex') {
        result = asciiToHex(input)
      } else if (from === 'ascii' && to === 'binary') {
        result = asciiToBinary(input)
      } else if (from === 'hex' && to === 'ascii') {
        result = hexToAscii(input)
      } else if (from === 'hex' && to === 'binary') {
        result = hexToBinary(input)
      } else if (from === 'binary' && to === 'ascii') {
        result = binaryToAscii(input)
      } else if (from === 'binary' && to === 'hex') {
        result = binaryToHex(input)
      }

      setOutput(result)
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : 'Conversion failed')
    }
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const copyOutput = async () => {
    if (!output) return

    await navigator.clipboard.writeText(output)
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-2xl font-bold">
        Hex / Binary / ASCII Converter
      </h2>

      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Convert between ASCII, hexadecimal and binary encodings.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            From
          </label>

          <select
            value={from}
            onChange={(e) => setFrom(e.target.value as EncodingType)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="ascii">ASCII</option>
            <option value="hex">Hex</option>
            <option value="binary">Binary</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            To
          </label>

          <select
            value={to}
            onChange={(e) => setTo(e.target.value as EncodingType)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="ascii">ASCII</option>
            <option value="hex">Hex</option>
            <option value="binary">Binary</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium">
          Input
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          placeholder="Enter value..."
          className="w-full rounded-lg border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={convert}
          className="rounded-lg bg-teal-600 px-5 py-2 font-medium text-white transition hover:bg-teal-700"
        >
          Convert
        </button>

        <button
          onClick={copyOutput}
          className="rounded-lg border border-zinc-300 px-5 py-2 transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Copy Output
        </button>

        <button
          onClick={clear}
          className="rounded-lg border border-red-300 px-5 py-2 text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/20"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-red-600 dark:border-red-700 dark:bg-red-950">
          {error}
        </div>
      )}

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium">
          Output
        </label>

        <textarea
          value={output}
          readOnly
          rows={5}
          className="w-full rounded-lg border border-zinc-300 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>
    </section>
  )
}