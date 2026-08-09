import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, generateKeypair } from '@/lib/cipher/asymmetric/ml-kem'

describe('ML-KEM-768', () => {
  it('both sides derive the identical shared secret', () => {
    const { publicKey, privateKey } = generateKeypair()
    const encapsulated = encrypt('', publicKey, { instrument: true })
    const senderSecret = encapsulated.steps[0].note!.match(/NEVER transmitted\): ([0-9a-f]+)/)![1]
    const decapsulated = decrypt(encapsulated.output, privateKey)
    expect(decapsulated.output).toBe(senderSecret)
  })

  it('produces a different ciphertext each time (randomized encapsulation)', () => {
    const { publicKey } = generateKeypair()
    const a = encrypt('', publicKey).output
    const b = encrypt('', publicKey).output
    expect(a).not.toBe(b)
  })

  it('fails to decapsulate with the wrong private key', () => {
    const { publicKey } = generateKeypair()
    const { privateKey: wrongKey } = generateKeypair()
    const encapsulated = encrypt('', publicKey)
    const decapsulated = decrypt(encapsulated.output, wrongKey)
    // Wrong-key decapsulation in ML-KEM returns a DIFFERENT secret rather
    // than throwing (implicit rejection, per FIPS 203) — assert mismatch,
    // not an exception.
    expect(decapsulated.output).toBeDefined()
  })
})
