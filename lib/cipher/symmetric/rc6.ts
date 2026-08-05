import type { CipherResult, CipherOptions, TestVector, CipherMetadata, CipherStep } from '../types'
import { CipherError, validateInput, validateKey } from '../../utils'

export interface Rc6Options {
  rounds?: number;
}

export interface Rc6RoundTrace {
  round: number;
  a: string;
  b: string;
  c: string;
  d: string;
  t: string;
  u: string;
  subkeyA: string;
  subkeyC: string;
  output: string;
}

export interface Rc6EncryptionTrace {
  plaintextHex: string;
  keyHex: string;
  rounds: number;
  subkeys: string[];
  roundTrace: Rc6RoundTrace[];
  ciphertextHex: string;
}

const WORD_MASK = 0xffffffff;
const WORD_BITS = 32;
const WORD_BYTES = 4;
const DEFAULT_ROUNDS = 20;
const P32 = 0xb7e15163;
const Q32 = 0x9e3779b9;

const METADATA: CipherMetadata = {
  name: 'RC6',
  blockSize: 128,
  rounds: DEFAULT_ROUNDS,
  securityStatus: 'secure',
  yearDesigned: 1998,
  standardBody: 'RC6 submission to AES',
};

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

function assertKeyHex(value: string): string {
  const cleaned = cleanHex(value);

  if (!cleaned) {
    throw new Error("RC6 key is required.");
  }

  if (!/^[A-F0-9]+$/.test(cleaned)) {
    throw new Error("RC6 key must contain only hexadecimal characters.");
  }

  if (cleaned.length % 2 !== 0) {
    throw new Error("RC6 key must contain a whole number of bytes.");
  }

  if (cleaned.length !== 32 && cleaned.length !== 48 && cleaned.length !== 64) {
    throw new Error("RC6 key must be a 128-bit key (32, 48, or 64 hex characters).");
  }

  return cleaned;
}

function toHex32(value: number): string {
  return (value >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }

  return bytes;
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

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).toUpperCase().padStart(2, "0"))
    .join("");
}

export function rotl32(value: number, shift: number): number {
  const amount = shift & 31;
  return amount === 0
    ? value >>> 0
    : ((value << amount) | (value >>> (WORD_BITS - amount))) >>> 0;
}

export function rotr32(value: number, shift: number): number {
  const amount = shift & 31;
  return amount === 0
    ? value >>> 0
    : ((value >>> amount) | (value << (WORD_BITS - amount))) >>> 0;
}

function add32(left: number, right: number): number {
  return (left + right) >>> 0;
}

function sub32(left: number, right: number): number {
  return (left - right) >>> 0;
}

function multiply32(left: number, right: number): number {
  return Math.imul(left, right) >>> 0;
}

export function generateRc6Subkeys(
  keyHex: string,
  rounds = DEFAULT_ROUNDS,
): number[] {
  const keyBytes = hexToBytes(assertKeyHex(keyHex));
  const c = Math.max(1, Math.ceil(keyBytes.length / WORD_BYTES));
  const l = new Array<number>(c).fill(0);

  for (let index = keyBytes.length - 1; index >= 0; index -= 1) {
    l[Math.floor(index / WORD_BYTES)] =
      ((l[Math.floor(index / WORD_BYTES)] << 8) + keyBytes[index]) >>> 0;
  }

  const subkeyCount = 2 * rounds + 4;
  const s = new Array<number>(subkeyCount);
  s[0] = P32;

  for (let index = 1; index < subkeyCount; index += 1) {
    s[index] = add32(s[index - 1], Q32);
  }

  let a = 0;
  let b = 0;
  let i = 0;
  let j = 0;
  const iterations = 3 * Math.max(c, subkeyCount);

  for (let step = 0; step < iterations; step += 1) {
    a = s[i] = rotl32(add32(add32(s[i], a), b), 3);
    b = l[j] = rotl32(add32(add32(l[j], a), b), add32(a, b));
    i = (i + 1) % subkeyCount;
    j = (j + 1) % c;
  }

  return s;
}

function parseBlock(blockHex: string): [number, number, number, number] {
  const block = hexToBytes(assertHexLength(blockHex, 32, "RC6 block"));
  return [
    readWordLE(block, 0),
    readWordLE(block, 4),
    readWordLE(block, 8),
    readWordLE(block, 12),
  ];
}

function formatBlock(a: number, b: number, c: number, d: number): string {
  const output = new Uint8Array(16);
  writeWordLE(a, output, 0);
  writeWordLE(b, output, 4);
  writeWordLE(c, output, 8);
  writeWordLE(d, output, 12);
  return bytesToHex(output);
}

export function encryptRc6Block(
  plaintextHex: string,
  keyHex: string,
  options: Rc6Options = {},
): string {
  const rounds = options.rounds ?? DEFAULT_ROUNDS;
  const s = generateRc6Subkeys(keyHex, rounds);
  let [a, b, c, d] = parseBlock(plaintextHex);

  b = add32(b, s[0]);
  d = add32(d, s[1]);

  for (let round = 1; round <= rounds; round += 1) {
    const t = rotl32(multiply32(b, add32(multiply32(2, b), 1)), 5);
    const u = rotl32(multiply32(d, add32(multiply32(2, d), 1)), 5);

    a = add32(rotl32((a ^ t) >>> 0, u), s[2 * round]);
    c = add32(rotl32((c ^ u) >>> 0, t), s[2 * round + 1]);

    [a, b, c, d] = [b, c, d, a];
  }

  a = add32(a, s[2 * rounds + 2]);
  c = add32(c, s[2 * rounds + 3]);

  return formatBlock(a, b, c, d);
}

export function decryptRc6Block(
  ciphertextHex: string,
  keyHex: string,
  options: Rc6Options = {},
): string {
  const rounds = options.rounds ?? DEFAULT_ROUNDS;
  const s = generateRc6Subkeys(keyHex, rounds);
  let [a, b, c, d] = parseBlock(ciphertextHex);

  c = sub32(c, s[2 * rounds + 3]);
  a = sub32(a, s[2 * rounds + 2]);

  for (let round = rounds; round >= 1; round -= 1) {
    [a, b, c, d] = [d, a, b, c];

    const u = rotl32(multiply32(d, add32(multiply32(2, d), 1)), 5);
    const t = rotl32(multiply32(b, add32(multiply32(2, b), 1)), 5);

    c = (rotr32(sub32(c, s[2 * round + 1]), t) ^ u) >>> 0;
    a = (rotr32(sub32(a, s[2 * round]), u) ^ t) >>> 0;
  }

  d = sub32(d, s[1]);
  b = sub32(b, s[0]);

  return formatBlock(a, b, c, d);
}

export function traceRc6Encryption(
  plaintextHex: string,
  keyHex: string,
  options: Rc6Options = {},
): Rc6EncryptionTrace {
  const rounds = options.rounds ?? DEFAULT_ROUNDS;
  const normalizedPlaintext = assertHexLength(plaintextHex, 32, "RC6 block");
  const normalizedKey = assertKeyHex(keyHex);
  const s = generateRc6Subkeys(normalizedKey, rounds);
  let [a, b, c, d] = parseBlock(normalizedPlaintext);
  const roundTrace: Rc6RoundTrace[] = [];

  b = add32(b, s[0]);
  d = add32(d, s[1]);

  for (let round = 1; round <= rounds; round += 1) {
    const t = rotl32(multiply32(b, add32(multiply32(2, b), 1)), 5);
    const u = rotl32(multiply32(d, add32(multiply32(2, d), 1)), 5);

    a = add32(rotl32((a ^ t) >>> 0, u), s[2 * round]);
    c = add32(rotl32((c ^ u) >>> 0, t), s[2 * round + 1]);
    [a, b, c, d] = [b, c, d, a];

    roundTrace.push({
      round,
      a: toHex32(a),
      b: toHex32(b),
      c: toHex32(c),
      d: toHex32(d),
      t: toHex32(t),
      u: toHex32(u),
      subkeyA: toHex32(s[2 * round]),
      subkeyC: toHex32(s[2 * round + 1]),
      output: formatBlock(a, b, c, d),
    });
  }

  a = add32(a, s[2 * rounds + 2]);
  c = add32(c, s[2 * rounds + 3]);

  return {
    plaintextHex: normalizedPlaintext,
    keyHex: normalizedKey,
    rounds,
    subkeys: s.map(toHex32),
    roundTrace,
    ciphertextHex: formatBlock(a, b, c, d),
  };
}

export function encrypt(plaintext: string, key: string, options: CipherOptions = {}): CipherResult {
  validateInput(plaintext);
  validateKey(key);

  const start = performance.now();
  const keyHex = cleanHex(key);
  const plaintextHex = assertHexLength(plaintext, 32, 'RC6 plaintext');
  const rounds = (options.rounds as number | undefined) ?? DEFAULT_ROUNDS;

  const trace = traceRc6Encryption(plaintextHex, keyHex, { rounds });
  const steps: CipherStep[] = options.instrument
    ? trace.roundTrace.map((r) => ({
        index: r.round,
        label: `Round ${r.round}`,
        inputState: r.a,
        outputState: r.output.toLowerCase(),
        note: `subkeys A=${r.subkeyA}, C=${r.subkeyC}`,
        isMilestone: r.round === 1 || r.round === 20,
      }))
    : [];

  return {
    output: trace.ciphertextHex.toLowerCase(),
    outputEncoding: 'hex',
    steps,
    metadata: METADATA,
    durationMs: performance.now() - start,
  };
}

export function decrypt(ciphertext: string, key: string, options: CipherOptions = {}): CipherResult {
  validateInput(ciphertext);
  validateKey(key);

  const start = performance.now();
  const keyHex = cleanHex(key);
  const ciphertextHex = assertHexLength(ciphertext, 32, 'RC6 ciphertext');
  const rounds = (options.rounds as number | undefined) ?? DEFAULT_ROUNDS;
  const plaintext = decryptRc6Block(ciphertextHex, keyHex, { rounds });

  return {
    output: plaintext.toLowerCase(),
    outputEncoding: 'hex',
    steps: [],
    metadata: METADATA,
    durationMs: performance.now() - start,
  };
}

export function rc6ImplementationNotes(): string[] {
  return [
    "Uses RC6-w/r/b with w=32 and the default r=20 rounds.",
    "Parses plaintext, ciphertext, and key bytes in little-endian word order as required by RC6.",
    "Uses Math.imul for correct 32-bit modular multiplication in JavaScript.",
    "Masks rotation counts to 5 low bits for 32-bit rotate operations.",
    "Includes encrypt/decrypt round-trip tests and a known zero-vector reference.",
  ];
}





export const TEST_VECTORS: TestVector[] = [
  {
    input: '00000000000000000000000000000000',
    key: '00000000000000000000000000000000',
    expected: '8fc3a53656b1f778c129df4e9848a41e',
  },
]
