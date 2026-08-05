import { describe, expect, it } from "vitest";
import {
  decryptRc6Block,
  encryptRc6Block,
  generateRc6Subkeys,
  rc6ImplementationNotes,
  rotl32,
  rotr32,
  traceRc6Encryption,
} from "../../../../lib/cipher/symmetric/rc6";

describe("correct RC6 implementation", () => {
  it("matches the RC6-32/20/16 all-zero reference vector", () => {
    expect(
      encryptRc6Block(
        "00000000000000000000000000000000",
        "00000000000000000000000000000000",
      ),
    ).toBe("8FC3A53656B1F778C129DF4E9848A41E");
  });

  it("decrypts the all-zero reference vector", () => {
    expect(
      decryptRc6Block(
        "8FC3A53656B1F778C129DF4E9848A41E",
        "00000000000000000000000000000000",
      ),
    ).toBe("00000000000000000000000000000000");
  });

  it("round trips non-zero plaintext and key", () => {
    const plaintext = "00112233445566778899AABBCCDDEEFF";
    const key = "000102030405060708090A0B0C0D0E0F";

    const ciphertext = encryptRc6Block(plaintext, key);
    expect(ciphertext).toMatch(/^[A-F0-9]{32}$/);
    expect(decryptRc6Block(ciphertext, key)).toBe(plaintext);
  });

  it("supports different valid key lengths", () => {
    const plaintext = "00112233445566778899AABBCCDDEEFF";

    for (const key of [
      "0001020304050607",
      "000102030405060708090A0B0C0D0E0F",
      "000102030405060708090A0B0C0D0E0F1011121314151617",
    ]) {
      const ciphertext = encryptRc6Block(plaintext, key);
      expect(decryptRc6Block(ciphertext, key)).toBe(plaintext);
    }
  });

  it("generates the expected number of subkeys", () => {
    expect(generateRc6Subkeys("00000000000000000000000000000000")).toHaveLength(
      44,
    );
    expect(
      generateRc6Subkeys("00000000000000000000000000000000", 12),
    ).toHaveLength(28);
  });

  it("uses reversible 32-bit rotations", () => {
    const value = 0x12345678;

    expect(rotr32(rotl32(value, 7), 7)).toBe(value);
    expect(rotl32(value, 0)).toBe(value);
    expect(rotr32(value, 32)).toBe(value);
  });

  it("rejects invalid blocks and keys", () => {
    expect(() =>
      encryptRc6Block("", "00000000000000000000000000000000"),
    ).toThrow(/block is required/i);
    expect(() =>
      encryptRc6Block("0011", "00000000000000000000000000000000"),
    ).toThrow(/32 hexadecimal/i);
    expect(() =>
      encryptRc6Block("00000000000000000000000000000000", "bad-key"),
    ).toThrow(/hexadecimal/i);
    expect(() =>
      encryptRc6Block("00000000000000000000000000000000", "000"),
    ).toThrow(/whole number of bytes/i);
  });

  it("returns encryption trace for visualizer integration", () => {
    const trace = traceRc6Encryption(
      "00000000000000000000000000000000",
      "00000000000000000000000000000000",
    );

    expect(trace.roundTrace).toHaveLength(20);
    expect(trace.subkeys).toHaveLength(44);
    expect(trace.ciphertextHex).toBe("8FC3A53656B1F778C129DF4E9848A41E");
    expect(trace.roundTrace[0]).toMatchObject({
      round: 1,
    });
  });

  it("documents implementation notes", () => {
    expect(
      rc6ImplementationNotes().some((note) => note.includes("little-endian")),
    ).toBe(true);
    expect(
      rc6ImplementationNotes().some((note) => note.includes("Math.imul")),
    ).toBe(true);
  });
});
