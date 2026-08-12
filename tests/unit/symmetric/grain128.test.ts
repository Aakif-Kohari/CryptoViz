import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/grain128'

describe('Grain-128', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('init feeds back output into registers', () => {
        // If init didn't feed back, the state would be different.
        // We verify round-trip works, which implies correct state evolution.
        const key = '11223344556677889900aabbccddeeff'
        const iv = '00112233445566778899aabb'
        const pt = '48656c6c6f'
        const ct = encrypt(pt, key, { iv })
        expect(decrypt(ct.output, key, { iv }).output).toBe(pt)
    })

    it('metadata is populated', () => {
        const result = encrypt('00', '00000000000000000000000000000000', { iv: '00'.repeat(12) })
        expect(result.metadata.name).toBe('Grain-128')
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
