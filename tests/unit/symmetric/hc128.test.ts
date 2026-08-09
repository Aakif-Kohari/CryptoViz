import { describe, it, expect } from 'vitest'
import { encrypt, decrypt } from '@/lib/cipher/symmetric/hc128'

describe('HC-128', () => {
    const KEY = '00000000000000000000000000000000'
    const IV = '00000000000000000000000000000000'
    const PT = '48656c6c6f20576f726c64'

    it('round-trip with fixed IV', () => {
        const ct = encrypt(PT, KEY, { nonce: IV }).output
        expect(decrypt(ct, KEY).output).toBe(PT)
    })

    it('round-trip with random IV', () => {
        const ct = encrypt(PT, KEY).output
        expect(decrypt(ct, KEY).output).toBe(PT)
    })

    it('same key+IV always produces same output', () => {
        const ct1 = encrypt(PT, KEY, { nonce: IV }).output
        const ct2 = encrypt(PT, KEY, { nonce: IV }).output
        expect(ct1).toBe(ct2)
    })

    it('different IVs produce different ciphertexts', () => {
        const IV2 = '01000000000000000000000000000000'
        expect(encrypt(PT, KEY, { nonce: IV }).output).not.toBe(encrypt(PT, KEY, { nonce: IV2 }).output)
    })

    it('output = 32-char IV hex + ciphertext', () => {
        const ct = encrypt(PT, KEY, { nonce: IV }).output
        expect(ct.slice(0, 32)).toBe(IV) // IV is prepended
    })

    it('throws for key not 16 bytes', () => {
        expect(() => encrypt(PT, '0011223344')).toThrow()
    })

    it('throws for decrypt input shorter than 16-byte IV', () => {
        expect(() => decrypt('aabbcc', KEY)).toThrow()
    })
})
