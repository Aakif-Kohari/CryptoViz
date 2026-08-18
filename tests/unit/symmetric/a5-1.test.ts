import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/a5-1'

describe('A5/1', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('round trips correctly', () => {
        const key = '1234567890abcdef'
        const frame = '112233'
        const pt = '48656c6c6f' // "Hello"
        const ct = encrypt(pt, key, { iv: frame })
        expect(decrypt(ct.output, key, { iv: frame }).output).toBe(pt)
    })

    it('metadata flags broken status', () => {
        const result = encrypt('00', '0000000000000000', { iv: '000000' })
        expect(result.metadata.securityStatus).toBe('broken')
    })
})
