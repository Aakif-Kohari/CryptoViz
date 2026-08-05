import { describe, expect, it } from 'vitest'
import { encrypt, TEST_VECTORS } from '@/lib/cipher/hash/streebog'

describe('Streebog-256', () => {
    it('exports test vectors', () => {
        expect(TEST_VECTORS.length).toBeGreaterThan(0)
    })

    it('passes official RFC 6986 M1 vector', () => {
        const result = encrypt(
            '323130393837363534333231303938373635343332313039383736353433323130393837363534333231303938373635343332313039383736353433323130',
            ''
        )
        expect(result.output).toBe('00557be5e584fd52a449b16b0251d05d27f94ab76cbaa6da890b59d8ef1e159d')
    })

    it('supports instrumentation', () => {
        const result = encrypt('00', '', { instrument: true })
        expect(result.steps.length).toBeGreaterThan(0)
    })

    it('rejects invalid hex', () => {
        expect(() => encrypt('xyz', '')).toThrow()
    })

    it('metadata is populated', () => {
        const result = encrypt('00', '')
        expect(result.metadata.name).toBe('Streebog-256')
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
