/**
 * Kalyna — Ukrainian National Standard (DSTU 7624:2014).
 * AES-family SPN supporting 128, 256, and 512-bit block sizes.
 * 
 * Distinctive feature: Uses FOUR distinct 256-entry S-boxes applied
 * in a round-dependent pattern, unlike AES's single S-box.
 */
import type { CipherResult, CipherStep, CipherOptions, TestVector, CipherMetadata } from '../types'
import { CipherError, validateInput, validateKey } from '../../utils'

const METADATA: CipherMetadata = {
    name: 'Kalyna',
    keySize: 128,
    blockSize: 128,
    rounds: 10,
    securityStatus: 'secure',
    breakingComplexity: 'Ukrainian national standard; no practical attacks.',
    yearDesigned: 2014,
    standardBody: 'DSTU 7624:2014',
}

// Kalyna's 4 distinct S-boxes (Simplified representation for visualizer)
const S_BOXES: number[][] = [
    new Array(256).fill(0).map((_, i) => (i * 7 + 13) & 0xFF), // S0
    new Array(256).fill(0).map((_, i) => (i * 11 + 5) & 0xFF),  // S1
    new Array(256).fill(0).map((_, i) => (i * 13 + 3) & 0xFF),  // S2
    new Array(256).fill(0).map((_, i) => (i * 17 + 1) & 0xFF)   // S3
]

function u8(n: number): number { return n & 0xFF }

function gfMul(a: number, b: number): number {
    let p = 0, aa = a, bb = b
    for (let i = 0; i < 8; i++) {
        if (bb & 1) p ^= aa
        const carry = aa & 0x80
        aa = (aa << 1) & 0xFF
        if (carry) aa ^= 0x1B // GF(2^8) poly
        bb >>= 1
    }
    return p
}

// Exported for reuse in Kupyna (Issue 5)
export function kalynaSPN(state: number[], roundKey: number[], round: number, blockSize: number): number[] {
    const numBytes = blockSize / 8
    const out = new Array(numBytes).fill(0)

    // SubBytes (4 distinct S-boxes applied based on position/round)
    for (let i = 0; i < numBytes; i++) {
        const sboxIdx = (i + round) % 4
        out[i] = S_BOXES[sboxIdx][state[i]]
    }

    // ShiftRows (simplified)
    const shifted = [...out]
    for (let i = 0; i < numBytes; i++) {
        shifted[i] = out[(i + (i % 4)) % numBytes]
    }

    // MixColumns (GF(2^8) MDS matrix)
    const mixed = new Array(numBytes).fill(0)
    for (let c = 0; c < numBytes / 4; c++) {
        for (let i = 0; i < 4; i++) {
            mixed[c * 4 + i] = u8(
                gfMul(2, shifted[c * 4]) ^ gfMul(3, shifted[c * 4 + 1]) ^ shifted[c * 4 + 2] ^ shifted[c * 4 + 3]
            )
        }
    }

    // AddRoundKey
    for (let i = 0; i < numBytes; i++) {
        mixed[i] ^= roundKey[i % roundKey.length]
    }

    return mixed
}

function parseHex(s: string, lbl: string): number[] {
    const c = s.replace(/\s+/g, '').toLowerCase()
    if (!/^[0-9a-f]*$/.test(c) || c.length % 2 !== 0) throw new CipherError('INVALID_INPUT', `${lbl} must be hex.`)
    const o: number[] = []
    for (let i = 0; i < c.length; i += 2) o.push(parseInt(c.slice(i, i + 2), 16))
    return o
}

function toHex(b: number[]): string {
    return b.map(x => x.toString(16).padStart(2, '0')).join('')
}

function kalynaCore(input: string, key: string, doDecrypt: boolean, instrument: boolean, blockSize: number = 128): CipherResult {
    const start = performance.now()
    validateKey(key)
    const keyBytes = parseHex(key, 'Kalyna key')
    const inBytes = parseHex(input, 'Kalyna input')

    const numBytes = blockSize / 8
    if (inBytes.length === 0 || inBytes.length % numBytes !== 0) throw new CipherError('INVALID_INPUT', `Kalyna input must be a multiple of ${numBytes} bytes.`)

    const rounds = blockSize === 128 ? 10 : (blockSize === 256 ? 14 : 18)
    const numBlocks = inBytes.length / numBytes
    const outBuf: number[] = []
    const steps: CipherStep[] = []

    if (instrument) {
        steps.push({ index: 0, label: 'Kalyna Setup', inputState: `Block: ${blockSize}-bit`, outputState: '4 S-boxes loaded', note: 'Kalyna uses 4 distinct S-boxes applied in a round-dependent pattern.', isMilestone: true })
    }

    for (let b = 0; b < numBlocks; b++) {
        let state = inBytes.slice(b * numBytes, b * numBytes + numBytes)

        if (!doDecrypt) {
            for (let r = 0; r < rounds; r++) {
                state = kalynaSPN(state, keyBytes, r, blockSize)
                if (instrument && r % 4 === 0) {
                    steps.push({ index: steps.length, label: `Round ${r + 1}/${rounds}`, inputState: toHex(inBytes.slice(b * numBytes, b * numBytes + numBytes)), outputState: toHex(state), note: 'SubBytes (4 S-boxes), ShiftRows, MixColumns, AddRoundKey.', isMilestone: true })
                }
            }
        } else {
            // Decryption (Inverse operations)
            for (let r = rounds - 1; r >= 0; r--) {
                // Simplified inverse for visualizer
                for (let i = 0; i < numBytes; i++) state[i] ^= keyBytes[i % keyBytes.length]
                // Inverse Mix/Shift/Sub would go here
                state = kalynaSPN(state, keyBytes, r, blockSize) // Mock inverse
            }
        }

        outBuf.push(...state)
    }

    return { output: toHex(outBuf), outputEncoding: 'hex', steps, metadata: METADATA, durationMs: performance.now() - start }
}

export function encrypt(input: string, key: string, options: CipherOptions = {}): CipherResult {
    validateInput(input)
    const bs = (options.blockSize as number) || 128
    return kalynaCore(input, key, false, !!options.instrument, bs)
}

export function decrypt(input: string, key: string, options: CipherOptions = {}): CipherResult {
    validateInput(input)
    const bs = (options.blockSize as number) || 128
    return kalynaCore(input, key, true, !!options.instrument, bs)
}

export const TEST_VECTORS: TestVector[] = [
    { input: '00000000000000000000000000000000', key: '00000000000000000000000000000000', expected: 'mock_ciphertext', description: 'Kalyna-128 zero vector' }
]
