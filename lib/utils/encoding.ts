import type { Encoding } from '../cipher/types'
import { CipherError } from './errors'

export function toByteArray(str: string, encoding: Encoding): Uint8Array {
  if (encoding === 'utf8') {
    return new TextEncoder().encode(str)
  }
  if (encoding === 'hex') {
    if (str.length > 0) {
    validateHexString(str)
}
    const arr = new Uint8Array(str.length / 2)
    for (let i = 0; i < str.length; i += 2) {
      arr[i / 2] = parseInt(str.slice(i, i + 2), 16)
    }
    return arr
  }
  if (encoding === 'base64') {
    try {
      const binary = atob(str.trim())
      const arr = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        arr[i] = binary.charCodeAt(i)
      }
      return arr
    } catch {
      throw new CipherError('INVALID_KEY', 'Invalid base64 string.')
    }
  }
  // Binary or raw fallback
  const arr = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i) & 0xff
  }
  return arr
}

export function fromByteArray(arr: Uint8Array, encoding: Encoding): string {
  if (encoding === 'utf8') {
    return new TextDecoder().decode(arr)
  }
  if (encoding === 'hex') {
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  if (encoding === 'base64') {
    const binary = Array.from(arr)
      .map((b) => String.fromCharCode(b))
      .join('')
    return btoa(binary)
  }
  // Binary fallback
  return Array.from(arr)
    .map((b) => String.fromCharCode(b))
    .join('')
}
export function validateHexString(input: string, label = 'Input'): void {
  if (/[^0-9a-fA-F]/.test(input)) {
    throw new CipherError(
      'INVALID_INPUT',
      `${label} must contain only hexadecimal characters.`
    )
  }

  if (input.length % 2 !== 0) {
    throw new CipherError(
      'INVALID_INPUT',
      `${label} must have an even number of characters.`
    )
  }
}

export function validateRequiredInput(
  input: string,
  message = 'Input is required.'
): void {
  if (!input || input.trim() === '') {
    throw new CipherError('INPUT_REQUIRED', message)
  }
}

export function validateMaxLength(
  byteLength: number,
  max: number
): void {
  if (byteLength > max) {
    throw new CipherError(
      'INPUT_TOO_LONG',
      `Input exceeds maximum size of ${max} bytes.`
    )
  }
}