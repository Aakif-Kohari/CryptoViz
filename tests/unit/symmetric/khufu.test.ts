import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/khufu'

describe('Khufu', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('round trips correctly', () => {
        const key = '11223344556677889900aabbccddeeff'.repeat(4) // 64 bytes
        const pt = '0011223344556677'
        const ct = encrypt(pt, key)
        expect(decrypt(ct.output, key).output).toBe(pt)
    })

    // CRITICAL TEST: Key-dependent S-box divergence
    it('generates different S-boxes for different keys', () => {
        const pt = '0000000000000000'
        const key1 = '00'.repeat(64)
        const key2 = '01' + '00'.repeat(63) // Single bit difference

        const ct1 = encrypt(pt, key1).output
        const ct2 = encrypt(pt, key2).output

        // Because the S-box is key-dependent, even a 1-bit key change
        // should result in a completely different ciphertext.
        expect(ct1).not.toBe(ct2)
    })

    it('metadata flags legacy status', () => {
        const result = encrypt('0000000000000000', '00'.repeat(64))
        expect(result.metadata.securityStatus).toBe('legacy')
    })
})