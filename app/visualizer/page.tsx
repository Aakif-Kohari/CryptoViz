import Link from 'next/link'
import Navbar from '../../components/layout/Navbar'
import FavoriteCipherButton from '../../components/cipher/FavoriteCipherButton'
import PinnedCiphers from '../../components/cipher/PinnedCiphers'
import RecentlyViewedCiphers from '../../components/cipher/RecentlyViewedCiphers'
import CipherLifecycleBadge from '../../components/cipher/CipherLifecycleBadge'
import {
  CIPHER_REGISTRY,
  type CipherDefinition,
} from '../../lib/cipher/registry'
import DecisionTree from '../../components/advisor/DecisionTree'
import { useState } from 'react'

const categoryLabels: Record<CipherDefinition['category'], string> = {
  classical: 'Classical',
  symmetric: 'Symmetric',
  asymmetric: 'Asymmetric',
  hash: 'Hashing',
}

const categoryDescriptions: Record<CipherDefinition['category'], string> = {
  classical: 'Explore foundational substitution and transposition techniques.',
  symmetric: 'Study shared-key encryption, block ciphers, and stream operations.',
  asymmetric: 'Understand public-key cryptography and secure key exchange.',
  hash: 'Inspect hashing, message authentication, and password derivation.',
}

export default function VisualizerIndex() {
  const [activeTab, setActiveTab] = useState<'library' | 'advisor'>('library')

  const categories = (
    ['classical', 'symmetric', 'asymmetric', 'hash'] as const
  ).map((category) => ({
    category,
    ciphers: CIPHER_REGISTRY.filter(
      (cipher) => cipher.category === category,
    ),
  }))

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
            Cipher visualizer
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Choose an algorithm to explore
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Pin frequently used algorithms, revisit recent ciphers, and inspect
            each operation through an interactive step-by-step trace. Or, use the Advisor to find the right algorithm for your use case.
          </p>

          <div className="mt-8 flex gap-4 border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('library')}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'library'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              Algorithm Library
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'advisor'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              Cipher Advisor
            </button>
          </div>
        </header>

        {activeTab === 'advisor' ? (
          <div className="py-8">
            <DecisionTree />
          </div>
        ) : (
          <>
            <PinnedCiphers ciphers={CIPHER_REGISTRY} />
            <RecentlyViewedCiphers ciphers={CIPHER_REGISTRY} />

        <div className="space-y-10">
          {categories.map(({ category, ciphers }) => (
            <section
              key={category}
              aria-labelledby={`${category}-heading`}
              className="space-y-4"
            >
              <div>
                <h2
                  id={`${category}-heading`}
                  className="text-2xl font-bold text-zinc-950 dark:text-white"
                >
                  {categoryLabels[category]}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {categoryDescriptions[category]}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ciphers.map((cipher) => (
                  <article
                    key={cipher.id}
                    className="group relative rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-teal-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/visualizer/${cipher.id}/`}
                        className="min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                      >
                        <h3 className="text-lg font-bold text-zinc-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-400">
                          {cipher.name}
                        </h3>
                      </Link>

                      <FavoriteCipherButton
                        cipherId={cipher.id}
                        cipherName={cipher.name}
                      />
                    </div>

                    <div className="mt-3">
                      <CipherLifecycleBadge status={cipher.securityStatus} />
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {cipher.description}
                    </p>

                    <Link
                      href={`/visualizer/${cipher.id}/`}
                      className="mt-5 inline-flex text-sm font-semibold text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400"
                    >
                      Open visualizer →
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
          </>
        )}
      </main>
    </div>
  )
}
