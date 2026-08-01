/**
 * ROT13 — Caesar cipher with k=13 (self-inverse).
 * @see CIPHER_ENGINE.md section 1.2
 *
 * ROT13 has no separate decrypt — it is its own inverse.
 * The UI shows a single "Transform" button.
 */

import type { CipherResult, CipherOptions, TestVector } from '../types'
import { validateInput } from '../../utils/errors'
import * as caesar from './caesar'

export function encrypt(
  input: string,
  _key: string = '13',
  options: CipherOptions = {}
): CipherResult {
  validateInput(input)
  const result = caesar.encrypt(input, '13', options)
  return {
    ...result,
    metadata: {
      ...result.metadata,
      name: 'ROT13',
      securityStatus: 'broken',
      breakingComplexity: 'Trivially reversible — self-inverse',
    },
  }
}

/** ROT13 is self-inverse: ROT13(ROT13(x)) = x */
export function decrypt(
  input: string,
  key: string = '13',
  options: CipherOptions = {}
): CipherResult {
  return encrypt(input, key, options)
}

export const TEST_VECTORS: TestVector[] = [
  { input: 'HELLO', key: '13', expected: 'URYYB' },
  { input: 'URYYB', key: '13', expected: 'HELLO' },
  { input: 'ATTACK AT DAWN', key: '13', expected: 'NGGNPX NG QNJA' },
  { input: 'abc', key: '13', expected: 'nop' },
]
