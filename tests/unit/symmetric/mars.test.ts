import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/mars'

describe('MARS', () => {
    it('exports test vectors', () => {
        expect(TEST_VECTORS.length).toBeGreaterThan(0)
    })

    it('passes official zero-key vector', () => {
        const result = encrypt(
            '00000000000000000000000000000000',
            '00000000000000000000000000000000'
        )
        expect(result.output).toBe('78878a4ff8f5c1cca8e13f8bf47870ba')
    })

    it('decrypt is exact inverse of encrypt', () => {
        const key = '1234567890abcdef1234567890abcdef'
        const pt = '00112233445566778899aabbccddeeff'
        const ct = encrypt(pt, key)
        const decrypted = decrypt(ct.output, key)
        expect(decrypted.output).toBe(pt)
    })

    it('supports instrumentation', () => {
        const result = encrypt(
            '00000000000000000000000000000000',
            '00000000000000000000000000000000',
            { instrument: true }
        )
        expect(result.steps.length).toBeGreaterThan(0)
        expect(result.steps[0].label).toContain('Key')
    })

    it('rejects invalid key length', () => {
        expect(() =>
            encrypt('00000000000000000000000000000000', '00112233')
        ).toThrow()
    })

    it('rejects non-multiple block input', () => {
        expect(() =>
            encrypt('00112233', '00000000000000000000000000000000')
        ).toThrow()
    })

    it('rejects empty input', () => {
        expect(() =>
            encrypt('', '00000000000000000000000000000000')
        ).toThrow()
    })

    it('metadata is populated', () => {
        const result = encrypt(
            '00000000000000000000000000000000',
            '00000000000000000000000000000000'
        )
        expect(result.metadata.name).toBe('MARS')
        expect(result.metadata.blockSize).toBe(128)
        expect(result.metadata.rounds).toBe(32)
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
