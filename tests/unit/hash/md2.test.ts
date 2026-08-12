import { describe, expect, it } from 'vitest'
import { encrypt, TEST_VECTORS } from '@/lib/cipher/hash/md2'

describe('MD2', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('matches official RFC 1319 empty string vector', () => {
        const result = encrypt('', '')
        expect(result.output).toBe('8350e5a3e24c153df2275c9f80692773')
    })

    it('matches official RFC 1319 "a" vector', () => {
        const result = encrypt('61', '') // "a" in hex
        expect(result.output).toBe('32ec01ec4a6dac72c0ab96fb34c0b5d1')
    })

    it('matches official RFC 1319 "abc" vector', () => {
        const result = encrypt('616263', '') // "abc" in hex
        expect(result.output).toBe('da853b0d3f88d99b30283a69e6ded6bb')
    })

    it('metadata flags broken status', () => {
        const result = encrypt('', '')
        expect(result.metadata.securityStatus).toBe('broken')
    })
})
