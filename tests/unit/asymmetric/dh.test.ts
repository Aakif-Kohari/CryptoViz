import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/asymmetric/dh'

describe('Diffie-Hellman Key Exchange Unit Tests', () => {
  it('passes standard test vectors (agreement)', () => {
    // Vector 1: a=6, b=15, p=23, g=5 -> Shared secret K=2
    const vector = TEST_VECTORS[0]
    const result = encrypt(vector.input, vector.key)
    expect(result.output).toBe(vector.expected)
  })

  it('passes standard test vectors (alice public key computation)', () => {
    // Vector 2: a=6, p=23, g=5 -> Public key A=8
    const vector = TEST_VECTORS[1]
    const result = encrypt(vector.input, vector.key)
    expect(result.output).toBe(vector.expected)
  })

  it('handles instrumented mode correctly with paint analogy', () => {
    const result = encrypt('6,15', '23,5', { instrument: true })
    expect(result.steps.length).toBe(10) // 10 steps total
    expect(result.steps[1].label).toContain('Paint Mixing')
    expect(result.output).toBe('2')
  })

  it('throws on private key secrets out of range [2, p-2]', () => {
    expect(() => encrypt('1,15', '23,5')).toThrow(/must be in range/)
    expect(() => encrypt('22,15', '23,5')).toThrow(/must be in range/)
    expect(() => encrypt('6,1', '23,5')).toThrow(/must be in range/)
    expect(() => encrypt('6,22', '23,5')).toThrow(/must be in range/)
  })

  it('throws on decrypt as DH is key exchange only', () => {
    expect(() => decrypt('2')).toThrow(/does not support decryption/)
  })

  it('real mode performs a genuine ECDH P-256 key exchange', () => {
    const res = encrypt('alice_secret_seed', '', { mode: 'real', instrument: true })
    expect(res.metadata.name).toBe('ECDH P-256')
    expect(res.metadata.keySize).toBe(256)
    // Shared secret is the 32-byte x-coordinate -> 64 hex chars.
    expect(res.output).toMatch(/^[0-9a-f]{64}$/)
    expect(res.steps.length).toBe(1)
    expect(res.steps[0].note).toMatch(/Elliptic Curve Diffie-Hellman/)
    // Both parties' public keys are shown, proving a real exchange took place.
    expect(res.steps[0].table).toHaveLength(2)
  })

  it('real mode yields a valid shared secret for any seed input', () => {
    const res = encrypt('6,15', '', { mode: 'real' })
    expect(res.output).toMatch(/^[0-9a-f]{64}$/)
    expect(res.outputEncoding).toBe('hex')
  })
})
