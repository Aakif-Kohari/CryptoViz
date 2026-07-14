'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { CipherDefinition } from '../../lib/cipher/registry'
import {
  clearFavoriteCipherIds,
  FAVORITE_CIPHERS_CHANGED_EVENT,
  loadFavoriteCipherIds,
} from '../../lib/utils/favoriteCiphers'
import FavoriteCipherButton from './FavoriteCipherButton'

interface PinnedCiphersProps {
  ciphers: CipherDefinition[]
  compact?: boolean
}

export default function PinnedCiphers({
  ciphers,
  compact = false,
}: PinnedCiphersProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    setFavoriteIds(loadFavoriteCipherIds())
    setHasLoaded(true)

    const handleChange = (event: Event) => {
      const customEvent = event as CustomEvent<string[]>
      setFavoriteIds(customEvent.detail ?? loadFavoriteCipherIds())
    }

    window.addEventListener(FAVORITE_CIPHERS_CHANGED_EVENT, handleChange)
    window.addEventListener('storage', handleChange)

    return () => {
      window.removeEventListener(FAVORITE_CIPHERS_CHANGED_EVENT, handleChange)
      window.removeEventListener('storage', handleChange)
    }
  }, [])

  const pinned = useMemo(() => {
    const cipherMap = new Map(ciphers.map((cipher) => [cipher.id, cipher]))
    return favoriteIds
      .map((id) => cipherMap.get(id))
      .filter((cipher): cipher is CipherDefinition => Boolean(cipher))
  }, [ciphers, favoriteIds])

  if (!hasLoaded || pinned.length === 0) return null

  if (compact) {
    return (
      <section aria-labelledby="sidebar-pinned-heading">
        <div className="mb-2 flex items-center justify-between gap-2 px-2">
          <h2
            id="sidebar-pinned-heading"
            className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
          >
            Pinned
          </h2>
          <button
            type="button"
            onClick={clearFavoriteCipherIds}
            className="text-[10px] font-semibold text-zinc-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:text-red-400"
          >
            Clear
          </button>
        </div>

        <ul className="space-y-1">
          {pinned.map((cipher) => (
            <li key={cipher.id} className="flex items-center gap-1">
              <Link
                href={`/visualizer/${cipher.id}/`}
                className="min-w-0 flex-1 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-700 hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-300 dark:hover:bg-teal-950/30 dark:hover:text-teal-400"
              >
                <span className="block truncate">{cipher.name}</span>
              </Link>
              <FavoriteCipherButton
                cipherId={cipher.id}
                cipherName={cipher.name}
                compact
              />
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="pinned-ciphers-heading"
      className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/10"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="pinned-ciphers-heading"
            className="text-xl font-bold text-zinc-950 dark:text-white"
          >
            Pinned ciphers
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Quick access to the algorithms you use most often.
          </p>
        </div>

        <button
          type="button"
          onClick={clearFavoriteCipherIds}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-300"
        >
          Clear pinned
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {pinned.map((cipher) => (
          <div
            key={cipher.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/visualizer/${cipher.id}/`}
                className="min-w-0 flex-1 font-bold text-zinc-900 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-white dark:hover:text-teal-400"
              >
                {cipher.name}
              </Link>
              <FavoriteCipherButton
                cipherId={cipher.id}
                cipherName={cipher.name}
                compact
              />
            </div>
            <p className="mt-2 text-xs uppercase tracking-wider text-zinc-400">
              {cipher.category}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
