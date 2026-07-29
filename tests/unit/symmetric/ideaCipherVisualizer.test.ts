import { describe, expect, it } from "vitest"
import {
  DEFAULT_IDEA_CIPHER_INPUT,
  addMod16,
  buildIdeaCipherManualChecklist,
  generateIdeaSubkeys,
  multiplyMod65537,
  rotateLeft128Bits,
  runIdeaCipherVisualization,
  splitHexWords,
  validateIdeaCipherInput,
} from "../../../lib/symmetric/ideaCipherVisualizer"

describe("IDEA cipher visualizer utilities", () => {
  it("validates IDEA input", () => {
    expect(validateIdeaCipherInput(DEFAULT_IDEA_CIPHER_INPUT)).toMatchObject({ plaintextHex: "0001000200030004", keyHex: "00010002000300040005000600070008" })
    expect(() => validateIdeaCipherInput({ ...DEFAULT_IDEA_CIPHER_INPUT, plaintextHex: "xyz" })).toThrow(/hexadecimal/i)
    expect(() => validateIdeaCipherInput({ ...DEFAULT_IDEA_CIPHER_INPUT, keyHex: "0001" })).toThrow(/32 hexadecimal/i)
  })
  it("splits hex words", () => { expect(splitHexWords("0001000200030004")).toEqual([1, 2, 3, 4]) })
  it("performs IDEA modular operations", () => { expect(addMod16(0xffff, 2)).toBe(1); expect(multiplyMod65537(1, 1)).toBe(1); expect(multiplyMod65537(0, 1)).toBe(0) })
  it("rotates 128-bit key material", () => { expect(rotateLeft128Bits("80000000000000000000000000000000", 1)).toBe("00000000000000000000000000000001") })
  it("generates 52 IDEA subkeys", () => {
    const subkeys = generateIdeaSubkeys(DEFAULT_IDEA_CIPHER_INPUT.keyHex)
    expect(subkeys).toHaveLength(52)
    expect(subkeys.slice(0, 8)).toEqual(["0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008"])
  })
  it("runs eight rounds and output transform", () => {
    const result = runIdeaCipherVisualization(DEFAULT_IDEA_CIPHER_INPUT)
    expect(result.rounds).toHaveLength(8)
    expect(result.subkeys).toHaveLength(52)
    expect(result.outputTransform.subkeys).toHaveLength(4)
    expect(result.ciphertextHex).toMatch(/^[A-F0-9]{16}$/)
  })
  it("changes ciphertext when key or plaintext changes", () => {
    const first = runIdeaCipherVisualization(DEFAULT_IDEA_CIPHER_INPUT)
    const changedPlaintext = runIdeaCipherVisualization({ ...DEFAULT_IDEA_CIPHER_INPUT, plaintextHex: "0001000200030005" })
    const changedKey = runIdeaCipherVisualization({ ...DEFAULT_IDEA_CIPHER_INPUT, keyHex: "00010002000300040005000600070009" })
    expect(first.ciphertextHex).not.toBe(changedPlaintext.ciphertextHex)
    expect(first.ciphertextHex).not.toBe(changedKey.ciphertextHex)
  })
  it("builds manual testing checklist", () => {
    const checklist = buildIdeaCipherManualChecklist()
    expect(checklist[0]).toMatch(/open the idea cipher/i)
    expect(checklist).toContain("Confirm eight rounds and the final output transform are displayed.")
  })
})
