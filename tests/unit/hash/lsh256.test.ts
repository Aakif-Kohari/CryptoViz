import { describe, expect, it } from 'vitest'
import { encrypt, TEST_VECTORS } from '@/lib/cipher/hash/lsh256'

describe('LSH-256', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('produces 256-bit output', () => {
        const result = encrypt('', '')
        expect(result.output).toHaveLength(64) // 32 bytes = 64 hex chars
    })

    it('metadata is populated', () => {
        const result = encrypt('', '')
        expect(result.metadata.name).toBe('LSH-256')
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
