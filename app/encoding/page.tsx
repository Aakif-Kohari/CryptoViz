'use client'

import Navbar from '../../components/layout/Navbar'
import EncodingExplorer from '../../components/encoding/EncodingExplorer'

export default function EncodingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
            Encoding Explorer
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Compare Popular Encoding Schemes
          </h1>

          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Compare Base16 (Hex), Base32, Base58, Base64 and URL encoding.
          </p>
        </header>
        <EncodingExplorer />
      </main>
    </div>
  )
}