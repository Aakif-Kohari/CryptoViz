import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/asymmetric/sidh'

describe('SIDH', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('metadata flags broken status unconditionally', () => {
        const result = encrypt('01', 'pub,priv')
        expect(result.metadata.securityStatus).toBe('broken')
        expect(result.metadata.breakingComplexity).toContain('Castryck-Decru')
    })

    it('instrumentation explains the break mechanism', () => {
        const result = encrypt('01', 'pub,priv', { instrument: true })
        const breakNote = result.steps.find(s => s.note?.includes('Castryck-Decru'))
        expect(breakNote).toBeDefined()
        expect(breakNote?.note).toContain('torsion')
    })
})
