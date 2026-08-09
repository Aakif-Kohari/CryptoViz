'use client'

import Navbar from '../../components/layout/Navbar'
import SBoxExplorer from '../../components/sbox/SBoxExplorer'

export default function SBoxPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
            Confusion workspace
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            S-Box Explorer
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Substitution boxes are what give block ciphers their non-linearity —
            without them, a cipher would just be a chain of predictable linear
            operations. Pick a table, type an input, and watch the exact row
            and column it maps to, along with the byte or nibble that comes
            out the other side.
          </p>
        </header>

        <SBoxExplorer />
      </main>
    </div>
  )
}
