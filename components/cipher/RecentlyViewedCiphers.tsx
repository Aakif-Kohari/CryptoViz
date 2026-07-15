'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { CipherDefinition } from '../../lib/cipher/registry'

const RECENTLY_VIEWED_CIPHER_IDS_KEY = 'recentlyViewedCipherIds'

function loadRecentlyViewedCipherIds() {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(RECENTLY_VIEWED_CIPHER_IDS_KEY)
    return stored ? (JSON.parse(stored) as string[]) : []
  } catch {
    return []
  }
}

function clearRecentlyViewedCipherIds() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(RECENTLY_VIEWED_CIPHER_IDS_KEY)
  window.dispatchEvent(new Event('storage'))
}

interface RecentlyViewedCiphersProps {
  ciphers: CipherDefinition[]
}

export default function RecentlyViewedCiphers({ ciphers }: RecentlyViewedCiphersProps) {
  const [recentIds, setRecentIds] = useState<string[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    setRecentIds(loadRecentlyViewedCipherIds())
    setHasLoaded(true)

    const handleStorage = () => setRecentIds(loadRecentlyViewedCipherIds())

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const recentlyViewed = useMemo(() => {
    const cipherMap = new Map(ciphers.map((cipher) => [cipher.id, cipher]))
    return recentIds
      .map((id) => cipherMap.get(id))
      .filter((cipher): cipher is CipherDefinition => Boolean(cipher))
  }, [ciphers, recentIds])

  if (!hasLoaded || recentlyViewed.length === 0) return null

  return (
    <section
      aria-labelledby="recently-viewed-ciphers-heading"
      className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5 shadow-sm dark:border-teal-900/60 dark:bg-teal-950/10"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="recently-viewed-ciphers-heading"
            className="text-xl font-bold text-zinc-950 dark:text-white"
          >
            Recently viewed ciphers
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Quickly return to ciphers you looked at most recently.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            clearRecentlyViewedCipherIds()
            setRecentIds([])
          }}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-zinc-400 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-teal-700 dark:hover:bg-zinc-800"
        >
          Clear
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {recentlyViewed.map((cipher) => (
          <div
            key={cipher.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <Link
              href={`/visualizer/${cipher.id}/`}
              className="min-w-0 block font-bold text-zinc-900 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-white dark:hover:text-teal-400"
            >
              {cipher.name}
            </Link>
            <p className="mt-2 text-xs uppercase tracking-wider text-zinc-400">
              {cipher.category}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
