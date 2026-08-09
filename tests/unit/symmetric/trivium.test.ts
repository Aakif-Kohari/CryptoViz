import { describe, it, expect } from 'vitest'
import { encrypt, decrypt } from '@/lib/cipher/symmetric/trivium'

describe('Trivium', () => {
    const KEY = '00000000000000000000'
    const IV = '00000000000000000000'
    const PT = '48656c6c6f20576f726c64' // "Hello World"

    it('round-trip with fixed IV: encrypt then decrypt recovers plaintext', () => {
        const ct = encrypt(PT, KEY, { nonce: IV }).output
        // ct = nonce(20) + ciphertext; decrypt reads nonce from front
        expect(decrypt(ct, KEY).output).toBe(PT)
    })

    it('round-trip with random IV (no nonce option)', () => {
        const ct = encrypt(PT, KEY).output
        expect(decrypt(ct, KEY).output).toBe(PT)
    })

    it('same key+IV always produces same keystream', () => {
        const ct1 = encrypt(PT, KEY, { nonce: IV }).output
        const ct2 = encrypt(PT, KEY, { nonce: IV }).output
        expect(ct1).toBe(ct2)
    })

    it('different IVs produce different ciphertexts', () => {
        const IV2 = '01000000000000000000'
        const ct1 = encrypt(PT, KEY, { nonce: IV }).output
        const ct2 = encrypt(PT, KEY, { nonce: IV2 }).output
        expect(ct1).not.toBe(ct2)
    })

    it('throws for key not 10 bytes', () => {
        expect(() => encrypt(PT, '0011223344')).toThrow()
    })

    it('throws for decrypt input shorter than 10-byte IV', () => {
        expect(() => decrypt('aabbcc', KEY)).toThrow()
    })
})
