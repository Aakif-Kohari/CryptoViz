import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/symmetric/sm4'

describe('SM4', () => {
    const vector = TEST_VECTORS[0]

    it('encrypts the official GB/T 32907-2016 test vector', () => {
        const result = encrypt(vector.input, vector.key)

        expect(result.output).toBe(vector.expected)
        expect(result.outputEncoding).toBe('hex')
    })

    it('decrypts the official GB/T 32907-2016 test vector', () => {
        const result = decrypt(vector.expected, vector.key)

        expect(result.output).toBe(vector.input)
    })

    it('performs an encrypt/decrypt round trip', () => {
        const plaintext = '00112233445566778899aabbccddeeff'
        const key = '0123456789abcdeffedcba9876543210'

        const encrypted = encrypt(plaintext, key)
        const decrypted = decrypt(encrypted.output, key)

        expect(decrypted.output).toBe(plaintext)
    })

    it('throws on invalid key length', () => {
        expect(() =>
            encrypt(
                '00112233445566778899aabbccddeeff',
                '0011223344556677'
            )
        ).toThrow(/INVALID_KEY_LENGTH|128-bit/i)
    })

    it('throws when input is not a multiple of one block', () => {
        expect(() =>
            encrypt(
                '00112233',
                '0123456789abcdeffedcba9876543210'
            )
        ).toThrow(/INVALID_INPUT|16 bytes/i)
    })

    it('returns instrumentation steps when requested', () => {
        const result = encrypt(
            vector.input,
            vector.key,
            { instrument: true }
        )

        expect(result.steps.length).toBeGreaterThan(0)
        expect(result.steps[0].label).toContain('Key expansion')
        expect(result.metadata.name).toBe('SM4')
    })

    it('exports the official test vector', () => {
        expect(TEST_VECTORS).toHaveLength(1)

        expect(TEST_VECTORS[0]).toMatchObject({
            input: '0123456789abcdeffedcba9876543210',
            key: '0123456789abcdeffedcba9876543210',
            expected: '681edf34d206965e86b3e94f536e4246',
        })
    })
})
