import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, generateKeypair } from '@/lib/cipher/asymmetric/ml-dsa'

describe('ML-DSA-65', () => {
  it('signs and verifies a round trip', () => {
    const { publicKey, privateKey } = generateKeypair()
    const message = 'ECSoC26 ml-dsa test'
    const signature = encrypt(message, privateKey).output
    const verified = decrypt(message, `${publicKey}|${signature}`)
    expect(verified.output).toBe(message)
  })

  it('rejects a tampered message', () => {
    const { publicKey, privateKey } = generateKeypair()
    const message = 'original message'
    const signature = encrypt(message, privateKey).output
    expect(() => decrypt(message + '!', `${publicKey}|${signature}`)).toThrow(/VERIFICATION_FAILED/)
  })

  it('rejects a signature from the wrong keypair', () => {
    const { publicKey } = generateKeypair()
    const { privateKey: otherPriv } = generateKeypair()
    const message = 'test'
    const signature = encrypt(message, otherPriv).output
    expect(() => decrypt(message, `${publicKey}|${signature}`)).toThrow(/VERIFICATION_FAILED/)
  })

  it('generates a keypair when none is supplied', () => {
    const signed = encrypt('msg', '', { instrument: true })
    expect(signed.steps.some((s) => s.label === 'Key generation')).toBe(true)
  })
})
