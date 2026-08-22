/**
 * Unified Cryptographic Error Taxonomy (#1323)
 * Provides standardized, typed error structures across UI, Web Workers, and cipher engines.
 * @see CIPHER_ENGINE.md "Shared types" section
 */

// Re-export diagnostic functions for centralized error handling
export {
  diagnoseError,
  hasDiagnosticSupport,
  getAllDiagnosticCodes,
  type Diagnostic,
  type DiagnosticCode,
  type RemediationOption,
} from './cryptoDiagnostics'

/**
 * Standardized error categories and codes.
 */
export type CryptoVizErrorCategory =
  | 'INPUT'
  | 'KEY'
  | 'OPTION'
  | 'ALGORITHM'
  | 'ENCODING'
  | 'EXECUTION'
  | 'RESOURCE'
  | 'INTERNAL'

export type CryptoVizErrorCode =
  // Primary category codes
  | 'INPUT_INVALID'
  | 'KEY_INVALID'
  | 'OPTION_INVALID'
  | 'ALGORITHM_UNSUPPORTED'
  | 'ENCODING_INVALID'
  | 'EXECUTION_FAILED'
  | 'EXECUTION_CANCELLED'
  | 'RESOURCE_LIMIT'
  | 'INTERNAL_ERROR'
  // Specific legacy & specialized codes for backward compatibility
  | 'INPUT_REQUIRED'
  | 'INPUT_TOO_LONG'
  | 'INVALID_INPUT'
  | 'INVALID_KEY'
  | 'INVALID_KEY_LENGTH'
  | 'INVALID_KEY_SIZE'
  | 'KEY_REQUIRED'
  | 'INVALID_PADDING'
  | 'INVALID_IV'
  | 'WEAK_KEY'
  | 'KEY_PARITY_ERROR'
  | 'WEBCRYPTO_UNAVAILABLE'
  | 'AUTH_TAG_MISMATCH'
  | 'INVALID_AAD'
  | 'WORKER_TIMEOUT'
  | 'WORKER_EXECUTION_FAILED'
  | 'INVALID_WORKER_MESSAGE'
  | 'INVALID_CANCEL_MESSAGE'
  | 'DUPLICATE_JOB_ID'
  | 'JOB_ALREADY_COMPLETED'
  | 'JOB_ALREADY_CANCELLED'
  | 'JOB_ALREADY_TERMINAL'
  | 'JOB_NOT_FOUND'
  | 'ABORTED'
  | 'KDF_ERROR'
  | 'UNSUPPORTED_KDF'
  | 'ONE_WAY_HASH'

export type CipherErrorCode = CryptoVizErrorCode

export interface CryptoVizErrorOptions {
  details?: Record<string, unknown>
  remediation?: string
  cause?: unknown
}

/**
 * Standard Base Error Class for CryptoViz operations.
 */
export class CryptoVizError extends Error {
  public readonly code: CryptoVizErrorCode
  public readonly category: CryptoVizErrorCategory
  public readonly details?: Record<string, unknown>
  public readonly remediation?: string
  public readonly timestamp: number

  constructor(code: CryptoVizErrorCode, message: string, options: CryptoVizErrorOptions = {}) {
    super(message)
    this.name = 'CryptoVizError'
    this.code = code
    this.category = categorizeErrorCode(code)
    this.details = options.details
    this.remediation = options.remediation
    this.timestamp = Date.now()
    if (options.cause) {
      this.cause = options.cause
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      message: this.message,
      details: this.details,
      remediation: this.remediation,
      timestamp: this.timestamp,
    }
  }

  public static fromJSON(data: unknown): CryptoVizError {
    if (!data || typeof data !== 'object') {
      return new CryptoVizError('INTERNAL_ERROR', 'Unknown error structure')
    }
    const rec = data as Record<string, unknown>
    const code = (rec.code as CryptoVizErrorCode) || 'INTERNAL_ERROR'
    const msg = String(rec.message || 'Cryptographic operation failed')
    const err = new CryptoVizError(code, msg, {
      details: typeof rec.details === 'object' && rec.details !== null ? (rec.details as Record<string, unknown>) : undefined,
      remediation: typeof rec.remediation === 'string' ? rec.remediation : undefined,
    })
    return err
  }
}

/**
 * Backward-compatible CipherError extending CryptoVizError.
 */
export class CipherError extends CryptoVizError {
  constructor(code: CryptoVizErrorCode, message: string, options: CryptoVizErrorOptions = {}) {
    super(code, message, options)
    this.name = 'CipherError'
  }
}

/**
 * Maps error code to its top-level taxonomy category.
 */
export function categorizeErrorCode(code: CryptoVizErrorCode): CryptoVizErrorCategory {
  switch (code) {
    case 'INPUT_REQUIRED':
    case 'INPUT_TOO_LONG':
    case 'INVALID_INPUT':
    case 'INPUT_INVALID':
      return 'INPUT'

    case 'INVALID_KEY':
    case 'INVALID_KEY_LENGTH':
    case 'INVALID_KEY_SIZE':
    case 'KEY_REQUIRED':
    case 'WEAK_KEY':
    case 'KEY_PARITY_ERROR':
    case 'KEY_INVALID':
      return 'KEY'

    case 'INVALID_PADDING':
    case 'INVALID_IV':
    case 'INVALID_AAD':
    case 'OPTION_INVALID':
      return 'OPTION'

    case 'ALGORITHM_UNSUPPORTED':
    case 'UNSUPPORTED_KDF':
      return 'ALGORITHM'

    case 'ENCODING_INVALID':
      return 'ENCODING'

    case 'RESOURCE_LIMIT':
    case 'WORKER_TIMEOUT':
      return 'RESOURCE'

    case 'EXECUTION_CANCELLED':
    case 'EXECUTION_FAILED':
    case 'WEBCRYPTO_UNAVAILABLE':
    case 'AUTH_TAG_MISMATCH':
    case 'KDF_ERROR':
    case 'ONE_WAY_HASH':
      return 'EXECUTION'

    case 'INTERNAL_ERROR':
    default:
      return 'INTERNAL'
  }
}

/**
 * Type guard for CryptoVizError.
 */
export function isCryptoVizError(err: unknown): err is CryptoVizError {
  return err instanceof CryptoVizError || (typeof err === 'object' && err !== null && 'code' in err && 'name' in err)
}

/**
 * Converts any unknown error into a normalized CryptoVizError.
 */
export function toCryptoVizError(err: unknown, defaultCode: CryptoVizErrorCode = 'EXECUTION_FAILED'): CryptoVizError {
  if (err instanceof CryptoVizError) {
    return err
  }
  if (err instanceof Error) {
    return new CryptoVizError(defaultCode, err.message, { cause: err })
  }
  return new CryptoVizError(defaultCode, String(err))
}

/** Max input size: 2MB (allowing large benchmark tests) */
const MAX_INPUT_BYTES = 2 * 1024 * 1024

/**
 * Validate input is present and within size limits.
 * Call at the top of every encrypt/decrypt function.
 */
export function validateInput(input: unknown): asserts input is string {
  if (input === null || input === undefined || input === '') {
    throw new CipherError('INPUT_REQUIRED', 'Input text is required.')
  }
  if (typeof input !== 'string') {
    throw new CipherError('INPUT_REQUIRED', 'Input must be a string.')
  }
  const byteLength = new TextEncoder().encode(input).length
  if (byteLength > MAX_INPUT_BYTES) {
    throw new CipherError(
      'INPUT_TOO_LONG',
      `Input exceeds maximum size of ${MAX_INPUT_BYTES} bytes (got ${byteLength}).`
    )
  }
}

/**
 * Validate that a key is present and non-empty.
 * Individual ciphers add their own format validation on top.
 */
export function validateKey(key: unknown): asserts key is string {
  if (key === null || key === undefined || key === '') {
    throw new CipherError('INVALID_KEY', 'Encryption key is required.')
  }
  if (typeof key !== 'string') {
    throw new CipherError('INVALID_KEY', 'Key must be a string.')
  }
}

/**
 * Validate that a string is a valid hexadecimal value.
 */
export function validateHexString(
  value: string,
  field = "Input"
): void {
  if (/[^0-9a-fA-F]/.test(value)) {
    throw new CipherError(
      "INVALID_INPUT",
      `${field} contains non-hexadecimal characters.`
    )
  }

  if (value.length % 2 !== 0) {
    throw new CipherError(
      "INVALID_INPUT",
      `${field} must contain an even number of hexadecimal characters.`
    )
  }
}

/**
 * Validate maximum byte length.
 */
export function validateMaxInputBytes(
  input: string,
  maxBytes: number
): void {
  const size = new TextEncoder().encode(input).length

  if (size > maxBytes) {
    throw new CipherError(
      "INPUT_TOO_LONG",
      `Input exceeds maximum size of ${maxBytes} bytes.`
    )
  }
}