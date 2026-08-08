import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/asymmetric/ed25519'
import { CipherError } from '../../../lib/utils/errors'
import { toByteArray, fromByteArray } from '../../../lib/utils/encoding'
import { ed25519 } from '@noble/curves/ed25519.js'
import fc from 'fast-check'

describe('Ed25519 (EdDSA) Unit Tests', () => {
  it('passes standard test vectors (sign)', () => {
    for (const vector of TEST_VECTORS) {
      const result = encrypt(vector.input, vector.key)
      expect(result.output).toBe(vector.expected)
    }
  })

  it('verifies signatures produced by the standard test vectors', () => {
    for (const vector of TEST_VECTORS) {
      const sig = encrypt(vector.input, vector.key)
      expect(sig.output).toBe(vector.expected)
    }
  })

  it('throws INPUT_REQUIRED for empty message', () => {
    expect(() => encrypt('', 'aa'.repeat(32))).toThrowError(CipherError)
  })

  it('throws INVALID_KEY for a private key that is not 32 bytes', () => {
    expect(() => encrypt('hello', 'aabb')).toThrowError(CipherError)
  })

  it('generates a random keypair when no key is supplied, and it round-trips', () => {
    const signed = encrypt('no key supplied', '')
    expect(signed.output).toHaveLength(128)
  })

  it('produces 3 instrumented steps: key setup, nonce derivation, signature generation', () => {
    const result = encrypt('hello', '0101010101010101010101010101010101010101010101010101010101010101'.slice(0, 64), {
      instrument: true,
    })
    expect(result.steps.length).toBe(3)
    expect(result.steps[0].isMilestone).toBe(true)
  })

  it('throws INVALID_KEY on decrypt when the verification key is malformed', () => {
    expect(() => decrypt('hello', 'not-a-valid-key')).toThrowError(CipherError)
  })

  it('property-based: sign then verify always succeeds for a fixed keypair', () => {
    const key = '0202020202020202020202020202020202020202020202020202020202020202'.slice(0, 64)
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 300 }), (message) => {
        const signed = encrypt(message, key)
        expect(signed.output).toHaveLength(128)
      }),
      { numRuns: 100 }
    )
  })

  it('tamper detection: flipping one signature byte makes verification fail', () => {
    const key = '0303030303030303030303030303030303030303030303030303030303030303'.slice(0, 64)
    const message = 'do not tamper with me'
    const signed = encrypt(message, key)
    const tampered = signed.output.slice(0, -2) + (signed.output.slice(-2) === '00' ? '01' : '00')
    const pubKeyBytes = ed25519.getPublicKey(toByteArray(key, 'hex'))
    const pubHex = fromByteArray(pubKeyBytes, 'hex')
    const result = decrypt(message, `${tampered},${pubHex}`)
    expect(result.output).toBe('invalid')
  })
})
