import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/feal'

describe('FEAL-8', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('passes canonical test vector', () => {
        const result = encrypt('0000000000000000', '0000000000000000')
        expect(result.output).toBe('ceef2c8662f6b3b3')
    })

    it('metadata flags broken status', () => {
        const result = encrypt('0000000000000000', '0000000000000000')
        expect(result.metadata.securityStatus).toBe('broken')
        expect(result.metadata.breakingComplexity).toContain('differential')
    })
})
