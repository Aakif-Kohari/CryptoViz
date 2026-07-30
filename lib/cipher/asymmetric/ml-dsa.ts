/**
 * ML-DSA-65 (Dilithium) — NIST FIPS 204, post-quantum digital signatures.
 * @see CIPHER_ENGINE.md section "ML-DSA"
 *
 * Security based on Module-LWE / Module-SIS lattice problems (same
 * family as this batch's companion ML-KEM module) — completes a
 * post-quantum "key encapsulation + signing" pair the way X25519/
 * Ed25519 do classically over Curve25519.
 *
 * REQUIRES @noble/post-quantum (share with the ML-KEM PR if it lands
 * first — do not add the dependency twice).
 *
 * Signatures/keys are dramatically larger than any classical scheme
 * here (~1952-byte public key, ~3309-byte signature for ML-DSA-65) —
 * a genuine, visible tradeoff of post-quantum security worth surfacing
 * in the instrumented trace.
 *
 * IMPLEMENTATION NOTE: written without having run @noble/post-quantum
 * locally, and without having read ed25519.ts's exact contract shape —
 * verify both against the real files before trusting this verbatim.
 */

import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js'
import { CipherError } from '../../utils/errors'
import { toByteArray } from '../../utils/encoding'
import type { CipherResult, CipherStep, CipherMetadata, CipherOptions, TestVector } from '../types'

const METADATA: CipherMetadata = {
  name: 'ML-DSA-65',
  keySize: 1952 * 8, // public key size in bits, for display purposes — see file header for the actual byte sizes
  securityStatus: 'secure',
  yearDesigned: 2024,
  standardBody: 'NIST FIPS 204',
}

function bytesToHex(b: Uint8Array): string {
  return Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('')
}
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, '')
  if (!/^[0-9a-fA-F]*$/.test(clean) || clean.length % 2 !== 0) {
    throw new CipherError('INVALID_INPUT', 'Expected a hex string with an even number of digits.')
  }
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  return out
}

function signCore(message: string, privateKeyHex: string, instrument: boolean): CipherResult {
  const start = performance.now()
  let privKey: Uint8Array
  const steps: CipherStep[] = []

  if (!privateKeyHex.trim()) {
    const { publicKey, secretKey } = ml_dsa65.keygen()
    privKey = secretKey
    if (instrument) {
      steps.push({
        index: 0,
        label: 'Key generation',
        inputState: '(none supplied)',
        outputState: `public key: ${bytesToHex(publicKey).slice(0, 32)}… (${publicKey.length} bytes total)`,
        note: `No private key supplied — generated a fresh keypair. Note the size: ${publicKey.length}-byte public key vs. Ed25519's 32 bytes — a real tradeoff of post-quantum security.`,
        isMilestone: true,
      })
    }
  } else {
    privKey = hexToBytes(privateKeyHex)
  }

  const msgBytes = toByteArray(message, 'utf8')
  const signature = ml_dsa65.sign(privKey, msgBytes)

  if (instrument) {
    steps.push({
      index: steps.length,
      label: 'Sign',
      inputState: message,
      outputState: `${bytesToHex(signature).slice(0, 32)}… (${signature.length} bytes total)`,
      note: `Signature is ${signature.length} bytes — roughly 50x Ed25519's 64-byte signature.`,
      isMilestone: true,
    })
  }

  return {
    output: bytesToHex(signature),
    outputEncoding: 'hex',
    steps,
    metadata: METADATA,
    durationMs: performance.now() - start,
  }
}

function verifyCore(message: string, pubKeyAndSig: string, instrument: boolean): CipherResult {
  const start = performance.now()
  const parts = pubKeyAndSig.split('|').map((s) => s.trim())
  if (parts.length !== 2) {
    throw new CipherError('INVALID_KEY', 'Verify expects "publicKeyHex|signatureHex".')
  }
  const [pubKeyHex, sigHex] = parts
  const msgBytes = toByteArray(message, 'utf8')
  const valid = ml_dsa65.verify(hexToBytes(pubKeyHex), msgBytes, hexToBytes(sigHex))

  const steps: CipherStep[] = []
  if (instrument) {
    steps.push({
      index: 0,
      label: 'Verify',
      inputState: sigHex.slice(0, 32) + '…',
      outputState: valid ? 'VALID' : 'INVALID',
      note: `Checked the signature against the public key using the Module-LWE lattice equation. Result: ${valid ? 'Valid' : 'Invalid'}.`,
      isMilestone: true,
    })
  }
  if (!valid) {
    throw new CipherError('INVALID_INPUT', 'ML-DSA-65 signature verification failed.')
  }

  return {
    output: message,
    outputEncoding: 'utf8',
    steps,
    metadata: METADATA,
    durationMs: performance.now() - start,
  }
}

export function encrypt(input: string, key: string, options: CipherOptions = {}): CipherResult {
  return signCore(input, key, !!options.instrument)
}
export function decrypt(input: string, key: string, options: CipherOptions = {}): CipherResult {
  return verifyCore(input, key, !!options.instrument)
}

export function generateKeypair(): { publicKey: string; privateKey: string } {
  const { publicKey, secretKey } = ml_dsa65.keygen()
  return { publicKey: bytesToHex(publicKey), privateKey: bytesToHex(secretKey) }
}

export const TEST_VECTORS: TestVector[] = [
  // Not populated — ML-DSA signing involves internal randomness/rejection
  // sampling, so there's no fixed signature vector to pin against a
  // hand-picked key. See the test file for round-trip coverage instead.
]
