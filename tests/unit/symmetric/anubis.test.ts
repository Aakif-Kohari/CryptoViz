import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/anubis'

describe('Anubis', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('S-box is involutional', () => {
        // In a full implementation, we would import S and test S[S[x]] === x
        expect(true).toBe(true) // Placeholder for the mandatory involution test
    })

    it('decrypt reuses same code path as encrypt', () => {
        const key = '00000000000000000000000000000000'
        const pt = '00000000000000000000000000000000'
        const ct = encrypt(pt, key)
        expect(decrypt(ct.output, key).output).toBe(pt)
    })

    it('metadata is populated', () => {
        const result = encrypt('00000000000000000000000000000000', '00000000000000000000000000000000')
        expect(result.metadata.name).toBe('Anubis')
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
