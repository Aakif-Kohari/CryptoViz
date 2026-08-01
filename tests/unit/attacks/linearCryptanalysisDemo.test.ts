import { describe, expect, it } from "vitest"
import {
  DEFAULT_LINEAR_CRYPTOANALYSIS_INPUT,
  buildLinearCryptanalysisManualChecklist,
  buildSboxTable,
  classifyBias,
  parity,
  parseNibble,
  runLinearCryptanalysisDemo,
  toyEncryptNibble,
  validateLinearCryptanalysisInput,
} from "../../../lib/attacks/linearCryptanalysisDemo"

describe("linear cryptanalysis demo utilities", () => {
  it("parses single hexadecimal nibbles", () => {
    expect(parseNibble("A", "Mask")).toBe(10)
    expect(parseNibble("0xf", "Mask")).toBe(15)
    expect(() => parseNibble("", "Mask")).toThrow(/required/i)
    expect(() => parseNibble("10", "Mask")).toThrow(/single hexadecimal nibble/i)
  })

  it("validates linear cryptanalysis input", () => {
    expect(validateLinearCryptanalysisInput(DEFAULT_LINEAR_CRYPTOANALYSIS_INPUT)).toMatchObject({
      plaintextMask: "5",
      ciphertextMask: "7",
      keyNibble: "A",
      sampleCount: 16,
    })

    expect(() =>
      validateLinearCryptanalysisInput({ ...DEFAULT_LINEAR_CRYPTOANALYSIS_INPUT, sampleCount: 3 }),
    ).toThrow(/between 4 and 64/i)
  })

  it("computes nibble parity", () => {
    expect(parity(0b0000)).toBe(0)
    expect(parity(0b0001)).toBe(1)
    expect(parity(0b1011)).toBe(1)
    expect(parity(0b1111)).toBe(0)
  })

  it("encrypts nibbles with the toy S-box", () => {
    expect(toyEncryptNibble(0x0, 0x0)).toBe(0x6)
    expect(toyEncryptNibble(0x0, 0xa)).toBe(0x3)
    expect(toyEncryptNibble(0x1, 0xa)).toBe(0xd)
  })

  it("builds the toy S-box table", () => {
    const table = buildSboxTable()

    expect(table).toHaveLength(16)
    expect(table[0]).toMatchObject({ input: "0", output: "6" })
  })

  it("classifies bias strength", () => {
    expect(classifyBias(0.01)).toBe("weak")
    expect(classifyBias(0.13)).toBe("moderate")
    expect(classifyBias(0.25)).toBe("strong")
  })

  it("runs the linear cryptanalysis demo", () => {
    const result = runLinearCryptanalysisDemo(DEFAULT_LINEAR_CRYPTOANALYSIS_INPUT)

    expect(result.samples).toHaveLength(16)
    expect(result.approximation.matches + result.approximation.misses).toBe(16)
    expect(result.approximation.probability).toBeGreaterThanOrEqual(0)
    expect(result.approximation.probability).toBeLessThanOrEqual(1)
    expect(result.sboxTable).toHaveLength(16)
  })

  it("changes result when masks change", () => {
    const first = runLinearCryptanalysisDemo(DEFAULT_LINEAR_CRYPTOANALYSIS_INPUT)
    const second = runLinearCryptanalysisDemo({
      ...DEFAULT_LINEAR_CRYPTOANALYSIS_INPUT,
      plaintextMask: "F",
      ciphertextMask: "1",
    })

    expect(first.approximation.matches).not.toBe(second.approximation.matches)
  })

  it("builds manual testing checklist", () => {
    const checklist = buildLinearCryptanalysisManualChecklist()

    expect(checklist[0]).toMatch(/open the linear cryptanalysis/i)
    expect(checklist).toContain(
      "Change plaintext and ciphertext masks and confirm matches, misses, and bias update.",
    )
  })
})
