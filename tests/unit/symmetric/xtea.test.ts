import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/xtea'
import { CipherError } from '@/lib/utils'

describe('XTEA', () => {
  it.each(TEST_VECTORS)('matches known vector: $description', ({ input, key, expected }) => {
    expect(encrypt(input, key).output.toUpperCase()).toBe(expected.toUpperCase())
  })

  it('round-trips arbitrary 8-byte-aligned hex input', () => {
    const key = '000102030405060708090a0b0c0d0e0f'
    const pt = 'deadbeefcafebabe'
    const ct = encrypt(pt, key)
    expect(decrypt(ct.output, key).output).toBe(pt)
  })

  it('throws INPUT_REQUIRED on empty input', () => {
    expect(() => encrypt('', '000102030405060708090a0b0c0d0e0f')).toThrow(CipherError)
  })

  it('throws INVALID_KEY_LENGTH on wrong key size', () => {
    expect(() => encrypt('4142434445464748', 'aabb')).toThrow(CipherError)
  })

  it('throws INPUT_TOO_LONG above 4096 bytes', () => {
    const huge = 'ab'.repeat(4200)
    expect(() => encrypt(huge, '000102030405060708090a0b0c0d0e0f')).toThrow(CipherError)
  })
})
