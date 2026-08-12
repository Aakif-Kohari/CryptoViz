import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/simon'

describe('SIMON-128/128', () => {
    it('matches official IACR 2013/404 test vector', () => {
        const v = TEST_VECTORS[0]
        expect(encrypt(v.input, v.key).output).toBe(v.expected)
    })

    it('round-trip: encrypt then decrypt recovers plaintext', () => {
        const key = '000102030405060708090a0b0c0d0e0f'
        const pt = '00112233445566778899aabbccddeeff'
        const ct = encrypt(pt, key).output
        expect(decrypt(ct, key).output).toBe(pt)
    })

    it('different keys produce different ciphertexts', () => {
        const pt = '00000000000000000000000000000000'
        const key1 = '00000000000000000000000000000000'
        const key2 = '00000000000000000000000000000001'
        expect(encrypt(pt, key1).output).not.toBe(encrypt(pt, key2).output)
    })

    it('throws for non-16-byte key', () => {
        expect(() => encrypt('00000000000000000000000000000000', '0000')).toThrow()
    })

    it('throws for input not multiple of 16 bytes', () => {
        expect(() => encrypt('001122', '000102030405060708090a0b0c0d0e0f')).toThrow()
    })
})
