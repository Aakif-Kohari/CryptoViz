import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/asymmetric/mceliece'

describe('Classic McEliece', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('round trips with pedagogical parameters', () => {
        const pt = '01'
        const ct = encrypt(pt, 'pub,priv')
        const decrypted = decrypt(ct.output, 'pub,priv')
        expect(decrypted.output).toBe(pt)
    })

    it('metadata flags pedagogical parameters', () => {
        const result = encrypt('01', 'pub,priv')
        expect(result.metadata.breakingComplexity).toContain('Pedagogical params')
    })
})
