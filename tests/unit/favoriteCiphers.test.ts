import { describe, expect, it } from 'vitest'
import {
  MAX_FAVORITE_CIPHERS,
  normalizeFavoriteCipherIds,
  toggleFavoriteCipher,
} from '../../lib/utils/favoriteCiphers'

const supported = new Set([
  'caesar',
  'aes',
  'rsa',
  'sha256',
  'des',
  'xor',
  'otp',
  'md5',
  'dh',
])

describe('favorite cipher utilities', () => {
  it('rejects malformed values', () => {
    expect(normalizeFavoriteCipherIds(null, supported)).toEqual([])
    expect(normalizeFavoriteCipherIds('caesar', supported)).toEqual([])
  })

  it('removes duplicate, unsupported, and non-string ids', () => {
    expect(
      normalizeFavoriteCipherIds(
        ['caesar', 'missing', 'aes', 'caesar', 42],
        supported,
      ),
    ).toEqual(['caesar', 'aes'])
  })

  it('adds a supported cipher', () => {
    expect(toggleFavoriteCipher(['caesar'], 'aes')).toEqual([
      'caesar',
      'aes',
    ])
  })

  it('removes an existing favorite', () => {
    expect(toggleFavoriteCipher(['caesar', 'aes'], 'caesar')).toEqual([
      'aes',
    ])
  })

  it('does not add unsupported ciphers', () => {
    expect(toggleFavoriteCipher(['caesar'], 'unknown')).toEqual([
      'caesar',
    ])
  })

  it('keeps favorites within the configured maximum', () => {
    const ids = [
      'caesar',
      'aes',
      'rsa',
      'sha256',
      'des',
      'xor',
      'otp',
      'md5',
      'dh',
    ]

    expect(normalizeFavoriteCipherIds(ids, supported).length).toBeLessThanOrEqual(
      MAX_FAVORITE_CIPHERS,
    )
  })
})
