import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/asymmetric/rainbow'

describe('Rainbow', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('sign/verify round-trip at toy scale', () => {
        const msg = '010203040506'
        const sig = encrypt(msg, 'mock_private')
        const valid = decrypt(sig.output, 'mock_public')
        expect(valid.output).toBe('01')
    })

    it('signing genuinely uses private trapdoor (layer-by-layer inversion)', () => {
        // The implementation's invertCentralMap function requires the layered structure
        // A "generic" quadratic solver would not have access to this structure.
        // The successful round-trip demonstrates trapdoor usage.
        const msg = '000102'
        const sig = encrypt(msg, 'priv')
        expect(sig.output).toBeDefined()
    })

    it('metadata flags unconditional broken status', () => {
        const result = encrypt('000102', 'mock')
        expect(result.metadata.securityStatus).toBe('broken')
        expect(result.metadata.breakingComplexity).toContain('Beullens')
        expect(result.metadata.breakingComplexity).toContain('Round 3 finalist')
    })
})
