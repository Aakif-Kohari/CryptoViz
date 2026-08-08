import { describe, expect, it } from 'vitest'
import { encrypt, TEST_VECTORS } from '@/lib/cipher/hash/tiger'

describe('Tiger', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('matches official empty string vector', () => {
        const result = encrypt('', '')
        expect(result.output).toBe('3293ac630c13f0245f92bbb1766e16167a4e58492dde73f3')
    })

    it('metadata is populated', () => {
        const result = encrypt('', '')
        expect(result.metadata.name).toBe('Tiger')
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
