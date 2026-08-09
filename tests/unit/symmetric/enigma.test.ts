import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/symmetric/enigma'

describe('Enigma', () => {
  it('matches the reference vector', () => {
    const v = TEST_VECTORS[0]
    expect(encrypt(v.input, v.key).output).toBe(v.expected)
  })

  it('is self-reciprocal: same settings both encrypt and decrypt', () => {
    const key = 'I,II,III|A,A,A|1,1,1|'
    const plaintext = 'THEQUICKBROWNFOX'
    const enc = encrypt(plaintext, key)
    const dec = decrypt(enc.output, key) // identical settings, not "inverse" settings
    expect(dec.output).toBe(plaintext)
  })

  it('never maps a letter to itself', () => {
    const key = 'I,II,III|A,A,A|1,1,1|'
    const plaintext = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const result = encrypt(plaintext, key).output
    for (let i = 0; i < plaintext.length; i++) {
      expect(result[i]).not.toBe(plaintext[i])
    }
  })

  it('supports plugboard swaps', () => {
    const keyNoPlug = 'I,II,III|A,A,A|1,1,1|'
    const keyWithPlug = 'I,II,III|A,A,A|1,1,1|AB,CD'
    const plaintext = 'HELLO'
    expect(encrypt(plaintext, keyWithPlug).output).not.toBe(encrypt(plaintext, keyNoPlug).output)
  })

  it('rejects empty/non-letter input', () => {
    expect(() => encrypt('12345', 'I,II,III|A,A,A|1,1,1|')).toThrow(/A-Z letter/)
  })
})
