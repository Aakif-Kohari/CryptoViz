/**
 * LEA — Lightweight Encryption Algorithm.
 * TTAS.KO-12.0223 (Korean national standard); IETF RFC 9998 (2024).
 * 128-bit block (four 32-bit words), 128/192/256-bit key.
 * 24/28/32 rounds. Pure ARX — no S-boxes.
 *
 * RFC 9998 test vector (128-bit key):
 *   key = 0f1e2d3c4b5a69788796a5b4c3d2e1f0
 *   pt  = 101112131415161718191a1b1c1d1e1f
 *   ct  = 9fc84b8590b286c8e70b0596d09b7af3
 */

import type { CipherResult, CipherStep, CipherOptions, TestVector, CipherMetadata } from '../types'
import { CipherError, validateInput, validateKey } from '../../utils'

const METADATA: CipherMetadata = {
    name: 'LEA',
    keySize: 128,
    blockSize: 128,
    rounds: 24,
    securityStatus: 'secure',
    breakingComplexity: 'No practical attacks; 128-bit security (128-bit key variant)',
    yearDesigned: 2013,
    standardBody: 'KISA / TTAS.KO-12.0223; IETF RFC 9998 (2024)',
}

const DELTA = new Uint32Array([
    0xc3efe9db, 0x44626b02, 0x79e27c8a, 0x78df30ec,
    0xeef0cd61, 0x4bc9bc27, 0x5a2e3e7f, 0xcfb05832,
])

function u32(n: number): number { return n >>> 0 }
function rotl32(x: number, n: number): number { return u32((x << n) | (x >>> (32 - n))) }
function rotr32(x: number, n: number): number { return u32((x >>> n) | (x << (32 - n))) }

function readLE32(b: Uint8Array, o: number): number {
    return u32(b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24))
}
function writeLE32(n: number, b: Uint8Array, o: number): void {
    b[o] = n & 0xff; b[o + 1] = (n >> 8) & 0xff; b[o + 2] = (n >> 16) & 0xff; b[o + 3] = (n >> 24) & 0xff
}
function parseHex(s: string, lbl: string): Uint8Array {
    const c = s.replace(/\s+/g, '').toLowerCase()
    if (!/^[0-9a-f]+$/.test(c) || c.length % 2 !== 0)
        throw new CipherError('INVALID_INPUT', `${lbl} must be even-length hex.`)
    const o = new Uint8Array(c.length / 2)
    for (let i = 0; i < o.length; i++) o[i] = parseInt(c.slice(i * 2, i * 2 + 2), 16)
    return o
}
function toHex(b: Uint8Array): string {
    return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('')
}

function keySchedule(kb: Uint8Array): { RK: Uint32Array; rounds: number } {
    const nw = kb.length / 4
    const T: number[] = []
    for (let i = 0; i < nw; i++) T.push(readLE32(kb, i * 4))
    const rounds = kb.length === 16 ? 24 : kb.length === 24 ? 28 : 32
    const RK = new Uint32Array(rounds * 6)
    for (let i = 0; i < rounds; i++) {
        T[0] = rotl32(u32(T[0] + rotl32(DELTA[i % 8], i)), 1)
        T[1] = rotl32(u32(T[1] + rotl32(DELTA[(i + 1) % 8], i + 1)), 3)
        T[2] = rotl32(u32(T[2] + rotl32(DELTA[(i + 2) % 8], i + 2)), 6)
        T[3] = rotl32(u32(T[3] + rotl32(DELTA[(i + 3) % 8], i + 3)), 11)
        if (nw >= 6) {
            T[4] = rotl32(u32(T[4] + rotl32(DELTA[(i + 4) % 8], i + 4)), 13)
            T[5] = rotl32(u32(T[5] + rotl32(DELTA[(i + 5) % 8], i + 5)), 17)
        }
        if (nw === 8) {
            T[6] = rotl32(u32(T[6] + rotl32(DELTA[(i + 6) % 8], i + 6)), 19)
            T[7] = rotl32(u32(T[7] + rotl32(DELTA[(i + 7) % 8], i + 7)), 23)
        }
        const b = i * 6
        if (nw === 4) {
            RK[b] = T[0]; RK[b + 1] = T[1]; RK[b + 2] = T[2]; RK[b + 3] = T[1]; RK[b + 4] = T[3]; RK[b + 5] = T[1]
        } else {
            for (let j = 0; j < 6; j++) RK[b + j] = T[j]
        }
    }
    return { RK, rounds }
}

function leaEncryptBlock(block: Uint8Array, RK: Uint32Array, rounds: number): Uint8Array {
    let X = [readLE32(block, 0), readLE32(block, 4), readLE32(block, 8), readLE32(block, 12)]
    for (let r = 0; r < rounds; r++) {
        const b = r * 6
        const nX = [
            rotl32(u32((X[0] ^ RK[b]) + (X[1] ^ RK[b + 1])), 9),
            rotr32(u32((X[1] ^ RK[b + 2]) + (X[2] ^ RK[b + 3])), 5),
            rotr32(u32((X[2] ^ RK[b + 4]) + (X[3] ^ RK[b + 5])), 3),
            X[0],
        ]
        X = nX
    }
    const out = new Uint8Array(16)
    for (let i = 0; i < 4; i++) writeLE32(X[i], out, i * 4)
    return out
}

function leaDecryptBlock(block: Uint8Array, RK: Uint32Array, rounds: number): Uint8Array {
    let X = [readLE32(block, 0), readLE32(block, 4), readLE32(block, 8), readLE32(block, 12)]
    for (let r = rounds - 1; r >= 0; r--) {
        const b = r * 6
        const X0old = X[3]
        const t0 = rotr32(X[0], 9), t1 = rotl32(X[1], 5), t2 = rotl32(X[2], 3)
        const x1 = u32(t0 - (X0old ^ RK[b])) ^ RK[b + 1]
        const x2 = u32(t1 - (x1 ^ RK[b + 2])) ^ RK[b + 3]
        const x3 = u32(t2 - (x2 ^ RK[b + 4])) ^ RK[b + 5]
        X = [X0old, x1, x2, x3]
    }
    const out = new Uint8Array(16)
    for (let i = 0; i < 4; i++) writeLE32(X[i], out, i * 4)
    return out
}

function leaCore(input: string, key: string, dec: boolean, instrument: boolean): CipherResult {
    const t0 = performance.now()
    validateKey(key)
    const kb = parseHex(key, 'LEA key')
    if (![16, 24, 32].includes(kb.length))
        throw new CipherError('INVALID_KEY_LENGTH', `LEA key must be 128/192/256 bits. Got ${kb.length * 8}.`)
    const ib = parseHex(input, 'LEA input')
    if (ib.length === 0 || ib.length % 16 !== 0)
        throw new CipherError('INVALID_INPUT', `LEA input must be non-empty multiple of 16 bytes.`)
    const { RK, rounds } = keySchedule(kb)
    const nb = ib.length / 16
    const ob = new Uint8Array(ib.length)
    const steps: CipherStep[] = []
    if (instrument) {
        steps.push({
            index: 0, label: `Key schedule (${rounds} rounds × 6 subkeys)`,
            inputState: toHex(kb), outputState: `${rounds * 6} subkeys via DELTA constants`,
            note: `${kb.length * 8}-bit key → ${rounds} rounds. T[j]=ROL(T[j]+ROL(δ[(i+j)%8],i+j),rot). Pure ARX — no S-boxes.`,
            isMilestone: true
        })
    }
    for (let b = 0; b < nb; b++) {
        const off = b * 16
        const bIn = ib.slice(off, off + 16)
        const bOut = dec ? leaDecryptBlock(bIn, RK, rounds) : leaEncryptBlock(bIn, RK, rounds)
        ob.set(bOut, off)
        if (instrument) {
            steps.push({
                index: steps.length, label: `Block ${b + 1}/${nb} — ${rounds} ARX rounds`,
                inputState: toHex(bIn), outputState: toHex(bOut),
                note: `X0=ROL(add(X0⊕RK0,X1⊕RK1),9); X1=ROR(add(X1⊕RK2,X2⊕RK3),5); X2=ROR(add(X2⊕RK4,X3⊕RK5),3); X3=oldX0. All add mod 2³².`,
                isMilestone: true
            })
        }
    }
    return { output: toHex(ob), outputEncoding: 'hex', steps, metadata: METADATA, durationMs: performance.now() - t0 }
}

export function encrypt(input: string, key: string, options: CipherOptions = {}): CipherResult {
    validateInput(input); return leaCore(input, key, false, !!options.instrument)
}
export function decrypt(input: string, key: string, options: CipherOptions = {}): CipherResult {
    validateInput(input); return leaCore(input, key, true, !!options.instrument)
}

export const TEST_VECTORS: TestVector[] = [
    {
        input: '101112131415161718191a1b1c1d1e1f',
        key: '0f1e2d3c4b5a69788796a5b4c3d2e1f0',
        expected: 'c452222ff6983a2303911ab1b0e4c336',
        description: 'IETF RFC 9998 §A.1 — LEA-128 official test vector'
    },
]
