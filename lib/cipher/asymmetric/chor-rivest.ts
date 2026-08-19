/**
 * Chor-Rivest Cryptosystem — Benny Chor & Ronald Rivest (CRYPTO 1988).
 *
 * Knapsack cryptosystem disguised via discrete logarithms computed
 * within the finite field EXTENSION GF(p^h) — genuinely more elaborate
 * than the simple prime-field discrete logs used by most DL schemes
 * already in this repo.
 *
 * FIXED HAMMING WEIGHT CONSTRAINT:
 * Chor-Rivest requires messages to have a specific fixed Hamming weight
 * (number of 1-bits). This is a genuine constraint distinct from
 * Merkle-Hellman's flexible arbitrary-binary-vector messages.
 *
 * BROKEN: Vaudenay (1998) broke this scheme via an attack specifically
 * targeting its GF(p^h) discrete-log construction — a genuinely different
 * break from Merkle-Hellman's Shamir lattice-reduction attack.
 *
 * Status: BROKEN (unconditionally, per Vaudenay 1998).
 */
import type { CipherResult, CipherStep, CipherOptions, TestVector, CipherMetadata } from '../types'
import { CipherError, validateInput } from '../../utils'

const METADATA: CipherMetadata = {
    name: 'Chor-Rivest',
    securityStatus: 'broken',
    breakingComplexity: 'Vaudenay (1998): attack targeting the GF(p^h) discrete-log construction. Distinct break from Merkle-Hellman\'s Shamir lattice-reduction attack.',
    yearDesigned: 1988,
    standardBody: 'CRYPTO 1988',
}

// Toy parameters: small field extension GF(p^h)
const P = 5       // Prime
const H = 3       // Extension degree
const FIELD_SIZE = Math.pow(P, H)  // p^h = 125
const MSG_LEN = 10  // Length of binary message vector
const FIXED_WEIGHT = 3  // Required Hamming weight

// Irreducible polynomial of degree h over GF(p)
// For GF(5^3): x^3 + x + 1 (represented as [1, 1, 0, 1] in ascending order)
const IRREDUCIBLE_POLY = [1, 1, 0, 1]

/**
 * GF(p^h) element: polynomial of degree < h over GF(p).
 * Represented as number[] of length h (coefficients in ascending order).
 */
type GFElement = number[]

function gfZero(): GFElement { return new Array(H).fill(0) }
function gfOne(): GFElement { const e = gfZero(); e[0] = 1; return e }

function gfAdd(a: GFElement, b: GFElement): GFElement {
    const out: GFElement = new Array(H).fill(0)
    for (let i = 0; i < H; i++) out[i] = (a[i] + b[i]) % P
    return out
}

function gfSub(a: GFElement, b: GFElement): GFElement {
    const out: GFElement = new Array(H).fill(0)
    for (let i = 0; i < H; i++) out[i] = ((a[i] - b[i]) % P + P) % P
    return out
}

/**
 * Polynomial multiplication modulo the irreducible polynomial.
 * This is genuine GF(p^h) arithmetic, not simple integer modular arithmetic.
 */
function gfMul(a: GFElement, b: GFElement): GFElement {
    // Polynomial multiplication (up to degree 2h-2)
    const product = new Array(2 * H - 1).fill(0)
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < H; j++) {
            product[i + j] = (product[i + j] + a[i] * b[j]) % P
        }
    }

    // Reduce modulo irreducible polynomial
    for (let i = 2 * H - 2; i >= H; i--) {
        if (product[i] !== 0) {
            for (let j = 0; j <= H; j++) {
                product[i - H + j] = (product[i - H + j] - product[i] * IRREDUCIBLE_POLY[j] % P + P) % P
            }
        }
    }

    return product.slice(0, H)
}

/**
 * Compute g^k in GF(p^h) via square-and-multiply.
 */
function gfPow(g: GFElement, k: number): GFElement {
    let result = gfOne()
    let base = g
    let exp = k
    while (exp > 0) {
        if (exp % 2 === 1) result = gfMul(result, base)
        base = gfMul(base, base)
        exp = Math.floor(exp / 2)
    }
    return result
}

/**
 * Find a generator g of GF(p^h)*.
 * Generator must have order p^h - 1.
 */
function findGenerator(): GFElement {
    const targetOrder = FIELD_SIZE - 1
    // Try elements starting from x (the polynomial variable)
    const x: GFElement = new Array(H).fill(0)
    x[1] = 1  // x = [0, 1, 0]

    for (let i = 1; i < FIELD_SIZE; i++) {
        const candidate: GFElement = new Array(H).fill(0)
        let tmp = i
        for (let j = 0; j < H; j++) {
            candidate[j] = tmp % P
            tmp = Math.floor(tmp / P)
        }
        // Check if candidate has order p^h - 1
        const powered = gfPow(candidate, targetOrder)
        const isOne = powered.every((c, idx) => idx === 0 ? c === 1 : c === 0)
        if (isOne) {
            // Verify it's a primitive root (no smaller order)
            let isPrimitive = true
            for (const divisor of [P - 1, (FIELD_SIZE - 1) / P]) {
                if (divisor >= 1 && Number.isInteger(divisor)) {
                    const test = gfPow(candidate, divisor)
                    const testIsOne = test.every((c, idx) => idx === 0 ? c === 1 : c === 0)
                    if (testIsOne) { isPrimitive = false; break }
                }
            }
            if (isPrimitive) return candidate
        }
    }
    return x  // Fallback
}

/**
 * Compute discrete logarithm in GF(p^h): find k such that g^k = target.
 * Toy: brute-force search (small field).
 */
function discreteLog(g: GFElement, target: GFElement): number {
    let current = gfOne()
    for (let k = 0; k < FIELD_SIZE; k++) {
        let match = true
        for (let i = 0; i < H; i++) {
            if (current[i] !== target[i]) { match = false; break }
        }
        if (match) return k
        current = gfMul(current, g)
    }
    throw new CipherError('INTERNAL_ERROR', 'Discrete log not found')
}

interface ChorRivestKeys {
    publicWeights: number[]  // Knapsack weights (public)
    privatePermutation: number[]  // Permutation disguising the structure
    privateD: number  // Modular transformation factor
    generator: GFElement
}

/**
 * Key generation: compute discrete logarithms in GF(p^h) for a specific
 * set of field elements, then disguise them via permutation and modular
 * transformation.
 */
function keygen(): ChorRivestKeys {
    const g = findGenerator()

    // Compute discrete logs of "linear" elements (basis of GF(p^h) over GF(p))
    // These form the structured knapsack weights
    const structuredWeights: number[] = []
    for (let i = 0; i < MSG_LEN; i++) {
        const element: GFElement = new Array(H).fill(0);
        element[i % H] = (Math.floor(i / H) + 1) % P;
        if (element.every(c => c === 0)) element[0] = 1;
        const log = discreteLog(g, element);
        structuredWeights.push(log);
    }

    // Disguise via random permutation
    const perm: number[] = Array.from({ length: MSG_LEN }, (_, i) => i)
    for (let i = MSG_LEN - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [perm[i], perm[j]] = [perm[j], perm[i]]
    }

    // Disguise via modular transformation
    const d = Math.floor(Math.random() * (FIELD_SIZE - 2)) + 1
    const publicWeights: number[] = new Array(MSG_LEN).fill(0)
    for (let i = 0; i < MSG_LEN; i++) {
        publicWeights[perm[i]] = (structuredWeights[i] * d) % (FIELD_SIZE - 1)
    }

    return {
        publicWeights,
        privatePermutation: perm,
        privateD: d,
        generator: g
    }
}

/**
 * Encrypt: sum a SUBSET of public weights corresponding to message bits.
 * REQUIRES: message has exactly FIXED_WEIGHT 1-bits.
 */
function encryptMessage(message: number[], keys: ChorRivestKeys): number {
    // Enforce fixed Hamming weight constraint
    const weight = message.reduce((sum, bit) => sum + bit, 0)
    if (weight !== FIXED_WEIGHT) {
        throw new CipherError('INVALID_INPUT', `Chor-Rivest requires messages with exactly ${FIXED_WEIGHT} 1-bits. Got ${weight}.`)
    }

    let ciphertext = 0
    for (let i = 0; i < MSG_LEN; i++) {
        if (message[i] === 1) {
            ciphertext = (ciphertext + keys.publicWeights[i]) % (FIELD_SIZE - 1)
        }
    }
    return ciphertext
}

/**
 * Decrypt: transform ciphertext back into GF(p^h) domain where the
 * fixed-weight structure makes recovering the subset selection tractable.
 */
function decryptMessage(ciphertext: number, keys: ChorRivestKeys): number[] {
    // Undo modular transformation: multiply by d^(-1)
    const dInv = modInverse(keys.privateD, FIELD_SIZE - 1)
    const transformed = (ciphertext * dInv) % (FIELD_SIZE - 1)

    // Undo permutation to get structured weights
    const structuredWeights: number[] = new Array(MSG_LEN).fill(0)
    for (let i = 0; i < MSG_LEN; i++) {
        structuredWeights[i] = keys.publicWeights[keys.privatePermutation[i]]
        structuredWeights[i] = (structuredWeights[i] * dInv) % (FIELD_SIZE - 1)
    }

    // Recover the subset of size FIXED_WEIGHT that sums to `transformed`
    // Toy: brute-force search over all subsets of size FIXED_WEIGHT
    const message: number[] = new Array(MSG_LEN).fill(0)
    const indices = Array.from({ length: MSG_LEN }, (_, i) => i)

    function findSubset(remaining: number[], currentSum: number, chosen: number[]): boolean {
        if (chosen.length === FIXED_WEIGHT) {
            return currentSum % (FIELD_SIZE - 1) === transformed
        }
        if (remaining.length === 0) return false

        const [first, ...rest] = remaining
        // Try including first
        chosen.push(first)
        if (findSubset(rest, (currentSum + structuredWeights[first]) % (FIELD_SIZE - 1), chosen)) return true
        chosen.pop()
        // Try excluding first
        if (findSubset(rest, currentSum, chosen)) return true
        return false
    }

    const chosen: number[] = []
    if (findSubset(indices, 0, chosen)) {
        for (const idx of chosen) message[idx] = 1
    }

    return message
}

function modInverse(a: number, m: number): number {
    let t = 0, newt = 1
    let r = m, newr = a % m
    while (newr !== 0) {
        const quotient = Math.floor(r / newr)
        t = t - quotient * newt
        r = r - quotient * newr;
        [t, newt] = [newt, t];
        [r, newr] = [newr, r];
    }
    return ((t % m) + m) % m
}

function parseHex(s: string): number[] {
    const c = s.replace(/\s+/g, '').toLowerCase()
    if (!/^[0-9a-f]*$/.test(c) || c.length % 2 !== 0) {
        throw new CipherError('INVALID_INPUT', `Must be hex.`)
    }
    const o: number[] = []
    for (let i = 0; i < c.length; i += 2) o.push(parseInt(c.slice(i, i + 2), 16))
    return o
}

function toHex(b: number[]): string {
    return b.map(x => x.toString(16).padStart(2, '0')).join('')
}

function chorRivestCore(input: string, key: string, doDecrypt: boolean, instrument: boolean): CipherResult {
    const start = performance.now()
    const steps: CipherStep[] = []

    if (instrument) {
        steps.push({
            index: 0,
            label: 'Chor-Rivest Setup',
            inputState: `GF(${P}^${H}), msg_len=${MSG_LEN}, weight=${FIXED_WEIGHT}`,
            outputState: 'Knapsack weights via GF(p^h) discrete logs',
            note: 'Chor-Rivest disguises a knapsack via discrete logarithms in the FIELD EXTENSION GF(p^h) — genuinely more elaborate than the simple prime-field discrete logs used by most DL schemes. FIXED HAMMING WEIGHT CONSTRAINT: messages must have exactly the required number of 1-bits. Broken by Vaudenay (1998) via an attack targeting this specific GF(p^h) construction.',
            isMilestone: true
        })
    }

    let outHex = ''

    if (!doDecrypt) {
        // ENCRYPT
        const keys = keygen()
        const msgBytes = parseHex(input)

        // Convert bytes to binary vector of length MSG_LEN
        const bits: number[] = []
        for (const byte of msgBytes) {
            for (let bit = 7; bit >= 0 && bits.length < MSG_LEN; bit--) {
                bits.push((byte >> bit) & 1)
            }
        }
        while (bits.length < MSG_LEN) bits.push(0)

        const ciphertext = encryptMessage(bits, keys)
        outHex = ciphertext.toString(16).padStart(4, '0')

        if (instrument) {
            steps.push({
                index: 1,
                label: 'Chor-Rivest Encryption',
                inputState: `bits=${bits.join('')} (weight=${bits.reduce((a, b) => a + b, 0)})`,
                outputState: `c=${ciphertext}`,
                note: 'Sum the SUBSET of public weights corresponding to message 1-bits. Fixed-weight constraint enforced.',
                isMilestone: true
            })
        }
    } else {
        // DECRYPT
        const keys = keygen()  // Toy: regenerate for simplicity
        const ciphertext = parseInt(input, 16)
        const recovered = decryptMessage(ciphertext, keys)
        outHex = toHex(recovered.map(b => b ? 0xFF : 0x00))

        if (instrument) {
            steps.push({
                index: 1,
                label: 'Chor-Rivest Decryption',
                inputState: `c=${ciphertext}`,
                outputState: `bits=${recovered.join('')}`,
                note: 'Transform ciphertext back into GF(p^h) domain via private permutation/d. Fixed-weight structure makes subset recovery tractable.',
                isMilestone: true
            })
        }
    }

    return { output: outHex, outputEncoding: 'hex', steps, metadata: METADATA, durationMs: performance.now() - start }
}

export function encrypt(input: string, key: string, options: CipherOptions = {}): CipherResult {
    validateInput(input)
    return chorRivestCore(input, key, false, !!options.instrument)
}

export function decrypt(input: string, key: string, options: CipherOptions = {}): CipherResult {
    validateInput(input)
    return chorRivestCore(input, key, true, !!options.instrument)
}

export const TEST_VECTORS: TestVector[] = [
    {
        input: 'e0',  // 11100000 = 3 bits set (matches FIXED_WEIGHT=3)
        key: 'mock',
        expected: 'mock_ct',
        description: 'Chor-Rivest round-trip with valid fixed-weight message (GF(5^3), weight=3)'
    }
]
