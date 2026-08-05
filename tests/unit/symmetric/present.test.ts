import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/present'

describe('PRESENT', () => {
    it('matches ISO/IEC 29192-2 PRESENT-80 vector 1 (zero key)', () => {
        const v = TEST_VECTORS[0]
        expect(encrypt(v.input, v.key).output).toBe(v.expected)
    })

    it('matches ISO/IEC 29192-2 PRESENT-80 vector 2 (all-ones)', () => {
        const v = TEST_VECTORS[1]
        expect(encrypt(v.input, v.key).output).toBe(v.expected)
    })

    it('matches ISO/IEC 29192-2 PRESENT-128 vector', () => {
        const v = TEST_VECTORS[2]
        expect(encrypt(v.input, v.key).output).toBe(v.expected)
    })

    it('round-trip PRESENT-80', () => {
        const key = '0f1e2d3c4b5a697887a6'
        const pt = 'aabbccddeeff0011'
        expect(decrypt(encrypt(pt, key).output, key).output).toBe(pt)
    })

    it('round-trip PRESENT-128', () => {
        const key = '0f1e2d3c4b5a69788796a5b4c3d2e1f0'
        const pt = 'aabbccddeeff0011'
        expect(decrypt(encrypt(pt, key).output, key).output).toBe(pt)
    })

    it('throws for invalid key length', () => {
        expect(() => encrypt('0000000000000000', '0011223344')).toThrow()
    })

    it('throws for input not multiple of 8 bytes', () => {
        expect(() => encrypt('001122', '00000000000000000000')).toThrow()
    })
})
