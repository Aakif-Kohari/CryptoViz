import { describe, it, expect } from 'vitest'
import { CIPHER_COLLECTIONS } from '../../../lib/cipher/collections'
import { CIPHER_REGISTRY } from '../../../lib/cipher/registry'

describe('Cipher Collections Registry', () => {
  it('should define valid collections with non-empty attributes', () => {
    expect(CIPHER_COLLECTIONS.length).toBeGreaterThan(0)
    for (const col of CIPHER_COLLECTIONS) {
      expect(col.id).toBeTruthy()
      expect(col.name).toBeTruthy()
      expect(col.description).toBeTruthy()
      expect(col.cipherIds.length).toBeGreaterThan(0)
      expect(col.features.length).toBeGreaterThan(0)
    }
  })

  it('should only reference existing cipher IDs in CIPHER_REGISTRY', () => {
    const registryIds = new Set(CIPHER_REGISTRY.map((c) => c.id))
    for (const col of CIPHER_COLLECTIONS) {
      for (const cipherId of col.cipherIds) {
        expect(registryIds.has(cipherId)).toBe(true)
      }
    }
  })
})
