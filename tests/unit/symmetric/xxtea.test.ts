import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/xxtea'

describe('XXTEA', () => {
    it('exports test vectors', () => {
        expect(TEST_VECTORS.length).toBeGreaterThan(0)
    })

    it('round trips 2 words', () => {
        const key = '00000000000000000000000000000000'
        const pt = '0000000000000000'
        const ct = encrypt(pt, key)
        const decrypted = decrypt(ct.output, key)
        expect(decrypted.output).toBe(pt)
    })

    it('round trips 3 words', () => {
        const key = '1234567890abcdef1234567890abcdef'
        const pt = '00112233445566778899aabb'
        const ct = encrypt(pt, key)
        expect(decrypt(ct.output, key).output).toBe(pt)
    })

    it('round trips 5 words', () => {
        const key = '1234567890abcdef1234567890abcdef'
        const pt = '00112233445566778899aabbccddeeff00112233'
        const ct = encrypt(pt, key)
        expect(decrypt(ct.output, key).output).toBe(pt)
    })

    it('round trips 11 words', () => {
        const key = '1234567890abcdef1234567890abcdef'
        const pt = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff0011223344556677'
        const ct = encrypt(pt, key)
        expect(decrypt(ct.output, key).output).toBe(pt)
    })

    it('supports instrumentation', () => {
        const result = encrypt(
            '0000000000000000',
            '00000000000000000000000000000000',
            { instrument: true }
        )
        expect(result.steps.length).toBeGreaterThan(0)
        expect(result.steps[0].label).toContain('Variable Block Setup')
    })

    it('rejects invalid key length', () => {
        expect(() => encrypt('0000000000000000', '00112233')).toThrow()
    })

    it('rejects non-multiple of 4 bytes input', () => {
        expect(() => encrypt('001122', '00000000000000000000000000000000')).toThrow()
    })

    it('rejects less than 8 bytes input', () => {
        expect(() => encrypt('00112233', '00000000000000000000000000000000')).toThrow()
    })

    it('metadata is populated', () => {
        const result = encrypt('0000000000000000', '00000000000000000000000000000000')
        expect(result.metadata.name).toBe('XXTEA')
        expect(result.metadata.keySize).toBe(128)
        expect(result.metadata.securityStatus).toBe('legacy')
    })
})
