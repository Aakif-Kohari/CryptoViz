import { describe, expect, it } from 'vitest'
import { encrypt } from '@/lib/cipher/hash/luffa'

describe('Luffa', () => {
    it('produces 256-bit output by default (3 chains)', () => {
        expect(encrypt('', '').output).toHaveLength(64)
    })

    it('supports 512-bit output (5 chains)', () => {
        expect(encrypt('', '', { outputBits: 512 }).output).toHaveLength(128)
    })
})
