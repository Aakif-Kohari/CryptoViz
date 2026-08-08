import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/hash/sm3'
import { CipherError } from '../../../lib/utils/errors'

describe('SM3 Hash Unit Tests', () => {
  it('passes standard test vectors (encrypt)', () => {
    for (const vector of TEST_VECTORS) {
      const result = encrypt(vector.input, vector.key)
      expect(result.output).toBe(vector.expected)
    }
  })

  it('throws on decrypt', () => {
    expect(() => decrypt()).toThrowError(CipherError)
  })

  it('generates correct step count in instrumented mode', () => {
    const result = encrypt('abc', '', { instrument: true })
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps[0].label).toBe('Preprocessing - padding')
    expect(result.steps[1].label).toBe('Initialize IV state')
    expect(result.steps[2].label).toBe('Message schedule W[0..15]')
    expect(result.steps[67].label).toBe('Update hash state (Bitwise XOR)')
    expect(result.steps[68].label).toBe('Final hash output')
  })

  it('validates input limit (> 2 MB shared limit)', () => {
    const longInput = 'a'.repeat(2 * 1024 * 1024 + 1)
    expect(() => encrypt(longInput)).toThrowError(CipherError)
  })
})
