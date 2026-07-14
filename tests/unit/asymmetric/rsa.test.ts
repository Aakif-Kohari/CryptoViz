import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/asymmetric/rsa'

// Demo-mode encrypt/decrypt are synchronous, but real mode (WebCrypto RSA-OAEP)
// is async, so encrypt/decrypt now return CipherResult | Promise<CipherResult>.
// Awaiting works for both the sync and async paths.

describe('RSA Asymmetric Cipher Unit Tests', () => {
  it('passes standard test vectors (encrypt)', async () => {
    // Vector 1: M=65, key=3233,17 -> C=2790
    const vector = TEST_VECTORS[0]
    const result = await encrypt(vector.input, vector.key)
    expect(result.output).toBe(vector.expected)
  })

  it('passes standard test vectors (decrypt)', async () => {
    // Vector 2: C=2790, key=3233,2753 -> M=65
    const vector = TEST_VECTORS[1]
    const result = await decrypt(vector.input, vector.key)
    expect(result.output).toBe(vector.expected)
  })

  it('handles instrumented mode correctly for encryption and decryption', async () => {
    const encResult = await encrypt('65', '3233,17', { instrument: true })
    expect(encResult.steps.length).toBeGreaterThan(0)
    expect(encResult.steps[0].label).toBe('Key Setup / Parameters')
    expect(encResult.output).toBe('2790')

    const decResult = await decrypt('2790', '3233,2753', { instrument: true })
    expect(decResult.steps.length).toBeGreaterThan(0)
    expect(decResult.steps[0].label).toBe('Key Setup / Parameters')
    expect(decResult.output).toBe('65')
  })

  it('throws on input value larger than or equal to modulus', () => {
    expect(() => encrypt('3234', '3233,17')).toThrow(/strictly less than the modulus/)
    expect(() => decrypt('3234', '3233,2753')).toThrow(/is >= modulus n/)
  })

  it('real mode performs a genuine RSA-OAEP encrypt/decrypt round-trip (WebCrypto)', async () => {
    const msg = 'Hello World'
    const enc = await encrypt(msg, '', { mode: 'real', instrument: true })
    // A 2048-bit RSA ciphertext is 256 bytes -> 512 hex chars.
    expect(enc.output).toMatch(/^[0-9a-f]{512}$/)
    expect(enc.outputEncoding).toBe('hex')
    expect(enc.metadata.keySize).toBe(2048)
    expect(enc.steps[0].note).toMatch(/RSA-OAEP/)

    const dec = await decrypt(enc.output, '', { mode: 'real', instrument: true })
    expect(dec.output).toBe(msg)
    expect(dec.metadata.keySize).toBe(2048)
  })

  it('real mode uses randomised OAEP padding (ciphertexts differ, both decrypt)', async () => {
    const msg = 'same message'
    const a = await encrypt(msg, '', { mode: 'real' })
    const b = await encrypt(msg, '', { mode: 'real' })
    expect(a.output).not.toBe(b.output)
    expect((await decrypt(a.output, '', { mode: 'real' })).output).toBe(msg)
    expect((await decrypt(b.output, '', { mode: 'real' })).output).toBe(msg)
  })

  it('real mode rejects plaintext larger than the OAEP limit', async () => {
    const tooLong = 'x'.repeat(191)
    await expect(encrypt(tooLong, '', { mode: 'real' })).rejects.toThrow(/at most 190 bytes/)
  })

  it('real mode rejects a tampered / foreign ciphertext', async () => {
    await expect(decrypt('00'.repeat(256), '', { mode: 'real' })).rejects.toThrow(/decryption failed/i)
  })

  it('throws on missing parameters or invalid key formats', () => {
    expect(() => encrypt('65', 'abc')).toThrow(/Invalid RSA key format/)
    expect(() => decrypt('2790', '3233')).toThrow(/Invalid RSA key format/)
  })
  it('derives n, d from p,q,e for encrypt/decrypt (3-value key format)', async () => {
    const encResult = await encrypt('65', '61,53,17')
    expect(encResult.output).toBe('2790')
    const decResult = await decrypt('2790', '61,53,17')
    expect(decResult.output).toBe('65')
  })
  it('throws a helpful error when n is suspiciously small (likely p,q entered as n,e)', () => {
    expect(() => encrypt('72', '61,53')).toThrow(/did you mean to enter two primes/)
  })


})
