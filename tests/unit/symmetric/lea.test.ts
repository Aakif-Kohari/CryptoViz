import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/lea'

describe('LEA', () => {
    it('matches RFC 9998 test vector (128-bit key)', () => {
        const v = TEST_VECTORS[0]
        expect(encrypt(v.input, v.key).output.toLowerCase()).toBe(v.expected.toLowerCase())
    })

    it('round-trip 128-bit key', () => {
        const key = '0f1e2d3c4b5a69788796a5b4c3d2e1f0'
        const pt = '101112131415161718191a1b1c1d1e1f'
        expect(decrypt(encrypt(pt, key).output, key).output.toLowerCase()).toBe(pt.toLowerCase())
    })

    it('round-trip 192-bit key', () => {
        const key = '0f1e2d3c4b5a69788796a5b4c3d2e1f00001020304050607'
        const pt = 'aabbccddeeff00112233445566778899'
        expect(decrypt(encrypt(pt, key).output, key).output.toLowerCase()).toBe(pt.toLowerCase())
    })

    it('round-trip 256-bit key', () => {
        const key = '0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a69788796a5b4c3d2e1f0'
        const pt = '00000000000000000000000000000000'
        expect(decrypt(encrypt(pt, key).output, key).output.toLowerCase()).toBe(pt.toLowerCase())
    })

    it('throws for invalid key size', () => {
        expect(() => encrypt('00000000000000000000000000000000', '0011')).toThrow()
    })

    it('throws for input not multiple of 16 bytes', () => {
        expect(() => encrypt('001122', '0f1e2d3c4b5a69788796a5b4c3d2e1f0')).toThrow()
    })
})
