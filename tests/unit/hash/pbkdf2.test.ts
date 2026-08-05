import { describe, expect, it } from 'vitest'
import { encrypt, TEST_VECTORS } from '@/lib/cipher/hash/pbkdf2'

describe('PBKDF2', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('supports configurable iteration count', () => {
        const result = encrypt('password', 'salt', { iterations: 1, keyLength: 32 })
        expect(result.output).toHaveLength(64)
    })

    it('metadata is populated', () => {
        const result = encrypt('password', 'salt')
        expect(result.metadata.name).toBe('PBKDF2')
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
