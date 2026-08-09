import { describe, expect, it } from 'vitest'
import { encrypt, TEST_VECTORS } from '@/lib/cipher/hash/argon2'

describe('Argon2id', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('supports configurable memory cost', () => {
        const result = encrypt('password', 'salt', { memoryCost: 19456, timeCost: 2, parallelism: 1 })
        expect(result.output).toHaveLength(64) // 32 bytes = 64 hex chars
    })

    it('metadata is populated', () => {
        const result = encrypt('password', 'salt')
        expect(result.metadata.name).toBe('Argon2id')
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
