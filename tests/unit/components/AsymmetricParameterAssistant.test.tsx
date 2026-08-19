
import { describe, expect, it } from "vitest"
import {
  CURVE_PRESETS,
  isProbablePrime,
  pointOnCurve,
  primitiveRootCheck,
  validatePrimePair,
} from "../../../lib/cipher/asymmetric/parameterValidation"

describe("asymmetric parameter validation", () => {
  it("detects primes and composites", () => {
    expect(isProbablePrime(23n)).toBe(true)
    expect(isProbablePrime(25n)).toBe(false)
  })

  it("accepts 5 as a primitive root modulo 23", () => {
    expect(primitiveRootCheck(23n, 5n).state).toBe("valid")
  })

  it("rejects a non-generator", () => {
    expect(primitiveRootCheck(23n, 4n).state).toBe("invalid")
  })

  it("validates ordinary Paillier prime pairs", () => {
    const result = validatePrimePair(13n, 17n, false)
    expect(result.state).toBe("valid")
    expect(result.details?.some((x) => x.includes("221"))).toBe(true)
  })

  it("enforces Rabin Blum primes", () => {
    expect(validatePrimePair(19n, 23n, true).state).toBe("valid")
    expect(validatePrimePair(13n, 17n, true).state).toBe("invalid")
  })

  it("accepts the P-256 generator point", () => {
    const curve = CURVE_PRESETS[0]
    expect(pointOnCurve(curve.gx, curve.gy, curve)).toBe(true)
  })

  it("rejects an off-curve point", () => {
    const curve = CURVE_PRESETS[0]
    expect(pointOnCurve(curve.gx + 1n, curve.gy, curve)).toBe(false)
  })
})
