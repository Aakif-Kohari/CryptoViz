import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  generatePbkdf2MicroTrace,
  xorAccumulator,
  estimatePbkdf2CostComparison,
  OWASP_MIN_ITERATIONS,
} from '@/lib/kdf/pbkdf2Trace'

function hexToBytes(
  hex: string,
): Uint8Array {
  const bytes = new Uint8Array(
    hex.length / 2,
  )

  for (
    let index = 0;
    index < bytes.length;
    index += 1
  ) {
    bytes[index] = Number.parseInt(
      hex.slice(
        index * 2,
        index * 2 + 2,
      ),
      16,
    )
  }

  return bytes
}

function bytesToHex(
  bytes: Uint8Array,
): string {
  return Array.from(bytes)
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
}

describe(
  'PBKDF2 micro-trace',
  () => {
    it(
      'generates five chained HMAC rounds',
      async () => {
        const trace =
          await generatePbkdf2MicroTrace(
            'password',
            '73616c74',
            5,
            'SHA-256',
          )

        expect(
          trace.steps,
        ).toHaveLength(5)

        expect(
          trace.steps[0].round,
        ).toBe(1)

        expect(
          trace.steps[4].round,
        ).toBe(5)

        expect(
          trace.steps[0].hmacInputHex.endsWith(
            '00000001',
          ),
        ).toBe(true)

        expect(
          trace.steps[1].hmacInputHex,
        ).toBe(
          trace.steps[0].uHex,
        )

        expect(
          trace.steps[2].hmacInputHex,
        ).toBe(
          trace.steps[1].uHex,
        )

        expect(
          trace.steps[3].hmacInputHex,
        ).toBe(
          trace.steps[2].uHex,
        )

        expect(
          trace.steps[4].hmacInputHex,
        ).toBe(
          trace.steps[3].uHex,
        )
      },
    )

    it(
      'produces the expected SHA-256 U1 output',
      async () => {
        /*
         * RFC 7914 provides:
         *
         * PBKDF2-HMAC-SHA-256
         * P = "passwd"
         * S = "salt"
         * c = 1
         * dkLen = 64
         *
         * DK begins:
         * 55ac046e56e3089fec1691c22544b605...
         *
         * For c=1, F = U1, so the first 32 bytes are the
         * SHA-256 U1 value.
         */
        const trace =
          await generatePbkdf2MicroTrace(
            'passwd',
            '73616c74',
            1,
            'SHA-256',
          )

        expect(
          trace.steps[0].uHex,
        ).toBe(
          '55ac046e56e3089fec1691c22544b605f94185216dde0465e68b9d57c20dacbc',
        )

        expect(
          trace.finalAccumulatorHex,
        ).toBe(
          trace.steps[0].uHex,
        )
      },
    )

    it(
      'XORs accumulator values byte-by-byte',
      () => {
        const accumulator =
          hexToBytes(
            '0f0f0f0f',
          )

        const value =
          hexToBytes(
            '00ff00ff',
          )

        const result =
          xorAccumulator(
            accumulator,
            value,
          )

        expect(
          bytesToHex(result),
        ).toBe(
          '0ff00ff0',
        )
      },
    )

    it(
      'accumulates every U value into the final block',
      async () => {
        const trace =
          await generatePbkdf2MicroTrace(
            'password',
            '73616c74',
            5,
            'SHA-256',
          )

        let expected =
          hexToBytes(
            trace.steps[0].uHex,
          )

        for (
          let index = 1;
          index <
          trace.steps.length;
          index += 1
        ) {
          expected =
            xorAccumulator(
              expected,
              hexToBytes(
                trace.steps[index].uHex,
              ),
            )
        }

        expect(
          bytesToHex(expected),
        ).toBe(
          trace.finalAccumulatorHex,
        )

        expect(
          trace.steps[4]
            .accumulatorAfterHex,
        ).toBe(
          trace.finalAccumulatorHex,
        )
      },
    )

    it(
      'exposes the OWASP iteration recommendations',
      () => {
        expect(
          OWASP_MIN_ITERATIONS[
            'SHA-256'
          ],
        ).toBe(600_000)

        expect(
          OWASP_MIN_ITERATIONS[
            'SHA-512'
          ],
        ).toBe(220_000)
      },
    )

    it(
      'updates the modeled cracking rate with iteration count',
      () => {
        const low =
          estimatePbkdf2CostComparison(
            10_000,
            2 ** 40,
          )

        const high =
          estimatePbkdf2CostComparison(
            600_000,
            2 ** 40,
          )

        expect(
          low.effectiveGuessesPerSecond,
        ).toBeGreaterThan(
          high.effectiveGuessesPerSecond,
        )

        expect(
          low.relativeWorkFactor,
        ).toBe(10_000)

        expect(
          high.relativeWorkFactor,
        ).toBe(600_000)

        expect(
          low.effectiveGuessesPerSecond /
            high.effectiveGuessesPerSecond,
        ).toBe(60)
      },
    )
  },
)