import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, processBlock, expandKey } from '../../../lib/cipher/symmetric/aes'
import { CipherError } from '../../../lib/utils/errors'
import { toByteArray, fromByteArray } from '../../../lib/utils/encoding'
import fc from 'fast-check'

describe('AES Unit Tests', () => {
  describe('AES Core Block cipher', () => {
    it('passes FIPS 197 standard block vector (AES-128)', () => {
      const keyBytes = toByteArray('000102030405060708090a0b0c0d0e0f', 'hex')
      const plainBytes = toByteArray('00112233445566778899aabbccddeeff', 'hex')

      const roundKeys = expandKey(keyBytes)
      const cipherBlock = processBlock(plainBytes, roundKeys, false)

      expect(fromByteArray(cipherBlock, 'hex').toLowerCase()).toBe('69c4e0d86a7b0430d8cdb78070b4c55a')

      const decryptedBlock = processBlock(cipherBlock, roundKeys, true)
      expect(fromByteArray(decryptedBlock, 'hex').toLowerCase()).toBe('00112233445566778899aabbccddeeff')
    })
  })

  describe('AES API and Padding', () => {
    it('encrypts and decrypts with PKCS7 padding', () => {
      const input = 'AES 128 padding text'
      const key = '1234567890123456' // 16 bytes

      const enc = encrypt(input, key)
      const dec = decrypt(enc.output, key)
      expect(dec.output).toBe(input)
    })

    it('generates correct step count in instrumented mode (AES-128)', () => {
      const input = 'HELLO' // 5 bytes -> padded to 16 bytes (1 block)
      const key = '000102030405060708090a0b0c0d0e0f' // 16 bytes
      const result = encrypt(input, key, { instrument: true, mode: 'ECB' })
      // AES-128 instrumented steps = 44
      expect(result.steps.length).toBe(44)
    })

    it('generates correct step count in instrumented mode (AES-256)', () => {
      const input = 'HELLO'
      const key = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f' // 32 bytes (AES-256)
      const result = encrypt(input, key, { instrument: true, mode: 'ECB' })
      // AES-256 instrumented steps = 60
      expect(result.steps.length).toBe(60)
    })

    it('throws errors for invalid key sizes', () => {
      expect(() => encrypt('test', '12345678')).toThrowError(CipherError)
      expect(() => encrypt('test', '12345678')).toThrow(/must be exactly 16, 24, or 32 bytes/)
    })

    it('produces different ciphertext blocks for identical plaintext blocks under CBC', () => {
      const plaintext = 'AAAAAAAAAAAAAAAA' + 'BBBBBBBBBBBBBBBB' + 'AAAAAAAAAAAAAAAA'
      const key = '0123456789abcdef0123456789abcdef'
      const result = encrypt(plaintext, key, { mode: 'CBC' })
      const ciphertext = result.output.slice(32)
      const block1 = ciphertext.slice(0, 32)
      const block3 = ciphertext.slice(64, 96)
      expect(block1).not.toBe(block3)
    })

    it('round-trips encrypt/decrypt correctly under CBC', () => {
      const plaintext = 'Hello, CryptoViz!'
      const key = '0123456789abcdef0123456789abcdef'
      const encrypted = encrypt(plaintext, key, { mode: 'CBC' })
      const decrypted = decrypt(encrypted.output, key, { mode: 'CBC' })
      expect(decrypted.output).toBe(plaintext)
    })

    it('includes CBC chaining steps in instrumented encrypt mode', () => {
      const input = 'HELLO'
      const key = '000102030405060708090a0b0c0d0e0f'
      const iv = '00000000000000000000000000000000'
      const result = encrypt(input, key, { instrument: true, mode: 'CBC', iv })

      expect(result.steps.some(s => s.label === 'CBC Initialization Vector (IV)')).toBe(true)
      expect(result.steps.some(s => s.label.includes('CBC Mode XOR'))).toBe(true)
      expect(result.steps.length).toBe(45)
    })

    it('includes CBC chaining steps in instrumented decrypt mode', () => {
      const plaintext = 'HELLO'
      const key = '000102030405060708090a0b0c0d0e0f'
      const iv = '00000000000000000000000000000000'
      const encrypted = encrypt(plaintext, key, { mode: 'CBC', iv })
      const decrypted = decrypt(encrypted.output, key, { instrument: true, mode: 'CBC' })

      expect(decrypted.steps.some(s => s.label === 'CBC Initialization Vector (IV)')).toBe(true)
      expect(decrypted.steps.some(s => s.label.includes('CBC Mode XOR'))).toBe(true)
      expect(decrypted.output).toBe(plaintext)
    })

    it('round-trips multi-block instrumented CBC', () => {
      const plaintext = 'A'.repeat(17)
      const key = '000102030405060708090a0b0c0d0e0f'
      const iv = '00000000000000000000000000000000'

      const encrypted = encrypt(plaintext, key, { instrument: true, mode: 'CBC', iv })
      const decrypted = decrypt(encrypted.output, key, { instrument: true, mode: 'CBC' })

      expect(encrypted.steps.filter(s => s.label.includes('CBC Mode XOR'))).toHaveLength(2)
      expect(decrypted.steps.filter(s => s.label.includes('CBC Mode XOR'))).toHaveLength(2)
      expect(decrypted.output).toBe(plaintext)
    })
  })

  describe('AES Property-based Fuzzing', () => {
    it('AES: encrypt then decrypt returns original input', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 16, maxLength: 16 }).map(s => {
            let res = ''
            for (let i = 0; i < 16; i++) {
              res += String.fromCharCode(32 + (s.charCodeAt(i) % 95))
            }
            return res
          }),
          (input: string, keyStr: string) => {
            const enc = encrypt(input, keyStr)
            const dec = decrypt(enc.output, keyStr)
            expect(dec.output).toBe(input)
          }
        ),
        { numRuns: 500 }
      )
    })
  })

  describe('AES Streaming Modes — NIST SP 800-38A Known-Answer Vectors', () => {
    // NIST SP 800-38A, Appendix F. AES-128 key and the four canonical PT blocks.
    const KEY = '2b7e151628aed2a6abf7158809cf4f3c'
    const PT =
      '6bc1bee22e409f96e93d7e117393172a' +
      'ae2d8a571e03ac9c9eb76fac45af8e51' +
      '30c81c46a35ce411e5fbc1191a0a52ef' +
      'f69f2445df4f9b17ad2b417be66c3710'

    // Run encrypt() for a stream mode and strip the 32-char (16-byte) IV prefix
    // that encrypt() prepends, leaving just the raw ciphertext to compare.
    const rawCiphertext = (mode: string, iv: string): string =>
      encrypt(PT, KEY, { mode, iv, encoding: 'hex' }).output.slice(32).toLowerCase()

    it('CTR (F.5.1) produces the NIST ciphertext', () => {
      const iv = 'f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff' // initial counter block
      const expected =
        '874d6191b620e3261bef6864990db6ce' +
        '9806f66b7970fdff8617187bb9fffdff' +
        '5ae4df3edbd5d35e5b4f09020db03eab' +
        '1e031dda2fbe03d1792170a0f3009cee'
      expect(rawCiphertext('CTR', iv)).toBe(expected)
    })

    it('CFB128 (F.3.13) produces the NIST ciphertext', () => {
      const iv = '000102030405060708090a0b0c0d0e0f'
      const expected =
        '3b3fd92eb72dad20333449f8e83cfb4a' +
        'c8a64537a0b3a93fcde3cdad9f1ce58b' +
        '26751f67a3cbb140b1808cf187a4f4df' +
        'c04b05357c5d1c0eeac4c66f9ff7f2e6'
      expect(rawCiphertext('CFB', iv)).toBe(expected)
    })

    it('OFB (F.4.1) produces the NIST ciphertext', () => {
      const iv = '000102030405060708090a0b0c0d0e0f'
      const expected =
        '3b3fd92eb72dad20333449f8e83cfb4a' +
        '7789508d16918f03f53c52dac54ed825' +
        '9740051e9c5fecf64344f7a82260edcc' +
        '304c6528f659c77866a510d9c1d6ae5e'
      expect(rawCiphertext('OFB', iv)).toBe(expected)
    })

    it('CFB and OFB share their first keystream block (both = E(IV))', () => {
      const iv = '000102030405060708090a0b0c0d0e0f'
      expect(rawCiphertext('CFB', iv).slice(0, 32)).toBe(rawCiphertext('OFB', iv).slice(0, 32))
    })

    it.each(['CTR', 'CFB', 'OFB'])('%s round-trips encrypt/decrypt (hex)', (mode) => {
      const iv = '000102030405060708090a0b0c0d0e0f'
      const enc = encrypt(PT, KEY, { mode, iv, encoding: 'hex' })
      const dec = decrypt(enc.output, KEY, { mode, encoding: 'hex' })
      expect(dec.output.toLowerCase()).toBe(PT)
    })

    it.each(['CTR', 'CFB', 'OFB'])('%s does not pad (ciphertext length == plaintext length)', (mode) => {
      const iv = '000102030405060708090a0b0c0d0e0f'
      // 5-byte, non-block-aligned plaintext must produce 5 bytes of ciphertext.
      const enc = encrypt('Hello', KEY, { mode, iv })
      const cipherHex = enc.output.slice(32) // drop IV prefix
      expect(cipherHex.length).toBe(10) // 5 bytes -> 10 hex chars, no padding block
    })

    it.each(['CTR', 'CFB', 'OFB'])('%s round-trips a non-block-aligned UTF-8 string', (mode) => {
      const iv = '000102030405060708090a0b0c0d0e0f'
      const plaintext = 'The quick brown fox jumps over 17!' // 34 bytes (not a multiple of 16)
      const enc = encrypt(plaintext, KEY, { mode, iv })
      const dec = decrypt(enc.output, KEY, { mode })
      expect(dec.output).toBe(plaintext)
    })

    it.each(['CTR', 'CFB', 'OFB'])('%s emits instrumented keystream/XOR steps and round-trips', (mode) => {
      const iv = '000102030405060708090a0b0c0d0e0f'
      const enc = encrypt(PT, KEY, { mode, iv, encoding: 'hex', instrument: true })
      expect(enc.steps.some((s) => s.label.includes(`${mode} Keystream`))).toBe(true)
      expect(enc.steps.some((s) => s.label.includes(`${mode} XOR`))).toBe(true)

      const dec = decrypt(enc.output, KEY, { mode, encoding: 'hex', instrument: true })
      expect(dec.output.toLowerCase()).toBe(PT)
      expect(dec.steps.some((s) => s.label.includes(`${mode} Keystream`))).toBe(true)
    })
  })

  describe('AES Instrumented CBC Mode', () => {
    it('round-trips encrypt/decrypt correctly in instrumented CBC mode', () => {
      const plaintext = 'Hello, CryptoViz!'
      const key = '0123456789abcdef0123456789abcdef' // 16 bytes (32 hex characters)
      const iv = '000102030405060708090a0b0c0d0e0f' // 16 bytes (32 hex characters)

      const encrypted = encrypt(plaintext, key, { instrument: true, mode: 'CBC', iv })
      // Verify that encryption works and has steps
      expect(encrypted.steps.length).toBe(47) // 2 blocks: full block 1 trace + IV + block 2 CBC XOR
      expect(encrypted.steps.some(s => s.label === 'CBC Initialization Vector (IV)')).toBe(true)
      expect(encrypted.steps.some(s => s.label === 'Block 1 — CBC Mode XOR')).toBe(true)

      const decrypted = decrypt(encrypted.output, key, { instrument: true, mode: 'CBC' })
      expect(decrypted.output).toBe(plaintext)
      expect(decrypted.steps.length).toBe(47)
      expect(decrypted.steps.some(s => s.label === 'CBC Initialization Vector (IV)')).toBe(true)
      expect(decrypted.steps.some(s => s.label === 'Block 1 — CBC Mode XOR')).toBe(true)
    })
  })
})
