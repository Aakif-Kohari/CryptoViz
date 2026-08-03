import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/asymmetric/ecc'
import { p256 } from '@noble/curves/nist.js'
import { fromByteArray } from '../../../lib/utils/encoding'

describe('ECC Asymmetric Cipher Unit Tests', () => {
  it('passes standard test vectors (signing)', () => {
    const vector = TEST_VECTORS[0]
    const result = encrypt(vector.input, vector.key)
    expect(result.output).toBe(vector.expected)
  })

  it('passes standard test vectors (verification)', () => {
    const _vector = TEST_VECTORS[0]
    const privKeyBytes = p256.utils.randomSecretKey()
    const pubKeyBytes = p256.getPublicKey(privKeyBytes)
    const pubKeyHex = fromByteArray(pubKeyBytes, 'hex')

    const message = 'Hello P-256'
    const sigResult = encrypt(message, fromByteArray(privKeyBytes, 'hex'))
    const sigHex = sigResult.output

    const keyParam = `${sigHex},${pubKeyHex}`
    const verifyResult = decrypt(message, keyParam)
    expect(verifyResult.output).toBe('valid')

    // Mismatched message
    const verifyResultFail = decrypt('Wrong message', keyParam)
    expect(verifyResultFail.output).toBe('invalid')
  })

  it('handles instrumented mode correctly for encrypt and decrypt', () => {
    const vector = TEST_VECTORS[0]
    const encResult = encrypt(vector.input, vector.key, { instrument: true })
    expect(encResult.steps.length).toBe(5)
    expect(encResult.steps[4].label).toBe('Signature Generation (r, s)')

    const privKeyBytes = p256.utils.randomSecretKey()
    const pubKeyBytes = p256.getPublicKey(privKeyBytes)
    const pubKeyHex = fromByteArray(pubKeyBytes, 'hex')
    const keyParam = `${encResult.output},${pubKeyHex}`

    const decResult = decrypt(vector.input, keyParam, { instrument: true })
    expect(decResult.steps.length).toBe(3)
    expect(decResult.steps[2].label).toBe('Signature Verification result')
  })

  it('throws on invalid input/key parameters', () => {
    expect(() => encrypt('hello', 'invalid-hex')).toThrow(/Private key must be a valid hex/)
    expect(() => encrypt('hello', '1234')).toThrow(/private key must be 32 bytes/)
    expect(() => decrypt('hello', 'only-one-part')).toThrow(/Verification key must specify/)
  })

  it('converts point coordinates to uncompressed point hex', async () => {
    const { pointToHex, parseUncompressedPoint } = await import('../../../lib/ecc/point-conversion-utils')
    const hex = pointToHex(12345n, 67890n)
    expect(hex.startsWith('04')).toBe(true)
    const parsed = parseUncompressedPoint(hex)
    expect(parsed.x).toBe(12345n)
    expect(parsed.y).toBe(67890n)
  })
})
