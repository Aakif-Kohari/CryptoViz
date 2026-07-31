import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/symmetric/blowfish'
import { CipherError } from '../../../lib/utils/errors'
import fc from 'fast-check'

describe('Blowfish Unit Tests', () => {
    it('passes standard test vectors (encrypt)', () => {
        for (const vector of TEST_VECTORS) {
            const result = encrypt(vector.input, vector.key)
            expect(result.output).toBe(vector.expected)
        }
    })

    it('passes standard test vectors (decrypt)', () => {
        for (const vector of TEST_VECTORS) {
            const result = decrypt(vector.expected, vector.key)
            expect(result.output).toBe(vector.input)
        }
    })

    it('throws INVALID_KEY_LENGTH for a key shorter than 4 bytes', () => {
        expect(() => encrypt('0000000000000000', '010203')).toThrowError(CipherError)
    })

    it('throws INVALID_KEY_LENGTH for a key longer than 56 bytes', () => {
        const longKey = '00'.repeat(57)
        expect(() => encrypt('0000000000000000', longKey)).toThrowError(CipherError)
    })

    it('throws INVALID_INPUT when plaintext is not a multiple of 8 bytes', () => {
        const key = '0000000000000000'
        expect(() => encrypt('00112233445566', key)).toThrowError(CipherError)
    })

    it('throws INVALID_INPUT when ciphertext is not a multiple of 8 bytes', () => {
        const key = '0000000000000000'
        expect(() => decrypt('00112233445566', key)).toThrowError(CipherError)
    })

    it('encrypts then decrypts correctly (round-trip)', () => {
        const key = '0123456789abcdef'
        const plaintext = '00112233445566778899aabbccddeeff'

        const enc = encrypt(plaintext, key)
        const dec = decrypt(enc.output, key)

        expect(dec.output).toBe(plaintext)
    })

    it('round-trips correctly across random multi-block inputs (fuzz)', () => {
        fc.assert(
            fc.property(
                fc.uint8Array({
                    minLength: 8,
                    maxLength: 128,
                    size: 'max'
                }).filter(arr => arr.length % 8 === 0),
                (bytes) => {
                    const key = '0123456789abcdef'
                    const input = Buffer.from(bytes).toString('hex')

                    const enc = encrypt(input, key)
                    const dec = decrypt(enc.output, key)

                    expect(dec.output).toBe(input)
                }
            ),
            { numRuns: 200 }
        )
    })

    it('different keys produce different ciphertexts', () => {
        const plaintext = '0000000000000000'

        const a = encrypt(plaintext, '0000000000000000')
        const b = encrypt(plaintext, '1111111111111111')

        expect(a.output).not.toBe(b.output)
    })

    it('instrumented mode emits key schedule and block milestones', () => {
        const result = encrypt(
            '0000000000000000',
            '0000000000000000',
            { instrument: true }
        )

        expect(result.steps.length).toBeGreaterThanOrEqual(2)
        expect(result.steps.some(step => step.label.includes('Key schedule'))).toBe(true)
        expect(result.steps.some(step => step.label.includes('Block 1'))).toBe(true)
    })

    it('instrumented decrypt also emits block milestones', () => {
        const ciphertext = encrypt(
            '0000000000000000',
            '0000000000000000'
        ).output

        const result = decrypt(
            ciphertext,
            '0000000000000000',
            { instrument: true }
        )

        expect(result.steps.some(step => step.label.includes('Key schedule'))).toBe(true)
        expect(result.steps.some(step => step.label.includes('Block 1'))).toBe(true)
    })
})
