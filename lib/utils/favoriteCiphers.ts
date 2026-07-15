import { CIPHER_REGISTRY } from '../cipher/registry'

export const FAVORITE_CIPHERS_STORAGE_KEY = 'cryptoviz-favorite-ciphers'
export const FAVORITE_CIPHERS_CHANGED_EVENT = 'cryptoviz:favorite-ciphers-changed'
export const MAX_FAVORITE_CIPHERS = 20

export function getSupportedCipherIds(): ReadonlySet<string> {
  return new Set(CIPHER_REGISTRY.map((cipher) => cipher.id))
}

export function normalizeFavoriteCipherIds(
  value: unknown,
  supportedIds: ReadonlySet<string> = getSupportedCipherIds(),
): string[] {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  const normalized: string[] = []

  for (const item of value) {
    if (
      typeof item !== 'string' ||
      seen.has(item) ||
      !supportedIds.has(item)
    ) {
      continue
    }

    seen.add(item)
    normalized.push(item)

    if (normalized.length === MAX_FAVORITE_CIPHERS) break
  }

  return normalized
}

export function loadFavoriteCipherIds(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(FAVORITE_CIPHERS_STORAGE_KEY)
    return raw ? normalizeFavoriteCipherIds(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

function dispatchFavoriteChange(ids: string[]) {
  if (typeof window === 'undefined') return

  window.dispatchEvent(
    new CustomEvent<string[]>(FAVORITE_CIPHERS_CHANGED_EVENT, {
      detail: ids,
    }),
  )
}

export function saveFavoriteCipherIds(ids: string[]): string[] {
  const normalized = normalizeFavoriteCipherIds(ids)

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        FAVORITE_CIPHERS_STORAGE_KEY,
        JSON.stringify(normalized),
      )
    } catch {
      // Storage may be unavailable in private mode or when quota is full.
    }

    dispatchFavoriteChange(normalized)
  }

  return normalized
}

export function toggleFavoriteCipher(
  currentIds: string[],
  cipherId: string,
): string[] {
  const supportedIds = getSupportedCipherIds()

  if (!supportedIds.has(cipherId)) {
    return normalizeFavoriteCipherIds(currentIds, supportedIds)
  }

  if (currentIds.includes(cipherId)) {
    return normalizeFavoriteCipherIds(
      currentIds.filter((id) => id !== cipherId),
      supportedIds,
    )
  }

  return normalizeFavoriteCipherIds([...currentIds, cipherId], supportedIds)
}

export function clearFavoriteCipherIds(): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(FAVORITE_CIPHERS_STORAGE_KEY)
  } catch {
    // Clearing favorites should remain a no-op when storage is unavailable.
  }

  dispatchFavoriteChange([])
}
