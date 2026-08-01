import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/twofish'

describe('Twofish', () => {
    it('exports test vectors', () => {
        expect(TEST_VECTORS.length).toBeGreaterThan(0)
    })

    it('passes official zero-key vector', () => {
        const result = encrypt(
            '00000000000000000000000000000000',
            '00000000000000000000000000000000'
        )

        expect(result.output).toBe(
            '9f589f5cf6122c32b6bfec2f2ae8c35a'
        )
    })

    it('decrypts official vector', () => {
        const result = decrypt(
            '9f589f5cf6122c32b6bfec2f2ae8c35a',
            '00000000000000000000000000000000'
        )

        expect(result.output).toBe(
            '00000000000000000000000000000000'
        )
    })

    it('round trips 128-bit key', () => {
        const key =
            '00112233445566778899aabbccddeeff'

        const plaintext =
            '00112233445566778899aabbccddeeff'

        const enc = encrypt(plaintext, key)
        const dec = decrypt(enc.output, key)

        expect(dec.output).toBe(plaintext)
    })

    it('round trips 192-bit key', () => {
        const key =
            '000102030405060708090a0b0c0d0e0f1011121314151617'

        const plaintext =
            '00112233445566778899aabbccddeeff'

        const enc = encrypt(plaintext, key)
        const dec = decrypt(enc.output, key)

        expect(dec.output).toBe(plaintext)
    })

    it('round trips 256-bit key', () => {
        const key =
            '000102030405060708090a0b0c0d0e0f' +
            '101112131415161718191a1b1c1d1e1f'

        const plaintext =
            '00112233445566778899aabbccddeeff'

        const enc = encrypt(plaintext, key)
        const dec = decrypt(enc.output, key)

        expect(dec.output).toBe(plaintext)
    })

    it('round trips multiple blocks', () => {
        const key =
            '00112233445566778899aabbccddeeff'

        const plaintext =
            '0011223344556677' +
            '8899aabbccddeeff' +
            '0011223344556677' +
            '8899aabbccddeeff'

        const enc = encrypt(plaintext, key)
        const dec = decrypt(enc.output, key)

        expect(dec.output).toBe(plaintext)
    })

    it('supports instrumentation', () => {
        const result = encrypt(
            '00000000000000000000000000000000',
            '00000000000000000000000000000000',
            {
                instrument: true,
            }
        )

        expect(result.steps.length).toBeGreaterThan(0)
        expect(result.steps[0].label).toContain('Key')
    })

    it('rejects invalid key length', () => {
        expect(() =>
            encrypt(
                '00000000000000000000000000000000',
                '00112233'
            )
        ).toThrow()
    })

    it('rejects non-multiple block input', () => {
        expect(() =>
            encrypt(
                '00112233',
                '00000000000000000000000000000000'
            )
        ).toThrow()
    })

    it('rejects empty input', () => {
        expect(() =>
            encrypt(
                '',
                '00000000000000000000000000000000'
            )
        ).toThrow()
    })

    it('metadata is populated', () => {
        const result = encrypt(
            '00000000000000000000000000000000',
            '00000000000000000000000000000000'
        )

        expect(result.metadata.name).toBe('Twofish')
        expect(result.metadata.blockSize).toBe(128)
        expect(result.metadata.rounds).toBe(16)
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
