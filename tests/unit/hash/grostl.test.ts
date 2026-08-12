import { describe, expect, it } from 'vitest'
import { encrypt, TEST_VECTORS } from '@/lib/cipher/hash/grostl'

describe('Grøstl-256', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('matches official empty string vector', () => {
        const result = encrypt('','')
        expect(result.output).toBe('1a52d11d550039be16107f9c58db9ebcc417f16f736adb1d63343b1e746357d0')
    })

    it('metadata is populated', () => {
        const result = encrypt('','')
        expect(result.metadata.name).toBe('Grøstl-256')
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
