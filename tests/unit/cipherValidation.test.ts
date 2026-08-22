import { describe, expect, it } from 'vitest'
import fc from 'fast-check'
import { CipherError } from '../../lib/utils/errors'
import {
  DEFAULT_MAX_INPUT_BYTES,
  normalizeAsciiText,
  parseAndValidateHex,
  validateKeyLength,
  validateRequiredInput,
  validateCoprime,
  validateNumericRange,
  validateAlphabetSubset,
  validateMatrix2x2Invertible,
  validateBlockAlignment,
  validateCipherPayload,
  gcd,
} from '../../lib/utils/cipherValidation'

describe('cipher validation pipeline (#1322)', () => {
  it('rejects empty input with INPUT_REQUIRED', () => {
    expect(() => validateRequiredInput('')).toThrowError(CipherError)
    try {
      validateRequiredInput('')
    } catch (error) {
      expect(error).toMatchObject({ code: 'INPUT_REQUIRED' })
    }
  })

  it('enforces the default 4096-byte input limit', () => {
    expect(DEFAULT_MAX_INPUT_BYTES).toBe(4096)
    expect(() => validateRequiredInput('a'.repeat(4097))).toThrowError(
      /maximum size of 4096 bytes/
    )
  })

  it('counts UTF-8 bytes rather than JavaScript code units', () => {
    expect(() => validateRequiredInput('é'.repeat(2049))).toThrowError(
      /maximum size of 4096 bytes/
    )
  })

  it('normalizes hex whitespace and returns bytes', () => {
    expect(Array.from(parseAndValidateHex('00 aa\nFF'))).toEqual([0, 170, 255])
  })

  it('rejects odd-length and invalid hex consistently', () => {
    expect(() => parseAndValidateHex('abc', undefined, 'Key')).toThrowError(
      /even number of hexadecimal characters/
    )
    expect(() => parseAndValidateHex('00xz', undefined, 'Key')).toThrowError(
      /non-hexadecimal characters/
    )
  })

  it('validates expected byte lengths', () => {
    expect(() => parseAndValidateHex('0011', 3, 'AES key')).toThrowError(
      /must be exactly 3 bytes/
    )
    expect(parseAndValidateHex('001122', 3, 'AES key')).toHaveLength(3)
  })

  it('validates key lengths against allowed candidates', () => {
    expect(() => validateKeyLength('12345', [16, 24, 32], 'AES')).toThrowError(
      /AES key must be 16, 24 or 32 bytes/
    )
    expect(() => validateKeyLength(new Uint8Array(16), [16, 24, 32], 'AES')).not.toThrow()
  })

  it('normalizes ASCII text formatting', () => {
    expect(normalizeAsciiText('hello 123!', { uppercase: true, stripNonAlpha: true })).toBe('HELLO')
  })

  it('validates coprime numbers correctly', () => {
    expect(gcd(5, 26)).toBe(1)
    expect(() => validateCoprime(5, 26, 'Multiplier')).not.toThrow()
    expect(() => validateCoprime(4, 26, 'Multiplier')).toThrowError(CipherError)
  })

  it('validates numeric ranges', () => {
    expect(() => validateNumericRange(10, 0, 25, 'Shift')).not.toThrow()
    expect(() => validateNumericRange(30, 0, 25, 'Shift')).toThrowError(CipherError)
    expect(() => validateNumericRange(NaN, 0, 25, 'Shift')).toThrowError(CipherError)
  })

  it('validates alphabet subset membership', () => {
    expect(() => validateAlphabetSubset('HELLO', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')).not.toThrow()
    expect(() => validateAlphabetSubset('HELLO 123', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toThrowError(CipherError)
  })

  it('validates 2x2 matrix invertibility modulo 26', () => {
    // Invertible: det(M) = 3*7 - 2*5 = 21 - 10 = 11. gcd(11, 26) = 1
    expect(() => validateMatrix2x2Invertible([[3, 2], [5, 7]], 26)).not.toThrow()

    // Non-invertible: det(M) = 2*2 - 4*1 = 0
    expect(() => validateMatrix2x2Invertible([[2, 4], [1, 2]], 26)).toThrowError(CipherError)
  })

  it('validates block alignment', () => {
    expect(() => validateBlockAlignment(32, 16, 'AES')).not.toThrow()
    expect(() => validateBlockAlignment(15, 16, 'AES')).toThrowError(CipherError)
  })

  it('runs end-to-end validateCipherPayload pipeline', () => {
    const res = validateCipherPayload('caesar', 'HELLO', '3')
    expect(res.valid).toBe(true)
    expect(res.sanitizedKey).toBe('3')

    expect(() => validateCipherPayload('affine', 'HELLO', '', { a: 4, b: 5 })).toThrowError(CipherError)
  })

  describe('Property-Based Invariant Testing (fast-check)', () => {
    it('always verifies that parseAndValidateHex on valid even hex yields buffer of length / 2', () => {
      const hexChar = fc.constantFrom(...'0123456789abcdef'.split(''))
      fc.assert(
        fc.property(
          fc.array(hexChar, { minLength: 0, maxLength: 50 }).map(arr => arr.length % 2 === 0 ? arr.join('') : (arr.join('') + '0')),
          (hex) => {
            const buf = parseAndValidateHex(hex)
            expect(buf.length).toBe(hex.length / 2)
          }
        )
      )
    })

    it('always preserves length bound checks across arbitrary string inputs', () => {
      fc.assert(
        fc.property(
          fc.string({ maxLength: 100 }),
          (str) => {
            if (str.length === 0) {
              expect(() => validateRequiredInput(str)).toThrowError(CipherError)
            } else {
              expect(() => validateRequiredInput(str, 1000)).not.toThrow()
            }
          }
        )
      )
    })
  })
})
