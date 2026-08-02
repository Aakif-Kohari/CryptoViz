import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/salsa20'

describe('Salsa20', () => {
  it.each(TEST_VECTORS)('matches known vector: $description', ({ input, key, expected }) => {
    expect(encrypt(input, key).output).toBe(expected)
  })

  it('round-trips arbitrary hex input', () => {
    const key = '0100000000000000000000000000000000000000000000000000000000000000|0000000000000000'
    const pt = 'deadbeef'
    const ct = encrypt(pt, key)
    expect(decrypt(ct.output, key).output).toBe(pt)
  })

  it('supports key|nonce:counter format', () => {
    const key = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f|0000000000000000:1'
    const pt = 'Hello, Salsa20!'
    const ct = encrypt(pt, key)
    expect(decrypt(ct.output, key).output).toBe(pt)
  })

  it('handles options.encoding = hex', () => {
    const key = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f|0000000000000000'
    const pt = '0000000000000000'
    const ct = encrypt(pt, key, { encoding: 'hex' })
    expect(decrypt(ct.output, key, { encoding: 'hex' }).output).toBe(pt)
  })

  it('throws on malformed key|nonce format', () => {
    expect(() => encrypt('deadbeef', 'not-a-valid-key')).toThrow()
  })
})