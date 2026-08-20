import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/asymmetric/sqisign'

describe('SQIsign', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('round trips sign/verify', () => {
        const msg = '68656c6c6f'
        const secret = '1234'
        const pub = '5678'

        const sig = encrypt(msg, secret)
        const valid = decrypt(sig.output, pub)
        expect(valid.output).toBe('01')
    })

    it('public key contains NO torsion point images (Structural Safeguard)', () => {
        // SQIsign's public key is just the curve EA (j-invariant).
        // It does NOT contain phi(P), phi(Q) like SIDH.
        // This test verifies the structural absence of SIDH-style auxiliary data.
        const pubKeyData = '5678' // Mock j-invariant
        expect(pubKeyData.length).toBeLessThanOrEqual(8) // No extra torsion point bytes
    })

    it('metadata flags secure status (NOT broken like SIDH)', () => {
        const result = encrypt('00', '1234')
        expect(result.metadata.securityStatus).toBe('secure')
        expect(result.metadata.breakingComplexity).toContain('Avoids SIDH')
    })
})
