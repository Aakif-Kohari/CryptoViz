import type { CipherResult, CipherStep, CipherOptions, TestVector, CipherMetadata } from '../types'
import { CipherError, validateInput, validateKey } from '../../utils'

export interface SerpentOptions {
  rounds?: number;
}

export interface SerpentRoundTrace {
  round: number;
  input: string;
  afterKeyMix: string;
  afterSbox: string;
  afterLinearTransform: string;
  subkey: string;
  sbox: number;
}

export interface SerpentEncryptionTrace {
  plaintextHex: string;
  keyHex: string;
  rounds: number;
  subkeys: string[];
  roundTrace: SerpentRoundTrace[];
  ciphertextHex: string;
}

const DEFAULT_ROUNDS = 32;
const PHI = 0x9e3779b9;

const SBOXES = [
  [3, 8, 15, 1, 10, 6, 5, 11, 14, 13, 4, 2, 7, 0, 9, 12],
  [15, 12, 2, 7, 9, 0, 5, 10, 1, 11, 14, 8, 6, 13, 3, 4],
  [8, 6, 7, 9, 3, 12, 10, 15, 13, 1, 14, 4, 0, 11, 5, 2],
  [0, 15, 11, 8, 12, 9, 6, 3, 13, 1, 2, 4, 10, 7, 5, 14],
  [1, 15, 8, 3, 12, 0, 11, 6, 2, 5, 4, 10, 9, 14, 7, 13],
  [15, 5, 2, 11, 4, 10, 9, 12, 0, 3, 14, 8, 13, 6, 7, 1],
  [7, 2, 12, 5, 8, 4, 6, 11, 14, 9, 1, 15, 13, 3, 10, 0],
  [1, 13, 15, 0, 14, 8, 2, 11, 7, 4, 12, 10, 9, 3, 5, 6],
] as const;

const INVERSE_SBOXES = SBOXES.map((box) => {
  const inverse = new Array<number>(16);
  box.forEach((value, index) => {
    inverse[value] = index;
  });
  return inverse;
});

function cleanHex(value: string): string {
  return value.trim().replace(/\s+/g, "").replace(/^0x/i, "").toUpperCase();
}

export function assertHexLength(
  value: string,
  expectedLength: number,
  label: string,
): string {
  const cleaned = cleanHex(value);

  if (!cleaned) {
    throw new Error(`${label} is required.`);
  }

  if (!/^[A-F0-9]+$/.test(cleaned)) {
    throw new Error(`${label} must contain only hexadecimal characters.`);
  }

  if (cleaned.length !== expectedLength) {
    throw new Error(
      `${label} must be exactly ${expectedLength} hexadecimal characters.`,
    );
  }

  return cleaned;
}

function assertSerpentKeyHex(value: string): string {
  const cleaned = cleanHex(value);

  if (!cleaned) {
    throw new Error("Serpent key is required.");
  }

  if (!/^[A-F0-9]+$/.test(cleaned)) {
    throw new Error("Serpent key must contain only hexadecimal characters.");
  }

  if (![32, 48, 64].includes(cleaned.length)) {
    throw new Error("Serpent key must be 128, 192, or 256 bits.");
  }

  return cleaned;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }

  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).toUpperCase().padStart(2, "0"))
    .join("");
}

function readWordLE(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)) >>>
    0
  );
}

function writeWordLE(value: number, output: Uint8Array, offset: number): void {
  output[offset] = value & 0xff;
  output[offset + 1] = (value >>> 8) & 0xff;
  output[offset + 2] = (value >>> 16) & 0xff;
  output[offset + 3] = (value >>> 24) & 0xff;
}

function wordsToHex(words: number[]): string {
  const output = new Uint8Array(16);
  writeWordLE(words[0], output, 0);
  writeWordLE(words[1], output, 4);
  writeWordLE(words[2], output, 8);
  writeWordLE(words[3], output, 12);
  return bytesToHex(output);
}

function blockToWords(blockHex: string): number[] {
  const bytes = hexToBytes(assertHexLength(blockHex, 32, "Serpent block"));
  return [
    readWordLE(bytes, 0),
    readWordLE(bytes, 4),
    readWordLE(bytes, 8),
    readWordLE(bytes, 12),
  ];
}

export function rotl32(value: number, shift: number): number {
  const amount = shift & 31;
  return amount === 0
    ? value >>> 0
    : ((value << amount) | (value >>> (32 - amount))) >>> 0;
}

export function rotr32(value: number, shift: number): number {
  const amount = shift & 31;
  return amount === 0
    ? value >>> 0
    : ((value >>> amount) | (value << (32 - amount))) >>> 0;
}

function xorWords(left: number[], right: number[]): number[] {
  return left.map((word, index) => (word ^ right[index]) >>> 0);
}

function applySboxToWords(words: number[], sboxIndex: number): number[] {
  const box = SBOXES[sboxIndex];
  return words.map((word) => {
    let result = 0;

    for (let nibble = 0; nibble < 8; nibble += 1) {
      const value = (word >>> (nibble * 4)) & 0xf;
      result |= box[value] << (nibble * 4);
    }

    return result >>> 0;
  });
}

function applyInverseSboxToWords(words: number[], sboxIndex: number): number[] {
  const box = INVERSE_SBOXES[sboxIndex];
  return words.map((word) => {
    let result = 0;

    for (let nibble = 0; nibble < 8; nibble += 1) {
      const value = (word >>> (nibble * 4)) & 0xf;
      result |= box[value] << (nibble * 4);
    }

    return result >>> 0;
  });
}

export function linearTransform(words: number[]): number[] {
  let [x0, x1, x2, x3] = words.map((word) => word >>> 0);

  x0 = rotl32(x0, 13);
  x2 = rotl32(x2, 3);
  x1 = (x1 ^ x0 ^ x2) >>> 0;
  x3 = (x3 ^ x2 ^ ((x0 << 3) >>> 0)) >>> 0;
  x1 = rotl32(x1, 1);
  x3 = rotl32(x3, 7);
  x0 = (x0 ^ x1 ^ x3) >>> 0;
  x2 = (x2 ^ x3 ^ ((x1 << 7) >>> 0)) >>> 0;
  x0 = rotl32(x0, 5);
  x2 = rotl32(x2, 22);

  return [x0, x1, x2, x3];
}

export function inverseLinearTransform(words: number[]): number[] {
  let [x0, x1, x2, x3] = words.map((word) => word >>> 0);

  x2 = rotr32(x2, 22);
  x0 = rotr32(x0, 5);
  x2 = (x2 ^ x3 ^ ((x1 << 7) >>> 0)) >>> 0;
  x0 = (x0 ^ x1 ^ x3) >>> 0;
  x3 = rotr32(x3, 7);
  x1 = rotr32(x1, 1);
  x3 = (x3 ^ x2 ^ ((x0 << 3) >>> 0)) >>> 0;
  x1 = (x1 ^ x0 ^ x2) >>> 0;
  x2 = rotr32(x2, 3);
  x0 = rotr32(x0, 13);

  return [x0, x1, x2, x3];
}

function padSerpentKey(keyHex: string): Uint8Array {
  const key = hexToBytes(assertSerpentKeyHex(keyHex));

  if (key.length === 32) {
    return key;
  }

  const padded = new Uint8Array(32);
  padded.set(key);
  padded[key.length] = 0x01;
  return padded;
}

export function generateSerpentSubkeys(keyHex: string): number[][] {
  const keyBytes = padSerpentKey(keyHex);
  const w = new Array<number>(140).fill(0);

  for (let index = 0; index < 8; index += 1) {
    w[index] = readWordLE(keyBytes, index * 4);
  }

  for (let index = 8; index < 140; index += 1) {
    w[index] = rotl32(
      (w[index - 8] ^
        w[index - 5] ^
        w[index - 3] ^
        w[index - 1] ^
        PHI ^
        (index - 8)) >>>
        0,
      11,
    );
  }

  const subkeys: number[][] = [];

  for (let round = 0; round < 33; round += 1) {
    const keyWords = [
      w[4 * round + 8],
      w[4 * round + 9],
      w[4 * round + 10],
      w[4 * round + 11],
    ];
    subkeys.push(applySboxToWords(keyWords, (3 - round) & 7));
  }

  return subkeys;
}

export function encryptSerpentBlock(
  plaintextHex: string,
  keyHex: string,
  options: SerpentOptions = {},
): string {
  const rounds = options.rounds ?? DEFAULT_ROUNDS;
  const subkeys = generateSerpentSubkeys(keyHex);
  let state = blockToWords(plaintextHex);

  for (let round = 0; round < rounds; round += 1) {
    state = xorWords(state, subkeys[round]);
    state = applySboxToWords(state, round & 7);

    if (round < rounds - 1) {
      state = linearTransform(state);
    } else {
      state = xorWords(state, subkeys[round + 1]);
    }
  }

  return wordsToHex(state);
}

export function decryptSerpentBlock(
  ciphertextHex: string,
  keyHex: string,
  options: SerpentOptions = {},
): string {
  const rounds = options.rounds ?? DEFAULT_ROUNDS;
  const subkeys = generateSerpentSubkeys(keyHex);
  let state = blockToWords(ciphertextHex);

  state = xorWords(state, subkeys[rounds]);

  for (let round = rounds - 1; round >= 0; round -= 1) {
    state = applyInverseSboxToWords(state, round & 7);
    state = xorWords(state, subkeys[round]);

    if (round > 0) {
      state = inverseLinearTransform(state);
    }
  }

  return wordsToHex(state);
}

export function traceSerpentEncryption(
  plaintextHex: string,
  keyHex: string,
  options: SerpentOptions = {},
): SerpentEncryptionTrace {
  const rounds = options.rounds ?? DEFAULT_ROUNDS;
  const normalizedPlaintext = assertHexLength(
    plaintextHex,
    32,
    "Serpent block",
  );
  const normalizedKey = assertSerpentKeyHex(keyHex);
  const subkeys = generateSerpentSubkeys(normalizedKey);
  let state = blockToWords(normalizedPlaintext);
  const roundTrace: SerpentRoundTrace[] = [];

  for (let round = 0; round < rounds; round += 1) {
    const input = wordsToHex(state);
    const afterKeyMixWords = xorWords(state, subkeys[round]);
    const afterSboxWords = applySboxToWords(afterKeyMixWords, round & 7);
    const afterLinearWords =
      round < rounds - 1
        ? linearTransform(afterSboxWords)
        : xorWords(afterSboxWords, subkeys[round + 1]);

    roundTrace.push({
      round: round + 1,
      input,
      afterKeyMix: wordsToHex(afterKeyMixWords),
      afterSbox: wordsToHex(afterSboxWords),
      afterLinearTransform: wordsToHex(afterLinearWords),
      subkey: wordsToHex(subkeys[round]),
      sbox: round & 7,
    });

    state = afterLinearWords;
  }

  return {
    plaintextHex: normalizedPlaintext,
    keyHex: normalizedKey,
    rounds,
    subkeys: subkeys.map(wordsToHex),
    roundTrace,
    ciphertextHex: wordsToHex(state),
  };
}

export function serpentImplementationNotes(): string[] {
  return [
    "Supports Serpent block encryption with 128-bit blocks and 128/192/256-bit keys.",
    "Pads short keys according to the Serpent key schedule rule before expanding to 256 bits.",
    "Uses 33 128-bit round subkeys for 32 rounds.",
    "Uses the Serpent S-box sequence and inverse S-box sequence for decryption.",
    "Includes reversible linear transform and inverse linear transform helpers.",
    "Includes encrypt/decrypt round-trip tests and reference-vector regression tests.",
  ];
}

const METADATA: CipherMetadata = {
  name: 'Serpent',
  keySize: 128,
  blockSize: 128,
  rounds: 32,
  securityStatus: 'secure',
  yearDesigned: 1998,
  standardBody: 'Anderson, Biham, Knudsen (AES finalist)',
}

export function encrypt(input: string, key: string, options: CipherOptions = {}): CipherResult {
  validateInput(input)
  const start = performance.now()
  const trace = traceSerpentEncryption(input, key, { rounds: (options as Record<string, unknown>)?.rounds as number ?? 32 })
  return {
    output: trace.ciphertextHex.toLowerCase(),
    outputEncoding: 'hex',
    steps: trace.roundTrace.map((r) => ({
      index: r.round,
      label: `Round ${r.round}`,
      inputState: r.input,
      outputState: r.afterLinearTransform.toLowerCase(),
      note: `S-Box ${r.sbox}, subkey ${r.subkey}`,
      isMilestone: r.round === 1 || r.round === 32,
    })),
    metadata: METADATA,
    durationMs: performance.now() - start,
  }
}

export function decrypt(input: string, key: string, options: CipherOptions = {}): CipherResult {
  validateInput(input)
  const start = performance.now()
  const outHex = decryptSerpentBlock(input, key, { rounds: (options as Record<string, unknown>)?.rounds as number ?? 32 })
  return {
    output: outHex.toLowerCase(),
    outputEncoding: 'hex',
    steps: [],
    metadata: METADATA,
    durationMs: performance.now() - start,
  }
}

export const TEST_VECTORS: TestVector[] = [
  {
    input: '00000000000000000000000000000000',
    key: '00000000000000000000000000000000',
    expected: 'fe0c08d498eacf8f104a2ebc08852b33',
  },
]
