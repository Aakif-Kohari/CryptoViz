export interface LinearCryptanalysisInput {
  plaintextMask: string
  ciphertextMask: string
  sampleCount: number
  keyNibble: string
}

export interface LinearSample {
  index: number
  plaintext: string
  ciphertext: string
  plaintextParity: number
  ciphertextParity: number
  relationHolds: boolean
  note: string
}

export interface LinearApproximation {
  plaintextMask: string
  ciphertextMask: string
  matches: number
  misses: number
  probability: number
  bias: number
  strength: "weak" | "moderate" | "strong"
}

export interface LinearCryptanalysisResult {
  input: LinearCryptanalysisInput
  samples: LinearSample[]
  approximation: LinearApproximation
  sboxTable: SboxRow[]
  explanation: string
  mitigationNotes: string[]
}

export interface SboxRow {
  input: string
  output: string
  inputBits: string
  outputBits: string
}

export const DEFAULT_LINEAR_CRYPTOANALYSIS_INPUT: LinearCryptanalysisInput = {
  plaintextMask: "5",
  ciphertextMask: "7",
  sampleCount: 16,
  keyNibble: "A",
}

export const TOY_SBOX = [0x6, 0x4, 0xc, 0x5, 0x0, 0x7, 0x2, 0xe, 0x1, 0xf, 0x3, 0xd, 0x8, 0xa, 0x9, 0xb]

function toHexNibble(value: number) {
  return (value & 0xf).toString(16).toUpperCase()
}

function toBits4(value: number) {
  return (value & 0xf).toString(2).padStart(4, "0")
}

export function parseNibble(value: string, label: string): number {
  const cleaned = value.trim().replace(/^0x/i, "")

  if (!cleaned) {
    throw new Error(`${label} is required.`)
  }

  if (!/^[a-fA-F0-9]$/.test(cleaned)) {
    throw new Error(`${label} must be a single hexadecimal nibble.`)
  }

  return Number.parseInt(cleaned, 16)
}

export function validateLinearCryptanalysisInput(
  input: LinearCryptanalysisInput,
): LinearCryptanalysisInput {
  parseNibble(input.plaintextMask, "Plaintext mask")
  parseNibble(input.ciphertextMask, "Ciphertext mask")
  parseNibble(input.keyNibble, "Toy key nibble")

  if (!Number.isInteger(input.sampleCount) || input.sampleCount < 4 || input.sampleCount > 64) {
    throw new Error("Sample count must be an integer between 4 and 64.")
  }

  return {
    plaintextMask: toHexNibble(parseNibble(input.plaintextMask, "Plaintext mask")),
    ciphertextMask: toHexNibble(parseNibble(input.ciphertextMask, "Ciphertext mask")),
    keyNibble: toHexNibble(parseNibble(input.keyNibble, "Toy key nibble")),
    sampleCount: input.sampleCount,
  }
}

export function parity(value: number): number {
  let current = value & 0xf
  let result = 0

  while (current > 0) {
    result ^= current & 1
    current >>>= 1
  }

  return result
}

export function toyEncryptNibble(plaintext: number, key: number): number {
  return TOY_SBOX[(plaintext ^ key) & 0xf]
}

export function buildSboxTable(): SboxRow[] {
  return TOY_SBOX.map((output, input) => ({
    input: toHexNibble(input),
    output: toHexNibble(output),
    inputBits: toBits4(input),
    outputBits: toBits4(output),
  }))
}

export function classifyBias(bias: number): LinearApproximation["strength"] {
  const magnitude = Math.abs(bias)

  if (magnitude >= 0.25) return "strong"
  if (magnitude >= 0.125) return "moderate"
  return "weak"
}

export function runLinearCryptanalysisDemo(
  rawInput: LinearCryptanalysisInput,
): LinearCryptanalysisResult {
  const input = validateLinearCryptanalysisInput(rawInput)
  const plaintextMask = parseNibble(input.plaintextMask, "Plaintext mask")
  const ciphertextMask = parseNibble(input.ciphertextMask, "Ciphertext mask")
  const key = parseNibble(input.keyNibble, "Toy key nibble")
  const samples: LinearSample[] = []

  for (let index = 0; index < input.sampleCount; index += 1) {
    const plaintext = index % 16
    const ciphertext = toyEncryptNibble(plaintext, key)
    const plaintextParity = parity(plaintext & plaintextMask)
    const ciphertextParity = parity(ciphertext & ciphertextMask)
    const relationHolds = plaintextParity === ciphertextParity

    samples.push({
      index,
      plaintext: toHexNibble(plaintext),
      ciphertext: toHexNibble(ciphertext),
      plaintextParity,
      ciphertextParity,
      relationHolds,
      note: relationHolds
        ? "The selected linear relation holds for this plaintext/ciphertext pair."
        : "The selected linear relation does not hold for this pair.",
    })
  }

  const matches = samples.filter((sample) => sample.relationHolds).length
  const misses = samples.length - matches
  const probability = matches / samples.length
  const bias = probability - 0.5

  return {
    input,
    samples,
    approximation: {
      plaintextMask: input.plaintextMask,
      ciphertextMask: input.ciphertextMask,
      matches,
      misses,
      probability,
      bias,
      strength: classifyBias(bias),
    },
    sboxTable: buildSboxTable(),
    explanation:
      "Linear cryptanalysis looks for linear relations between selected plaintext bits, ciphertext bits, and key-dependent intermediate bits that hold with probability noticeably different from 50%.",
    mitigationNotes: [
      "Strong S-boxes are designed to reduce exploitable linear bias.",
      "Multiple rounds diffuse local biases across the cipher state.",
      "Modern ciphers are evaluated against linear and differential cryptanalysis.",
      "This module uses a tiny toy cipher only for learning and must not be used as a real cipher.",
    ],
  }
}

export function buildLinearCryptanalysisManualChecklist(): string[] {
  return [
    "Open the Linear Cryptanalysis Demo page.",
    "Confirm the default masks render sample pairs and a bias summary.",
    "Change plaintext and ciphertext masks and confirm matches, misses, and bias update.",
    "Change the toy key nibble and confirm ciphertext samples update.",
    "Change sample count and confirm the sample table updates.",
    "Enter an invalid mask and confirm a friendly validation error appears.",
    "Confirm S-box table is visible with input and output nibbles.",
    "Resize to mobile width and confirm cards and tables remain usable.",
  ]
}
