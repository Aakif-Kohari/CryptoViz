import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/rabbit'

describe('Rabbit', () => {
    it('exports test vectors', () => {
        expect(TEST_VECTORS.length).toBeGreaterThan(0)
    })

    it('passes official RFC 4503 no-IV vector', () => {
        const result = encrypt(
            '00000000000000000000000000000000',
            '00000000000000000000000000000000'
        )
        expect(result.output).toBe('b15754f036a5d6ecf56b45261c4af702')
    })

    it('decrypt is exact inverse of encrypt with IV', () => {
        const key = '912813292E3D36FE3BFC62F1DC51C3AC'
        const iv = 'C373F575C1267E59'
        const pt = '48656c6c6f20576f726c64'
        const ct = encrypt(pt, key, { iv })
        const decrypted = decrypt(ct.output, key, { iv })
        expect(decrypted.output).toBe(pt)
    })

    it('supports instrumentation', () => {
        const result = encrypt(
            '0000000000000000',
            '00000000000000000000000000000000',
            { instrument: true }
        )
        expect(result.steps.length).toBeGreaterThan(0)
    })

    it('rejects invalid key length', () => {
        expect(() =>
            encrypt('0000000000000000', '00112233')
        ).toThrow()
    })

    it('rejects invalid IV length', () => {
        expect(() =>
            encrypt('0000000000000000', '00000000000000000000000000000000', { iv: '1234' })
        ).toThrow()
    })

    it('metadata is populated', () => {
        const result = encrypt(
            '00000000',
            '00000000000000000000000000000000'
        )
        expect(result.metadata.name).toBe('Rabbit')
        expect(result.metadata.keySize).toBe(128)
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
