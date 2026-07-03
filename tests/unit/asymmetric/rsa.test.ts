import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/asymmetric/rsa'



describe('RSA Asymmetric Cipher Unit Tests', () => {
  it('passes standard test vectors (encrypt)', () => {
    // Vector 1: M=65, key=3233,17 -> C=2790
    const vector = TEST_VECTORS[0]
    const result = encrypt(vector.input, vector.key)
    expect(result.output).toBe(vector.expected)
  })

  it('passes standard test vectors (decrypt)', () => {
    // Vector 2: C=2790, key=3233,2753 -> M=65
    const vector = TEST_VECTORS[1]
    const result = decrypt(vector.input, vector.key)
    expect(result.output).toBe(vector.expected)
  })

  it('handles instrumented mode correctly for encryption and decryption', () => {
    const encResult = encrypt('65', '3233,17', { instrument: true })
    expect(encResult.steps.length).toBeGreaterThan(0)
    expect(encResult.steps[0].label).toBe('Key Setup / Parameters')
    expect(encResult.output).toBe('2790')

    const decResult = decrypt('2790', '3233,2753', { instrument: true })
    expect(decResult.steps.length).toBeGreaterThan(0)
    expect(decResult.steps[0].label).toBe('Key Setup / Parameters')
    expect(decResult.output).toBe('65')
  })

  it('throws on input value larger than or equal to modulus', () => {
    expect(() => encrypt('3234', '3233,17')).toThrow(/strictly less than the modulus/)
    expect(() => decrypt('3234', '3233,2753')).toThrow(/is >= modulus n/)
  })

  it('supports real mode RSA-OAEP simulation', () => {
    const msg = 'Hello World'
    const enc = encrypt(msg, '', { mode: 'real', instrument: true })
    expect(enc.output).toContain('3082010a0282010100')
    expect(enc.metadata.keySize).toBe(2048)

    const dec = decrypt(enc.output, '3233,2753', { mode: 'real', instrument: true })
    expect(dec.output).toBe(msg)
    expect(dec.metadata.keySize).toBe(2048)
  })

  it('throws on missing parameters or invalid key formats', () => {
    expect(() => encrypt('65', 'abc')).toThrow(/Invalid RSA key format/)
    expect(() => decrypt('2790', '3233')).toThrow(/Invalid RSA key format/)
  })
  it('derives n, d from p,q,e for encrypt/decrypt (3-value key format)', () => {
    const encResult = encrypt('65', '61,53,17')
    expect(encResult.output).toBe('2790')
    const decResult = decrypt('2790', '61,53,17')
    expect(decResult.output).toBe('65')
  })
  it('throws a helpful error when n is suspiciously small (likely p,q entered as n,e)', () => {
    expect(() => encrypt('72', '61,53')).toThrow(/did you mean to enter two primes/)
  })

 
})
