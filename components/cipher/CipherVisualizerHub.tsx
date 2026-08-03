'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '../layout/Navbar'
import FavoriteCipherButton from './FavoriteCipherButton'
import PinnedCiphers from './PinnedCiphers'
import RecentlyViewedCiphers from './RecentlyViewedCiphers'
import CipherLifecycleBadge from './CipherLifecycleBadge'
import {
  CIPHER_REGISTRY,
  type CipherDefinition,
} from '../../lib/cipher/registry'

export interface SpecializedVisualizer {
  id: string
  name: string
  category: 'specialized'
  description: string
  route: string
  securityStatus: CipherDefinition['securityStatus']
  docsLink?: string
}

export const SPECIALIZED_VISUALIZERS: SpecializedVisualizer[] = [
  {
    id: 'aes-key-expansion',
    name: 'AES Key Expansion Visualizer',
    category: 'specialized',
    description:
      'Step-by-step visual trace of key schedule generation, RotWord, SubWord, and Rcon operations.',
    route: '/visualizer/aes-key-expansion/',
    securityStatus: 'recommended',
    docsLink: '/docs',
  },
  {
    id: 'argon2id',
    name: 'Argon2id Memory Hard KDF Visualizer',
    category: 'specialized',
    description:
      'Interactive matrix visualization of memory block filling, lane indexing, and password hashing.',
    route: '/visualizer/argon2id/',
    securityStatus: 'recommended',
    docsLink: '/docs',
  },
  {
    id: 'des-key-schedule',
    name: 'DES Key Schedule Visualizer',
    category: 'specialized',
    description:
      'Visual breakdown of PC-1 permutation, left circular shifts, and PC-2 48-bit subkey derivation.',
    route: '/visualizer/des-key-schedule/',
    securityStatus: 'broken',
    docsLink: '/docs',
  },
  {
    id: 'ecb-pattern',
    name: 'ECB Mode Pattern Leakage Visualizer',
    category: 'specialized',
    description:
      'Demonstrates why Electronic Codebook (ECB) mode preserves plaintext structures (the Tux penguin effect).',
    route: '/visualizer/ecb-pattern/',
    securityStatus: 'broken',
    docsLink: '/docs',
  },
  {
    id: 'hash-collision',
    name: 'Hash Collision Birthday Attack Visualizer',
    category: 'specialized',
    description:
      'Simulates the Birthday Paradox and probabilistic hash collision frequencies across bit lengths.',
    route: '/visualizer/hash-collision/',
    securityStatus: 'legacy',
    docsLink: '/docs',
  },
  {
    id: 'rsa-keygen',
    name: 'RSA Key Generation Step-by-Step Visualizer',
    category: 'specialized',
    description:
      'Interactive prime selection (p, q), modulus calculation (n), totient phi(n), exponent e, and inverse d.',
    route: '/visualizer/rsa-keygen/',
    securityStatus: 'secure',
    docsLink: '/docs',
  },
  {
    id: 'sha256-compression',
    name: 'SHA-256 Compression Function Visualizer',
    category: 'specialized',
    description:
      'Detailed 64-round compression step inspection tracking working registers A-H, Ch, Maj, and Sigma functions.',
    route: '/visualizer/sha256-compression/',
    securityStatus: 'recommended',
    docsLink: '/docs',
  },
  {
    id: 'merkle-proof',
    name: 'Merkle Tree Proof & Verification Visualizer',
    category: 'specialized',
    description:
      'Interactive Merkle tree node builder, leaf hashing, and logarithmic audit path verification.',
    route: '/visualizer/merkle-proof/',
    securityStatus: 'secure',
    docsLink: '/docs',
  },
  {
    id: 'crc32',
    name: 'CRC32 Checksum Polynomial Visualizer',
    category: 'specialized',
    description:
      'Bitwise LFSR polynomial division for data integrity checksum calculation.',
    route: '/visualizer/crc32/',
    securityStatus: 'legacy',
    docsLink: '/docs',
  },
  {
    id: 'idea',
    name: 'IDEA Cipher Structure Visualizer',
    category: 'specialized',
    description:
      'International Data Encryption Algorithm 8.5-round structure combining XOR, addition mod 2^16, and multiplication mod 2^16+1.',
    route: '/visualizer/idea/',
    securityStatus: 'secure',
    docsLink: '/docs',
  },
]

type CategoryFilter = 'all' | CipherDefinition['category'] | 'specialized'
type SecurityFilter = 'all' | CipherDefinition['securityStatus']
type SortOption = 'name' | 'category' | 'security'

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All Visualizers',
  classical: 'Classical',
  symmetric: 'Symmetric',
  asymmetric: 'Asymmetric',
  hash: 'Hashing',
  specialized: 'Specialized Demos',
}

const CATEGORY_DESCRIPTIONS: Record<CategoryFilter, string> = {
  all: 'Explore the full spectrum of cipher visualizers, step-by-step sandboxes, and interactive cryptographic tools.',
  classical: 'Explore foundational substitution and transposition techniques.',
  symmetric: 'Study shared-key encryption, block ciphers, and stream operations.',
  asymmetric: 'Understand public-key cryptography, signatures, and key exchange.',
  hash: 'Inspect hashing, message authentication codes, and key derivation.',
  specialized:
    'Dedicated interactive visualizers tracking internal matrices, round keys, and collision dynamics.',
}

export interface HubCardItem {
  id: string
  name: string
  category: CipherDefinition['category'] | 'specialized'
  description: string
  securityStatus: CipherDefinition['securityStatus']
  visualizerLink: string
  playgroundLink: string
  docsLink: string
}

export default function CipherVisualizerHub() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>('all')
  const [selectedSecurity, setSelectedSecurity] =
    useState<SecurityFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name')

  // Combine CIPHER_REGISTRY items and SPECIALIZED_VISUALIZERS items into a unified card dataset
  const allItems: HubCardItem[] = useMemo(() => {
    const registryItems: HubCardItem[] = CIPHER_REGISTRY.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      description: c.description,
      securityStatus: c.securityStatus,
      visualizerLink: `/visualizer/${c.id}/`,
      playgroundLink: `/visualizer/${c.id}/`,
      docsLink: `/docs`,
    }))

    const specializedItems: HubCardItem[] = SPECIALIZED_VISUALIZERS.map((s) => ({
      id: s.id,
      name: s.name,
      category: 'specialized',
      description: s.description,
      securityStatus: s.securityStatus,
      visualizerLink: s.route,
      playgroundLink: s.route,
      docsLink: s.docsLink || '/docs',
    }))

    return [...registryItems, ...specializedItems]
  }, [])

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      all: allItems.length,
      classical: 0,
      symmetric: 0,
      asymmetric: 0,
      hash: 0,
      specialized: 0,
    }
    allItems.forEach((item) => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++
      }
    })
    return counts
  }, [allItems])

  // Filter & Sort
  const filteredItems = useMemo(() => {
    return allItems
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false
        }
        // Security filter
        if (selectedSecurity !== 'all' && item.securityStatus !== selectedSecurity) {
          return false
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const matchName = item.name.toLowerCase().includes(q)
          const matchDesc = item.description.toLowerCase().includes(q)
          const matchCat = item.category.toLowerCase().includes(q)
          const matchId = item.id.toLowerCase().includes(q)
          const matchStatus = item.securityStatus.toLowerCase().includes(q)
          if (!matchName && !matchDesc && !matchCat && !matchId && !matchStatus) {
            return false
          }
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name)
        }
        if (sortBy === 'category') {
          return a.category.localeCompare(b.category)
        }
        if (sortBy === 'security') {
          return a.securityStatus.localeCompare(b.securityStatus)
        }
        return 0
      })
  }, [allItems, selectedCategory, selectedSecurity, searchQuery, sortBy])

  // Security status summary count
  const secureCount = useMemo(
    () =>
      allItems.filter(
        (i) => i.securityStatus === 'recommended' || i.securityStatus === 'secure',
      ).length,
    [allItems],
  )

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedSecurity('all')
    setSortBy('name')
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-teal-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:bg-teal-400/10 dark:text-teal-400">
              Interactive Hub
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Dedicated Cipher Visualizers
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Cipher Visualizers Hub
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Explore dedicated interactive visualizers, step-by-step state trace sandboxes,
            matrix transformations, and mathematical proofs across all cryptographic ciphers.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4 lg:max-w-4xl">
            <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Visualizers</div>
              <div className="mt-1 text-2xl font-black text-teal-600 dark:text-teal-400">{allItems.length}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Categories</div>
              <div className="mt-1 text-2xl font-black text-zinc-900 dark:text-white">5</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Recommended & Secure</div>
              <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{secureCount}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Specialized Demos</div>
              <div className="mt-1 text-2xl font-black text-cyan-600 dark:text-cyan-400">{SPECIALIZED_VISUALIZERS.length}</div>
            </div>
          </div>
        </header>

        {/* Pinned & Recently Viewed Section */}
        <PinnedCiphers ciphers={CIPHER_REGISTRY} />
        <RecentlyViewedCiphers ciphers={CIPHER_REGISTRY} />

        {/* Search & Filter Toolbar */}
        <section className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40" aria-label="Filters and Search">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative min-w-0 flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <svg
                  className="h-4 w-4 text-zinc-400 dark:text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search visualizers by name, category, or description (e.g. AES, RSA, Feistel)..."
                aria-label="Search cipher visualizers"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-10 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500 dark:focus:border-teal-400 dark:focus:bg-zinc-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Filters & Sort */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              {/* Security Filter */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="security-filter" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Status:
                </label>
                <select
                  id="security-filter"
                  aria-label="Filter by security status"
                  value={selectedSecurity}
                  onChange={(e) => setSelectedSecurity(e.target.value as SecurityFilter)}
                 className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs sm:w-auto ..."
                >
                  <option value="all">All Security Levels</option>
                  <option value="recommended">Recommended</option>
                  <option value="secure">Secure</option>
                  <option value="legacy">Legacy</option>
                  <option value="deprecated">Deprecated</option>
                  <option value="broken">Broken</option>
                  <option value="experimental">Experimental</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="sort-by" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Sort:
                </label>
                <select
                  id="sort-by"
                  aria-label="Sort visualizers"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs sm:w-auto ..."
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="category">Category</option>
                  <option value="security">Security Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800" role="tablist" aria-label="Cipher Categories">
            {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((cat) => {
              const isActive = selectedCategory === cat
              const count = categoryCounts[cat]

              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/30 dark:bg-teal-400 dark:text-zinc-950'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{CATEGORY_LABELS[cat]}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-zinc-950/20 dark:text-zinc-950'
                        : 'bg-zinc-200/80 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Results Header & Summary */}
        <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {CATEGORY_LABELS[selectedCategory]}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {CATEGORY_DESCRIPTIONS[selectedCategory]}
            </p>
          </div>

          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Showing <span className="font-bold text-teal-600 dark:text-teal-400">{filteredItems.length}</span> visualizers
          </div>
        </div>

        {/* Visualizer Cards Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-teal-700"
              >
                <div>
                  {/* Top Bar: Title + Favorite */}
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={item.visualizerLink}
                      className="min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                    >
                      <h3 className="break-wordstext-lg font-bold text-zinc-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-400">
                        {item.name}
                      </h3>
                    </Link>

                    {item.category !== 'specialized' && (
                      <FavoriteCipherButton
                        cipherId={item.id}
                        cipherName={item.name}
                      />
                    )}
                  </div>

                  {/* Badges Bar */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {item.category}
                    </span>
                    <CipherLifecycleBadge status={item.securityStatus} />
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>

                {/* Footer Links & Actions */}
                <div className="mt-6 flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800/80">
                  <Link
                    href={item.visualizerLink}
                    className="inline-flex items-center gap-1 text-sm font-bold text-teal-600 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    Open Visualizer →
                  </Link>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={item.playgroundLink}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      Playground
                    </Link>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <Link
                      href={item.docsLink}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      Docs
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/20">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
              No cipher visualizers found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              No visualizers match your current search query "{searchQuery}" or selected category/security filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 dark:bg-teal-400 dark:text-zinc-950 dark:hover:bg-teal-300"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
