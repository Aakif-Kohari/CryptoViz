import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/kuznyechik'

describe('Kuznyechik', () => {
    it('exports test vectors', () => {
        expect(TEST_VECTORS.length).toBeGreaterThan(0)
    })

    it('passes official RFC 7801 vector', () => {
        const result = encrypt(
            '1122334455667700ffeeddccbbaa9988',
            '8899aabbccddeeff0011223344556677fedcba98765432100123456789abcdef'
        )
        expect(result.output).toBe('7f679d90bebc24305a468d42b9d4edcd')
    })

    it('decrypt is exact inverse of encrypt', () => {
        const key = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff'
        const pt = '00000000000000000000000000000000'
        const ct = encrypt(pt, key)
        const decrypted = decrypt(ct.output, key)
        expect(decrypted.output).toBe(pt)
    })

    it('supports instrumentation', () => {
        const result = encrypt(
            '00000000000000000000000000000000',
            '0000000000000000000000000000000000000000000000000000000000000000',
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

    it('metadata is populated', () => {
        const result = encrypt(
            '00000000000000000000000000000000',
            '0000000000000000000000000000000000000000000000000000000000000000'
        )
        expect(result.metadata.name).toBe('Kuznyechik')
        expect(result.metadata.blockSize).toBe(128)
        expect(result.metadata.rounds).toBe(9)
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
