import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/symmetric/rc2'

describe('RC2', () => {
    it('exports test vectors', () => {
        expect(TEST_VECTORS.length).toBeGreaterThan(0)
    })

    it('passes RFC 2268 vector #1 (63 effective bits)', () => {
        const result = encrypt(
            '0000000000000000',
            '0000000000000000',
            { effectiveBits: 63 }
        )

        expect(result.output).toBe('ebb773f993278eff')
    })

    it('passes RFC 2268 vector #2 (64 effective bits)', () => {
        const result = encrypt(
            'ffffffffffffffff',
            'ffffffffffffffff',
            { effectiveBits: 64 }
        )

        expect(result.output).toBe('278b27e42e2f0d49')
    })

    it('decrypts RFC vector #1', () => {
        const result = decrypt(
            'ebb773f993278eff',
            '0000000000000000',
            { effectiveBits: 63 }
        )

        expect(result.output).toBe('0000000000000000')
    })

    it('round trips 128-bit effective key', () => {
        const plaintext = '0011223344556677'
        const key = '00112233445566778899aabbccddeeff'

        const enc = encrypt(plaintext, key)
        const dec = decrypt(enc.output, key)

        expect(dec.output).toBe(plaintext)
    })

    it('round trips multiple blocks', () => {
        const plaintext =
            '00112233445566778899aabbccddeeff'
        const key =
            '00112233445566778899aabbccddeeff'

        const enc = encrypt(plaintext, key)
        const dec = decrypt(enc.output, key)

        expect(dec.output).toBe(plaintext)
    })

    it('supports instrumentation', () => {
        const result = encrypt(
            '0000000000000000',
            '0000000000000000',
            {
                instrument: true,
                effectiveBits: 63,
            }
        )

        expect(result.steps.length).toBeGreaterThan(0)
        expect(result.steps[0].label).toContain('Key')
    })

    it('rejects empty input', () => {
        expect(() => encrypt('', '0000000000000000'))
            .toThrow()
    })

    it('rejects non-multiple of block size', () => {
        expect(() =>
            encrypt(
                '001122',
                '0000000000000000'
            )
        ).toThrow()
    })

    it('rejects key longer than 128 bytes', () => {
        const key = 'aa'.repeat(129)

        expect(() =>
            encrypt(
                '0000000000000000',
                key
            )
        ).toThrow()
    })

    it('rejects invalid effectiveBits', () => {
        expect(() =>
            encrypt(
                '0000000000000000',
                '0000000000000000',
                {
                    effectiveBits: 0,
                }
            )
        ).toThrow()

        expect(() =>
            encrypt(
                '0000000000000000',
                '0000000000000000',
                {
                    effectiveBits: 1025,
                }
            )
        ).toThrow()
    })

    it('metadata is populated', () => {
        const result = encrypt(
            '0000000000000000',
            '0000000000000000'
        )

        expect(result.metadata.name).toBe('RC2')
        expect(result.metadata.blockSize).toBe(64)
        expect(result.metadata.rounds).toBe(18)
        expect(result.metadata.securityStatus).toBe('broken')
    })
})
