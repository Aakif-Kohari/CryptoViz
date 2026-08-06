'use client'

import React, { useState } from 'react'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import Navbar from '../../components/layout/Navbar'

export default function FiniteFieldPage() {
  const [polyA, setPolyA] = useState<string>('57') // Default hex values often used in AES examples (e.g. {57} * {83} = {c1})
  const [polyB, setPolyB] = useState<string>('83')
  const [activeTab, setActiveTab] = useState<'calc' | 'aes' | 'docs'>('calc')

  // Helper to parse hex string safely
  const parseHex = (val: string) => {
    const clean = val.replace(/^0x/, '')
    const num = parseInt(clean, 16)
    return isNaN(num) ? 0 : num & 0xFF
  }

  const aVal = parseHex(polyA)
  const bVal = parseHex(polyB)

  // GF(2^8) Addition is simply XOR
  const gfAdd = aVal ^ bVal

  // GF(2^8) Multiplication using Rijndael's finite field multiplication algorithm
  const gfMul = (a: number, b: number) => {
    let p = 0
    let hiBit = 0
    let tempA = a
    let tempB = b
    for (let i = 0; i < 8; i++) {
      if ((tempB & 1) !== 0) {
        p ^= tempA
      }
      hiBit = tempA & 0x80
      tempA = (tempA << 1) & 0xFF
      if (hiBit !== 0) {
        tempA ^= 0x1b // AES irreducible polynomial x^8 + x^4 + x^3 + x + 1 (0x1B)
      }
      tempB >>= 1
    }
    return p
  }

  const mulResult = gfMul(aVal, bVal)

  // Convert number to binary polynomial representation string
  const toPolynomialString = (n: number) => {
    const terms = []
    for (let i = 7; i >= 0; i--) {
      if ((n & (1 << i)) !== 0) {
        if (i === 0) terms.push('1')
        else if (i === 1) terms.push('x')
        else terms.push(`x<sup>${i}</sup>`)
      }
    }
    return terms.length > 0 ? terms.join(' + ') : '0'
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Sandbox" }, { label: "Finite Field Visualizer" }]} />

        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
            Cryptographic Foundations
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Finite Field GF(2^8) Visualizer
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Explore Galois Field arithmetic used in the Advanced Encryption Standard (AES) MixColumns and SubBytes layers.
          </p>
        </header>

        {/* Input Controls */}
        <section aria-label="Field Controls" className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div>
            <label htmlFor="polyA" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Polynomial A (Hexadecimal, e.g., 57)
            </label>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-zinc-500 font-mono">0x</span>
              <input
                id="polyA"
                type="text"
                maxLength={2}
                value={polyA}
                onChange={(e) => setPolyA(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm uppercase font-mono focus:border-teal-500 focus:outline-none dark:border-zinc-700"
              />
            </div>
            <p className="mt-1 text-xs text-zinc-500">Binary: {aVal.toString(2).padStart(8, '0')}</p>
          </div>

          <div>
            <label htmlFor="polyB" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Polynomial $B$ (Hexadecimal, e.g., 83)
            </label>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-zinc-500 font-mono">0x</span>
              <input
                id="polyB"
                type="text"
                maxLength={2}
                value={polyB}
                onChange={(e) => setPolyB(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm uppercase font-mono focus:border-teal-500 focus:outline-none dark:border-zinc-700"
              />
            </div>
            <p className="mt-1 text-xs text-zinc-500">Binary: {bVal.toString(2).padStart(8, '0')}</p>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('calc')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'calc'
                ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
            }`}
          >
            Field Operations
          </button>
          <button
            onClick={() => setActiveTab('aes')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'aes'
                ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
            }`}
          >
            AES Context
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'docs'
                ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'
            }`}
          >
            Documentation
          </button>
        </div>

        {/* Tab Content: Calculations */}
        {activeTab === 'calc' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-lg font-bold">Addition (A ⊕ B)</h3>
              <p className="text-xs text-zinc-500">In GF(2^8), addition corresponds to coefficient-wise addition modulo 2, which is implemented via the bitwise XOR operation.</p>
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 font-mono text-sm space-y-2">
                <p>Hex Result: <span className="font-bold text-teal-600 dark:text-teal-400">0x{gfAdd.toString(16).toUpperCase().padStart(2, '0')}</span></p>
                <p>Decimal: {gfAdd}</p>
                <p>Binary: {gfAdd.toString(2).padStart(8, '0')}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-lg font-bold">Multiplication ($A \otimes B$)</h3>
              <p className="text-xs text-zinc-500">Polynomial multiplication modulo the irreducible polynomial $m(x) = x^8 + x^4 + x^3 + x + 1$ (0x1B).</p>
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 font-mono text-sm space-y-2">
                <p>Hex Result: <span className="font-bold text-teal-600 dark:text-teal-400">0x{mulResult.toString(16).toUpperCase().padStart(2, '0')}</span></p>
                <p>Decimal: {mulResult}</p>
                <p>Binary: {mulResult.toString(2).padStart(8, '0')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: AES Context */}
        {activeTab === 'aes' && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-lg font-bold">Role in AES Encryption</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              AES uses bytes as elements of the finite field GF(2<sup>8</sup>). Each byte (b<sub>7</sub> b<sub>6</sub> b<sub>5</sub> b<sub>4</sub> b<sub>3</sub> b<sub>2</sub> b<sub>1</sub> b<sub>0</sub>) is interpreted as a polynomial:
            </p>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 font-mono text-sm">
              <p dangerouslySetInnerHTML={{ __html: `A(x) = b_7x^7 + b_6x^6 + b_5x^5 + b_4x^4 + b_3x^3 + b_2x^2 + b_1x + b_0` }} />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Operations in this field ensure that all mixing steps in AES are fully reversible, maintaining cryptographic diffusion and confusion securely.
            </p>
          </div>
        )}

        {/* Tab Content: Docs */}
        {activeTab === 'docs' && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-lg font-bold">Documentation & Specifications</h3>
            <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Field Size: $2^8 = 256$ elements ($0x00$ to $0xFF$).</li>
              <li>Irreducible Polynomial: $m(x) = x^8 + x^4 + x^3 + x + 1$ (represented as `0x1B`).</li>
              <li>Additions & Subtractions are equivalent to XOR operations.</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
