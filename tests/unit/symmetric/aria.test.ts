import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/aria'

describe('ARIA', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('passes official RFC 5794 128-bit vector', () => {
        const result = encrypt(
            '00112233445566778899aabbccddeeff',
            '000102030405060708090a0b0c0d0e0f'
        )
        expect(result.output).toBe('d718fbd6ab644c739da95f3be6451778')
    })

    it('decrypt is exact inverse of encrypt', () => {
        const key = '000102030405060708090a0b0c0d0e0f'
        const pt = '00112233445566778899aabbccddeeff'
        const ct = encrypt(pt, key)
        const decrypted = decrypt(ct.output, key)
        expect(decrypted.output).toBe(pt)
    })

    it('metadata is populated', () => {
        const result = encrypt('00112233445566778899aabbccddeeff', '000102030405060708090a0b0c0d0e0f')
        expect(result.metadata.name).toBe('ARIA')
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
