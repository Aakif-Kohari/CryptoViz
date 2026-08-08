import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/kasumi'

describe('KASUMI', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('passes official 3GPP test vector', () => {
        const result = encrypt(
            'fedcba0987654321',
            '9900aabbccddeeff1122334455667788'
        )
        expect(result.output).toBe('514896226caa4f20')
    })

    it('decrypt is exact inverse of encrypt', () => {
        const key = '9900aabbccddeeff1122334455667788'
        const pt = 'fedcba0987654321'
        const ct = encrypt(pt, key)
        expect(decrypt(ct.output, key).output).toBe(pt)
    })

    it('metadata flags broken status', () => {
        const result = encrypt('fedcba0987654321', '9900aabbccddeeff1122334455667788')
        expect(result.metadata.securityStatus).toBe('broken')
        expect(result.metadata.breakingComplexity).toContain('related-key')
    })
})
