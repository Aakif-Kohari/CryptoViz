import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/clefia'

describe('CLEFIA', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('passes official RFC 6114 128-bit vector', () => {
        const result = encrypt(
            '000102030405060708090a0b0c0d0e0f',
            'ffeeddccbbaa99887766554433221100'
        )
        expect(result.output).toBe('de2bf2fd9b74aacdf1298555459494fd')
    })

    it('metadata is populated', () => {
        const result = encrypt('000102030405060708090a0b0c0d0e0f', 'ffeeddccbbaa99887766554433221100')
        expect(result.metadata.name).toBe('CLEFIA')
        expect(result.metadata.securityStatus).toBe('secure')
    })
})