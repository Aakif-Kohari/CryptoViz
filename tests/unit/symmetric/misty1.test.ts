import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/misty1'

describe('MISTY1', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('round trips correctly', () => {
        const key = '00112233445566778899aabbccddeeff'
        const pt = '0123456789abcdef'
        const ct = encrypt(pt, key)
        expect(decrypt(ct.output, key).output).toBe(pt)
    })

    it('metadata is populated', () => {
        const result = encrypt('0123456789abcdef', '00112233445566778899aabbccddeeff')
        expect(result.metadata.name).toBe('MISTY1')
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
