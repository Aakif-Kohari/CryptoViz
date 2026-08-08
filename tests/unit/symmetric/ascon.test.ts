import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/symmetric/ascon'

describe('ASCON-128', () => {
    const key = '000102030405060708090a0b0c0d0e0f'
    const nonce = '000102030405060708090a0b0c0d0e0f'

    it('encrypts and decrypts a message (round trip)', () => {
        const plaintext = '48656c6c6f20576f726c64' // "Hello World"

        const encrypted = encrypt(plaintext, key, { nonce })

        expect(encrypted.output.length).toBe(
            nonce.length + plaintext.length + 32 // nonce + ciphertext + tag
        )

        const decrypted = decrypt(encrypted.output, key)

        expect(decrypted.output).toBe(plaintext)
    })

    it('supports empty plaintext', () => {
        const encrypted = encrypt('', key, { nonce })

        // nonce (16B = 32 hex) + tag (16B = 32 hex)
        expect(encrypted.output.length).toBe(64)

        const decrypted = decrypt(encrypted.output, key)
        expect(decrypted.output).toBe('')
    })

    it('rejects modified authentication tag', () => {
        const plaintext = '48656c6c6f'

        const encrypted = encrypt(plaintext, key, { nonce })

        const tampered =
            encrypted.output.slice(0, -2) +
            (encrypted.output.slice(-2) === '00' ? '01' : '00')

        expect(() => decrypt(tampered, key)).toThrow()
    })

    it('rejects modified ciphertext', () => {
        const plaintext = '48656c6c6f'

        const encrypted = encrypt(plaintext, key, { nonce })

        const chars = encrypted.output.split('')

        // Flip one nibble inside ciphertext (after nonce, before tag)
        const pos = 34

        chars[pos] = chars[pos] === '0' ? '1' : '0'

        expect(() => decrypt(chars.join(''), key)).toThrow()
    })

    it('rejects invalid key length', () => {
        expect(() =>
            encrypt('00', '00112233', { nonce })
        ).toThrow()
    })

    it('records instrumentation steps', () => {
        const result = encrypt('48656c6c6f', key, {
            nonce,
            instrument: true,
        })

        expect(result.steps).toHaveLength(4)

        expect(result.steps[0].label).toContain('Initialization')
        expect(result.steps[1].label).toContain('AD')
        expect(result.steps[2].label).toContain('Encryption')
        expect(result.steps[3].label).toContain('Finalization')
    })

    it('exports test vectors', () => {
        expect(TEST_VECTORS.length).toBeGreaterThan(0)
    })

    it('uses supplied nonce verbatim', () => {
        const plaintext = '00'

        const encrypted = encrypt(plaintext, key, { nonce })

        expect(encrypted.output.startsWith(nonce)).toBe(true)
    })
})
