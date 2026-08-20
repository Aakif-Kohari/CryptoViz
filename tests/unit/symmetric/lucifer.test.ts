import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/lucifer'

describe('Lucifer', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('key-controlled S-box selection varies output', () => {
        // Changing a key byte's LSB should change the S-box used, altering the ciphertext
        const pt = '00000000000000000000000000000000'
        const key1 = '00000000000000000000000000000000' // LSBs are 0 -> S0
        const key2 = '01000000000000000000000000000000' // First byte LSB is 1 -> S1

        const ct1 = encrypt(pt, key1).output
        const ct2 = encrypt(pt, key2).output
        expect(ct1).not.toBe(ct2)
    })

    it('decrypt is exact inverse of encrypt', () => {
        const key = '11223344556677889900aabbccddeeff'
        const pt = '00112233445566778899aabbccddeeff'
        const ct = encrypt(pt, key)
        expect(decrypt(ct.output, key).output).toBe(pt)
    })

    it('metadata flags broken status', () => {
        const result = encrypt('00000000000000000000000000000000', '00000000000000000000000000000000')
        expect(result.metadata.securityStatus).toBe('broken')
    })
})
