'use client'

import { useEffect, useState } from 'react'
import {
  FAVORITE_CIPHERS_CHANGED_EVENT,
  loadFavoriteCipherIds,
  saveFavoriteCipherIds,
  toggleFavoriteCipher,
} from '../../lib/utils/favoriteCiphers'

interface FavoriteCipherButtonProps {
  cipherId: string
  cipherName: string
  compact?: boolean
}

export default function FavoriteCipherButton({
  cipherId,
  cipherName,
  compact = false,
}: FavoriteCipherButtonProps) {
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

  const isFavorite = favoriteIds.includes(cipherId)

  const handleToggle = () => {
    const next = toggleFavoriteCipher(favoriteIds, cipherId)
    setFavoriteIds(saveFavoriteCipherIds(next))
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={!hasLoaded}
      aria-label={
        isFavorite
          ? `Unpin ${cipherName} from favorites`
          : `Pin ${cipherName} to favorites`
      }
      aria-pressed={isFavorite}
      title={isFavorite ? 'Remove from pinned ciphers' : 'Pin cipher'}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-wait disabled:opacity-50 ${
        compact ? 'h-7 w-7 text-sm' : 'h-9 w-9 text-lg'
      } ${
        isFavorite
          ? 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400'
          : 'border-zinc-200 bg-white text-zinc-400 hover:border-amber-300 hover:text-amber-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500 dark:hover:border-amber-900 dark:hover:text-amber-400'
      }`}
    >
      <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
    </button>
  )
}
