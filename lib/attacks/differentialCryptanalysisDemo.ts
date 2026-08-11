export interface DifferentialCryptanalysisInput {
  inputDifference: string
  sampleCount: number
  keyNibble: string
}

export interface DifferentialPairSample {
  index: number
  plain1: string
  plain2: string
  diffPlain: string
  cipher1: string
  cipher2: string
  diffCipher: string
  matchesTarget: boolean
  note: string
}

export interface DifferentialStatistics {
  inputDifference: string
  targetOutputDifference: string
  matches: number
  total: number
  probability: number
  strength: "weak" | "moderate" | "strong"
}

export interface DifferentialCryptanalysisResult {
  input: DifferentialCryptanalysisInput
  samples: DifferentialPairSample[]
  statistics: DifferentialStatistics
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

export const DEFAULT_DIFFERENTIAL_CRYPTOANALYSIS_INPUT: DifferentialCryptanalysisInput = {
  inputDifference: "3",
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

export function validateDifferentialCryptanalysisInput(
  input: DifferentialCryptanalysisInput,
): DifferentialCryptanalysisInput {
  parseNibble(input.inputDifference, "Input difference")
  parseNibble(input.keyNibble, "Toy key nibble")

  if (!Number.isInteger(input.sampleCount) || input.sampleCount < 4 || input.sampleCount > 64) {
    throw new Error("Sample count must be an integer between 4 and 64.")
  }

  return {
    inputDifference: toHexNibble(parseNibble(input.inputDifference, "Input difference")),
    keyNibble: toHexNibble(parseNibble(input.keyNibble, "Toy key nibble")),
    sampleCount: input.sampleCount,
  }
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

export function classifyDifferentialStrength(probability: number): DifferentialStatistics["strength"] {
  if (probability >= 0.35) return "strong"
  if (probability >= 0.2) return "moderate"
  return "weak"
}

export function runDifferentialCryptanalysisDemo(
  rawInput: DifferentialCryptanalysisInput,
): DifferentialCryptanalysisResult {
  const input = validateDifferentialCryptanalysisInput(rawInput)
  const deltaIn = parseNibble(input.inputDifference, "Input difference")
  const key = parseNibble(input.keyNibble, "Toy key nibble")
  const samples: DifferentialPairSample[] = []

  // Target output difference determined dynamically or fixed for the S-Box characteristic demonstration
  // For pedagogical clarity in our toy cipher, we evaluate how often a given input difference leads to a predominant output difference
  // Let's compute actual output difference frequency across pairs
  const diffCounts: Record<number, number> = {}

  for (let index = 0; index < input.sampleCount; index += 1) {
    const plain1 = index % 16
    const plain2 = (plain1 ^ deltaIn) & 0xf
    const cipher1 = toyEncryptNibble(plain1, key)
    const cipher2 = toyEncryptNibble(plain2, key)
    const diffCipher = cipher1 ^ cipher2

    diffCounts[diffCipher] = (diffCounts[diffCipher] || 0) + 1
  }

  // Find most frequent output difference
  let targetDeltaOut = 0
  let maxCount = -1
  for (const [diffStr, count] of Object.entries(diffCounts)) {
    const diff = Number(diffStr)
    if (count > maxCount) {
      maxCount = count
      targetDeltaOut = diff
    }
  }

  for (let index = 0; index < input.sampleCount; index += 1) {
    const plain1 = index % 16
    const plain2 = (plain1 ^ deltaIn) & 0xf
    const cipher1 = toyEncryptNibble(plain1, key)
    const cipher2 = toyEncryptNibble(plain2, key)
    const diffCipher = cipher1 ^ cipher2
    const matchesTarget = diffCipher === targetDeltaOut

    samples.push({
      index,
      plain1: toHexNibble(plain1),
      plain2: toHexNibble(plain2),
      diffPlain: toHexNibble(deltaIn),
      cipher1: toHexNibble(cipher1),
      cipher2: toHexNibble(cipher2),
      diffCipher: toHexNibble(diffCipher),
      matchesTarget,
      note: matchesTarget
        ? "Pair yields the high-probability differential characteristic."
        : "Pair yields a different output difference.",
    })
  }

  const matches = samples.filter((s) => s.matchesTarget).length
  const probability = matches / samples.length

  return {
    input,
    samples,
    statistics: {
      inputDifference: input.inputDifference,
      targetOutputDifference: toHexNibble(targetDeltaOut),
      matches,
      total: samples.length,
      probability,
      strength: classifyDifferentialStrength(probability),
    },
    sboxTable: buildSboxTable(),
    explanation:
      "Differential cryptanalysis analyzes how differences in input plaintexts (ΔP) propagate into differences in ciphertexts (ΔC) through non-linear S-boxes, highlighting high-probability differential characteristics.",
    mitigationNotes: [
      "S-boxes with low differential uniformity mitigate differential cryptanalysis.",
      "Wider diffusion layers ensure that local differences spread quickly across all bits.",
      "Sufficient round scaling makes differential characteristics too improbable to exploit.",
      "This module uses a tiny toy cipher only for learning and must not be used as a real cipher.",
    ],
  }
}

export function buildDifferentialCryptanalysisManualChecklist(): string[] {
  return [
    "Open the Differential Cryptanalysis Demo page.",
    "Confirm default input difference renders sample pair differentials and probability statistics.",
    "Change the input difference and observe updated differential pairs and output differences.",
    "Change the toy key nibble and confirm ciphertext outputs update correctly.",
    "Change sample count and check the sample table length.",
    "Enter an invalid input difference and confirm the validation error is displayed.",
    "Confirm the S-box table displays correctly.",
    "Verify mobile responsiveness and layout structure.",
  ]
}
