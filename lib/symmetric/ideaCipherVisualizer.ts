export interface IdeaCipherInput {
  plaintextHex: string
  keyHex: string
}

export interface IdeaRoundStep {
  round: number
  x1: string
  x2: string
  x3: string
  x4: string
  subkeys: string[]
  afterMultiply1: string
  afterAdd2: string
  afterAdd3: string
  afterMultiply4: string
  xor13: string
  xor24: string
  mix1: string
  mix2: string
  output: string[]
  note: string
}

export interface IdeaCipherResult {
  plaintextHex: string
  keyHex: string
  subkeys: string[]
  rounds: IdeaRoundStep[]
  outputTransform: {
    subkeys: string[]
    y1: string
    y2: string
    y3: string
    y4: string
  }
  ciphertextHex: string
  securityNotes: string[]
}

export const DEFAULT_IDEA_CIPHER_INPUT: IdeaCipherInput = {
  plaintextHex: "0001000200030004",
  keyHex: "00010002000300040005000600070008",
}

const MOD_ADD = 0x10000
const MOD_MUL = 0x10001

function cleanHex(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase()
}

function toHex16(value: number) {
  return (value & 0xffff).toString(16).toUpperCase().padStart(4, "0")
}

function validateHex(value: string, expectedLength: number, label: string) {
  const cleaned = cleanHex(value)
  if (!cleaned) throw new Error(`${label} is required.`)
  if (!/^[A-F0-9]+$/.test(cleaned)) throw new Error(`${label} must contain only hexadecimal characters.`)
  if (cleaned.length !== expectedLength) throw new Error(`${label} must be exactly ${expectedLength} hexadecimal characters.`)
  return cleaned
}

export function validateIdeaCipherInput(input: IdeaCipherInput): IdeaCipherInput {
  return {
    plaintextHex: validateHex(input.plaintextHex, 16, "Plaintext block"),
    keyHex: validateHex(input.keyHex, 32, "IDEA key"),
  }
}

export function splitHexWords(hex: string): number[] {
  const words: number[] = []
  for (let index = 0; index < hex.length; index += 4) words.push(Number.parseInt(hex.slice(index, index + 4), 16))
  return words
}

export function addMod16(left: number, right: number) {
  return (left + right) % MOD_ADD
}

export function multiplyMod65537(left: number, right: number) {
  const a = left === 0 ? MOD_MUL - 1 : left
  const b = right === 0 ? MOD_MUL - 1 : right
  const product = (a * b) % MOD_MUL
  return product === MOD_MUL - 1 ? 0 : product
}

export function rotateLeft128Bits(hexKey: string, shift: number) {
  const cleaned = validateHex(hexKey, 32, "IDEA key")
  const bits = BigInt(`0x${cleaned}`)
  const width = 128n
  const shiftBits = BigInt(shift % 128)
  const mask = (1n << width) - 1n
  const rotated = ((bits << shiftBits) & mask) | (bits >> (width - shiftBits))
  return rotated.toString(16).toUpperCase().padStart(32, "0")
}

export function generateIdeaSubkeys(keyHex: string): string[] {
  let currentKey = validateHex(keyHex, 32, "IDEA key")
  const subkeys: string[] = []
  while (subkeys.length < 52) {
    for (let index = 0; index < currentKey.length && subkeys.length < 52; index += 4) subkeys.push(currentKey.slice(index, index + 4))
    currentKey = rotateLeft128Bits(currentKey, 25)
  }
  return subkeys
}

function wordHexes(words: number[]) { return words.map(toHex16) }

export function runIdeaCipherVisualization(rawInput: IdeaCipherInput): IdeaCipherResult {
  const input = validateIdeaCipherInput(rawInput)
  const subkeys = generateIdeaSubkeys(input.keyHex)
  let [x1, x2, x3, x4] = splitHexWords(input.plaintextHex)
  const rounds: IdeaRoundStep[] = []

  for (let round = 0; round < 8; round += 1) {
    const keys = subkeys.slice(round * 6, round * 6 + 6).map((value) => Number.parseInt(value, 16))
    const before = [x1, x2, x3, x4]
    const afterMultiply1 = multiplyMod65537(x1, keys[0])
    const afterAdd2 = addMod16(x2, keys[1])
    const afterAdd3 = addMod16(x3, keys[2])
    const afterMultiply4 = multiplyMod65537(x4, keys[3])
    const xor13 = afterMultiply1 ^ afterAdd3
    const xor24 = afterAdd2 ^ afterMultiply4
    const mix1 = multiplyMod65537(xor13, keys[4])
    const mix2 = addMod16(multiplyMod65537(addMod16(xor24, mix1), keys[5]), mix1)
    const mix3 = addMod16(xor24, mix1)
    x1 = afterMultiply1 ^ mix2
    x4 = afterMultiply4 ^ mix3
    const nextX2 = afterAdd3 ^ mix2
    const nextX3 = afterAdd2 ^ mix3
    x2 = nextX2
    x3 = nextX3
    rounds.push({
      round: round + 1,
      x1: toHex16(before[0]), x2: toHex16(before[1]), x3: toHex16(before[2]), x4: toHex16(before[3]),
      subkeys: subkeys.slice(round * 6, round * 6 + 6),
      afterMultiply1: toHex16(afterMultiply1), afterAdd2: toHex16(afterAdd2), afterAdd3: toHex16(afterAdd3), afterMultiply4: toHex16(afterMultiply4),
      xor13: toHex16(xor13), xor24: toHex16(xor24), mix1: toHex16(mix1), mix2: toHex16(mix2),
      output: wordHexes([x1, x2, x3, x4]),
      note: "IDEA combines modular multiplication, modular addition, and XOR. The middle two words are swapped between full rounds.",
    })
  }

  const finalKeys = subkeys.slice(48, 52).map((value) => Number.parseInt(value, 16))
  const y1 = multiplyMod65537(x1, finalKeys[0])
  const y2 = addMod16(x3, finalKeys[1])
  const y3 = addMod16(x2, finalKeys[2])
  const y4 = multiplyMod65537(x4, finalKeys[3])
  const ciphertextHex = wordHexes([y1, y2, y3, y4]).join("")
  return {
    plaintextHex: input.plaintextHex,
    keyHex: input.keyHex,
    subkeys,
    rounds,
    outputTransform: { subkeys: subkeys.slice(48, 52), y1: toHex16(y1), y2: toHex16(y2), y3: toHex16(y3), y4: toHex16(y4) },
    ciphertextHex,
    securityNotes: [
      "IDEA is a historical 64-bit block cipher with a 128-bit key.",
      "The visualizer focuses on the round structure and key schedule for education.",
      "Prefer modern authenticated encryption such as AES-GCM or ChaCha20-Poly1305 for new applications.",
      "Do not use educational visualizer output for production security decisions.",
    ],
  }
}

export function buildIdeaCipherManualChecklist(): string[] {
  return [
    "Open the IDEA Cipher Visualizer page.",
    "Confirm the default plaintext and key generate 52 subkeys.",
    "Confirm eight rounds and the final output transform are displayed.",
    "Click different rounds and confirm round details update.",
    "Change plaintext and confirm ciphertext changes.",
    "Change key and confirm subkeys and ciphertext change.",
    "Enter invalid hex and confirm friendly validation appears.",
    "Resize to mobile width and confirm cards and tables remain usable.",
  ]
}
