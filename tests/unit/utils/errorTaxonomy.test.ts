import { describe, it, expect } from 'vitest'
import {
  CryptoVizError,
  CipherError,
  categorizeErrorCode,
  isCryptoVizError,
  toCryptoVizError,
  CryptoVizErrorCode,
} from '../../../lib/utils/errors'

describe('Unified Cryptographic Error Taxonomy (#1323)', () => {
  it('instantiates CryptoVizError with code, category, and timestamp', () => {
    const err = new CryptoVizError('KEY_INVALID', 'Invalid key parameter provided.', {
      details: { keyLength: 8, expected: 16 },
      remediation: 'Provide a 16-byte key.',
    })

    expect(err.name).toBe('CryptoVizError')
    expect(err.code).toBe('KEY_INVALID')
    expect(err.category).toBe('KEY')
    expect(err.message).toBe('Invalid key parameter provided.')
    expect(err.details).toEqual({ keyLength: 8, expected: 16 })
    expect(err.remediation).toBe('Provide a 16-byte key.')
    expect(typeof err.timestamp).toBe('number')
  })

  it('preserves backward compatibility with CipherError', () => {
    const cipherErr = new CipherError('INPUT_REQUIRED', 'Input text is required.')
    expect(cipherErr instanceof CryptoVizError).toBe(true)
    expect(cipherErr instanceof Error).toBe(true)
    expect(cipherErr.name).toBe('CipherError')
    expect(cipherErr.code).toBe('INPUT_REQUIRED')
    expect(cipherErr.category).toBe('INPUT')
  })

  it('correctly maps all error codes to taxonomy categories', () => {
    expect(categorizeErrorCode('INPUT_REQUIRED')).toBe('INPUT')
    expect(categorizeErrorCode('INPUT_TOO_LONG')).toBe('INPUT')
    expect(categorizeErrorCode('INVALID_INPUT')).toBe('INPUT')
    expect(categorizeErrorCode('INPUT_INVALID')).toBe('INPUT')

    expect(categorizeErrorCode('INVALID_KEY')).toBe('KEY')
    expect(categorizeErrorCode('KEY_INVALID')).toBe('KEY')
    expect(categorizeErrorCode('WEAK_KEY')).toBe('KEY')

    expect(categorizeErrorCode('INVALID_PADDING')).toBe('OPTION')
    expect(categorizeErrorCode('OPTION_INVALID')).toBe('OPTION')

    expect(categorizeErrorCode('ALGORITHM_UNSUPPORTED')).toBe('ALGORITHM')
    expect(categorizeErrorCode('ENCODING_INVALID')).toBe('ENCODING')
    expect(categorizeErrorCode('WORKER_TIMEOUT')).toBe('RESOURCE')
    expect(categorizeErrorCode('RESOURCE_LIMIT')).toBe('RESOURCE')

    expect(categorizeErrorCode('EXECUTION_FAILED')).toBe('EXECUTION')
    expect(categorizeErrorCode('INTERNAL_ERROR')).toBe('INTERNAL')
  })

  it('serializes to and deserializes from JSON across worker IPC boundaries', () => {
    const original = new CryptoVizError('ALGORITHM_UNSUPPORTED', 'Cipher test-alg is not supported.', {
      details: { algorithm: 'test-alg' },
      remediation: 'Select from available algorithms.',
    })

    const json = original.toJSON()
    expect(json.code).toBe('ALGORITHM_UNSUPPORTED')
    expect(json.category).toBe('ALGORITHM')

    const deserialized = CryptoVizError.fromJSON(json)
    expect(deserialized.code).toBe('ALGORITHM_UNSUPPORTED')
    expect(deserialized.category).toBe('ALGORITHM')
    expect(deserialized.message).toBe('Cipher test-alg is not supported.')
    expect(deserialized.details).toEqual({ algorithm: 'test-alg' })
    expect(deserialized.remediation).toBe('Select from available algorithms.')
  })

  it('normalizes arbitrary unknown errors to CryptoVizError', () => {
    const rawError = new Error('Raw generic runtime fault')
    const normalized = toCryptoVizError(rawError, 'EXECUTION_FAILED')
    expect(normalized instanceof CryptoVizError).toBe(true)
    expect(normalized.code).toBe('EXECUTION_FAILED')
    expect(normalized.message).toBe('Raw generic runtime fault')
    expect(normalized.cause).toBe(rawError)

    const strError = toCryptoVizError('plain string failure', 'INTERNAL_ERROR')
    expect(strError.code).toBe('INTERNAL_ERROR')
    expect(strError.message).toBe('plain string failure')
  })

  it('correctly identifies errors using isCryptoVizError type guard', () => {
    const err = new CryptoVizError('INPUT_INVALID', 'Invalid')
    expect(isCryptoVizError(err)).toBe(true)
    expect(isCryptoVizError(new Error('std'))).toBe(false)
    expect(isCryptoVizError({ name: 'CipherError', code: 'INVALID_KEY' })).toBe(true)
  })
})
