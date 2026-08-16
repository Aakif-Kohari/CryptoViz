/**
 * PBKDF2 educational trace helpers.
 *
 * The production PBKDF2 derivation remains worker-routed through
 * sharedCipherPool. This module provides a deliberately bounded,
 * exact mathematical micro-trace for the first few PBKDF2 rounds.
 *
 * PBKDF2 block derivation:
 *
 *   U1 = PRF(P, S || INT_32_BE(1))
 *   Uj = PRF(P, Uj-1)
 *   F  = U1 XOR U2 XOR ... XOR Uc
 *
 * The micro-trace is educational only and MUST NOT replace the
 * production PBKDF2 implementation.
 */

export type Pbkdf2Hash = 'SHA-256' | 'SHA-512'

export interface Pbkdf2StageStep {
  label: string
  detail: string
}

export interface Pbkdf2StageInput {
  passwordLength: number
  saltHex: string
  iterations: number
  hash: Pbkdf2Hash
  keyLength: number
}

export interface Pbkdf2MicroTraceStep {
  round: number
  label: string

  /**
   * Exact input supplied to HMAC.
   *
   * Round 1:
   *   S || INT_32_BE(1)
   *
   * Round 2+:
   *   U(previous round)
   */
  hmacInputHex: string

  /**
   * Exact HMAC output for this round.
   */
  uHex: string

  /**
   * Accumulator before XORing U into it.
   */
  accumulatorBeforeHex: string

  /**
   * Accumulator after XORing U into it.
   */
  accumulatorAfterHex: string

  /**
   * Byte indexes whose value changed as a result of:
   *
   *   accumulator XOR U
   */
  xorChangedBytes: number[]

  /**
   * Result of the XOR operation for every byte.
   *
   * This lets the UI render the XOR operation without
   * recalculating cryptographic state.
   */
  xorBytesHex: string
}

export interface Pbkdf2MicroTrace {
  passwordLength: number
  saltHex: string
  hash: Pbkdf2Hash
  sampleIterations: number
  steps: Pbkdf2MicroTraceStep[]
  finalAccumulatorHex: string
}

/**
 * OWASP PBKDF2 iteration guidance used by the educational UI.
 *
 * These values are annotations only. Production PBKDF2 validation
 * remains owned by the existing implementation.
 */
export const OWASP_MIN_ITERATIONS: Record<
  Pbkdf2Hash,
  number
> = {
  'SHA-256': 600_000,
  'SHA-512': 210_000,
}

/**
 * Illustrative GPU rate.
 *
 * This is deliberately NOT a benchmark of a particular GPU.
 *
 * It represents the educational model:
 *
 *   effective guesses/sec
 *     = baseline rate / iteration count
 */
export const DEMO_GPU_GUESSES_PER_SECOND_AT_ONE_ITERATION =
  1_000_000

const MAX_MICRO_TRACE_ITERATIONS = 5
const SECONDS_PER_YEAR = 60 * 60 * 24 * 365

function assertBrowserCrypto(): void {
  if (
    typeof crypto === 'undefined' ||
    !crypto.subtle
  ) {
    throw new Error(
      'Web Crypto API is unavailable in this environment.',
    )
  }
}

function normalizeHex(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, '')
    .toLowerCase()
}

function hexToBytes(hex: string): Uint8Array {
  const normalized = normalizeHex(hex)

  if (normalized.length % 2 !== 0) {
    throw new Error(
      'Salt hex must contain an even number of characters.',
    )
  }

  if (!/^[0-9a-f]*$/i.test(normalized)) {
    throw new Error(
      'Salt contains invalid hexadecimal characters.',
    )
  }

  const bytes = new Uint8Array(
    normalized.length / 2,
  )

  for (
    let index = 0;
    index < bytes.length;
    index += 1
  ) {
    bytes[index] = Number.parseInt(
      normalized.slice(index * 2, index * 2 + 2),
      16,
    )
  }

  return bytes
}

function bytesToHex(
  bytes: Uint8Array,
): string {
  let result = ''

  for (
    let index = 0;
    index < bytes.length;
    index += 1
  ) {
    result += bytes[index]
      .toString(16)
      .padStart(2, '0')
  }

  return result
}

function xorBytes(
  a: Uint8Array,
  b: Uint8Array,
): {
  result: Uint8Array
  changedBytes: number[]
} {
  if (a.length !== b.length) {
    throw new Error(
      'PBKDF2 XOR operands must have the same length.',
    )
  }

  const result = new Uint8Array(a.length)
  const changedBytes: number[] = []

  for (
    let index = 0;
    index < a.length;
    index += 1
  ) {
    const value = a[index] ^ b[index]

    result[index] = value

    if (value !== a[index]) {
      changedBytes.push(index)
    }
  }

  return {
    result,
    changedBytes,
  }
}

/**
 * Public deterministic XOR helper.
 *
 * Used by unit tests and by educational consumers that need to
 * demonstrate PBKDF2's accumulator operation.
 */
export function xorAccumulator(
  accumulator: Uint8Array,
  value: Uint8Array,
): Uint8Array {
  return xorBytes(accumulator, value).result
}

function createBlockIndex(
  index: number,
): Uint8Array {
  if (
    !Number.isInteger(index) ||
    index < 1 ||
    index > 0xffffffff
  ) {
    throw new Error(
      'PBKDF2 block index must be a positive 32-bit integer.',
    )
  }

  const block = new Uint8Array(4)

  block[0] = (index >>> 24) & 0xff
  block[1] = (index >>> 16) & 0xff
  block[2] = (index >>> 8) & 0xff
  block[3] = index & 0xff

  return block
}

function concatBytes(
  ...arrays: Uint8Array[]
): Uint8Array {
  const totalLength = arrays.reduce(
    (total, array) =>
      total + array.length,
    0,
  )

  const result = new Uint8Array(totalLength)

  let offset = 0

  for (const array of arrays) {
    result.set(array, offset)
    offset += array.length
  }

  return result
}

async function createHmacKey(
  password: string,
  hash: Pbkdf2Hash,
): Promise<CryptoKey> {
  assertBrowserCrypto()

  const passwordBytes =
    new TextEncoder().encode(password)

  return crypto.subtle.importKey(
    'raw',
    passwordBytes,
    {
      name: 'HMAC',
      hash: {
        name: hash,
      },
    },
    false,
    ['sign'],
  )
}

async function hmac(
  key: CryptoKey,
  input: Uint8Array,
): Promise<Uint8Array> {
  const result = await crypto.subtle.sign(
    'HMAC',
    key,
    input as BufferSource,
  )

  return new Uint8Array(result)
}

/**
 * Generates an exact, bounded PBKDF2 mathematical micro-trace.
 *
 * Default:
 *
 *   U1 = HMAC(P, S || 00000001)
 *   U2 = HMAC(P, U1)
 *   U3 = HMAC(P, U2)
 *   U4 = HMAC(P, U3)
 *   U5 = HMAC(P, U4)
 *
 * Accumulation:
 *
 *   A1 = U1
 *   A2 = A1 XOR U2
 *   A3 = A2 XOR U3
 *   A4 = A3 XOR U4
 *   A5 = A4 XOR U5
 *
 */
export async function generatePbkdf2MicroTrace(
  password: string,
  saltHex: string,
  sampleIterations = 5,
  hash: Pbkdf2Hash = 'SHA-256',
): Promise<Pbkdf2MicroTrace> {
  if (!Number.isInteger(sampleIterations)) {
    throw new Error(
      'Sample iterations must be an integer.',
    )
  }

  if (
    sampleIterations < 1 ||
    sampleIterations >
      MAX_MICRO_TRACE_ITERATIONS
  ) {
    throw new Error(
      `The PBKDF2 micro-trace supports between 1 and ${MAX_MICRO_TRACE_ITERATIONS} rounds.`,
    )
  }

  const normalizedSalt = normalizeHex(
    saltHex,
  )

  const salt = hexToBytes(normalizedSalt)
  const key = await createHmacKey(
    password,
    hash,
  )

  const steps: Pbkdf2MicroTraceStep[] = []

  let previousU: Uint8Array | undefined
  let accumulator: Uint8Array | undefined

  for (
    let round = 1;
    round <= sampleIterations;
    round += 1
  ) {
    const hmacInput =
      round === 1
        ? concatBytes(
            salt,
            createBlockIndex(1),
          )
        : previousU

    if (!hmacInput) {
      throw new Error(
        'PBKDF2 micro-trace state is invalid.',
      )
    }

    const u = await hmac(
      key,
      hmacInput,
    )

    const accumulatorBefore =
      accumulator
        ? new Uint8Array(accumulator)
        : new Uint8Array(u.length)

    let accumulatorAfter: Uint8Array
    let changedBytes: number[]

    if (!accumulator) {
      accumulatorAfter = new Uint8Array(u)

      changedBytes = Array.from(
        { length: u.length },
        (_, index) => index,
      )
    } else {
      const xorResult = xorBytes(
        accumulator,
        u,
      )

      accumulatorAfter =
        xorResult.result

      changedBytes =
        xorResult.changedBytes
    }

    steps.push({
      round,

      label:
        round === 1
          ? 'U1 — salt + block index'
          : `U${round} — previous U value`,

      hmacInputHex:
        bytesToHex(hmacInput),

      uHex: bytesToHex(u),

      accumulatorBeforeHex:
        bytesToHex(
          accumulatorBefore,
        ),

      accumulatorAfterHex:
        bytesToHex(
          accumulatorAfter,
        ),

      xorChangedBytes: changedBytes,

      xorBytesHex:
        bytesToHex(u),
    })

    previousU = u
    accumulator = accumulatorAfter
  }

  if (!accumulator) {
    throw new Error(
      'PBKDF2 micro-trace produced no accumulator.',
    )
  }

  return {
    passwordLength:
      password.length,

    saltHex:
      normalizedSalt,

    hash,

    sampleIterations,

    steps,

    finalAccumulatorHex:
      bytesToHex(accumulator),
  }
}

export function describePbkdf2Stages(
  input: Pbkdf2StageInput,
): Pbkdf2StageStep[] {
  const steps: Pbkdf2StageStep[] = []

  steps.push({
    label:
      'Import password as HMAC key',

    detail:
      `Password (${input.passwordLength} characters) becomes the HMAC key material used by every PBKDF2 round.`,
  })

  steps.push({
    label:
      'Build the first HMAC input',

    detail:
      `The salt ${input.saltHex} is concatenated with the 32-bit big-endian block index 00000001 before U1 is calculated. The salt ensures that the same password does not map to the same PBKDF2 output across records.`,
  })

  steps.push({
    label:
      `Chain ${input.iterations.toLocaleString()} HMAC-${input.hash} iterations`,

    detail:
      `U1 = HMAC(P, S || INT(1)). Every subsequent U value is HMAC(P, previous U), creating a deliberately expensive sequential work factor.`,
  })

  steps.push({
    label:
      'XOR every U value into F',

    detail:
      'The PBKDF2 block accumulator is F = U1 XOR U2 XOR ... XOR Uc. Each intermediate value contributes to the final derived block.',
  })

  const meetsOwasp =
    input.iterations >=
    OWASP_MIN_ITERATIONS[input.hash]

  steps.push({
    label:
      'Iteration count vs. OWASP guidance',

    detail: meetsOwasp
      ? `${input.iterations.toLocaleString()} meets or exceeds the OWASP recommendation for PBKDF2-HMAC-${input.hash}.`
      : `${input.iterations.toLocaleString()} is below the OWASP recommendation of ${OWASP_MIN_ITERATIONS[input.hash].toLocaleString()} for PBKDF2-HMAC-${input.hash}.`,
  })

  steps.push({
    label:
      'Truncate to requested key length',

    detail:
      `The derived PBKDF2 output is truncated to ${input.keyLength} bytes (${input.keyLength * 8} bits) for the requested downstream key size.`,
  })

  return steps
}

/**
 * Rough educational offline-cracking estimate.
 *
 * This is a linear teaching model:
 *
 *   effective guesses/sec =
 *     baseline guesses/sec / iterations
 *
 * It is NOT a real GPU benchmark.
 */
export function estimateOfflineCrackYears(
  iterations: number,
  keyspaceSize: number,
  gpuGuessesPerSecondAtOneIteration =
    DEMO_GPU_GUESSES_PER_SECOND_AT_ONE_ITERATION,
): number {
  const safeIterations =
    Number.isFinite(iterations)
      ? Math.max(iterations, 1)
      : 1

  const safeKeyspace =
    Number.isFinite(keyspaceSize)
      ? Math.max(keyspaceSize, 0)
      : 0

  const safeGpuRate =
    Number.isFinite(
      gpuGuessesPerSecondAtOneIteration,
    )
      ? Math.max(
          gpuGuessesPerSecondAtOneIteration,
          Number.EPSILON,
        )
      : DEMO_GPU_GUESSES_PER_SECOND_AT_ONE_ITERATION

  const effectiveGuessesPerSecond =
    safeGpuRate / safeIterations

  const secondsToExhaust =
    safeKeyspace /
    Math.max(
      effectiveGuessesPerSecond,
      Number.EPSILON,
    )

  return (
    secondsToExhaust /
    SECONDS_PER_YEAR
  )
}

export interface Pbkdf2CostComparison {
  iterations: number
  effectiveGuessesPerSecond: number
  relativeWorkFactor: number
  years: number
}

export function estimatePbkdf2CostComparison(
  iterations: number,
  keyspaceSize: number,
): Pbkdf2CostComparison {
  const safeIterations =
    Number.isFinite(iterations)
      ? Math.max(iterations, 1)
      : 1

  const effectiveGuessesPerSecond =
    DEMO_GPU_GUESSES_PER_SECOND_AT_ONE_ITERATION /
    safeIterations

  return {
    iterations:
      safeIterations,

    effectiveGuessesPerSecond,

    relativeWorkFactor:
      safeIterations,

    years:
      estimateOfflineCrackYears(
        safeIterations,
        keyspaceSize,
      ),
  }
}