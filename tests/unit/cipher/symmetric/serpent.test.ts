import { describe, expect, it } from "vitest";
import {
  decryptSerpentBlock,
  encryptSerpentBlock,
  generateSerpentSubkeys,
  inverseLinearTransform,
  linearTransform,
  rotl32,
  rotr32,
  serpentImplementationNotes,
  traceSerpentEncryption,
} from "../../../../lib/cipher/symmetric/serpent";

describe("correct Serpent implementation", () => {
  it("matches a Serpent-128 zero-key zero-plaintext NESSIE regression vector", () => {
    expect(
      encryptSerpentBlock(
        "00000000000000000000000000000000",
        "00000000000000000000000000000000",
      ),
    ).toBe("36C2B777400B033C700E1B9516506EB6");
  });

  it("decrypts the Serpent-128 zero vector", () => {
    expect(
      decryptSerpentBlock(
        "36C2B777400B033C700E1B9516506EB6",
        "00000000000000000000000000000000",
      ),
    ).toBe("00000000000000000000000000000000");
  });

  it("round trips non-zero plaintext and 128-bit key", () => {
    const plaintext = "00112233445566778899AABBCCDDEEFF";
    const key = "000102030405060708090A0B0C0D0E0F";

    const ciphertext = encryptSerpentBlock(plaintext, key);
    expect(ciphertext).toMatch(/^[A-F0-9]{32}$/);
    expect(decryptSerpentBlock(ciphertext, key)).toBe(plaintext);
  });

  it("supports 128-bit, 192-bit, and 256-bit keys", () => {
    const plaintext = "00112233445566778899AABBCCDDEEFF";

    for (const key of [
      "000102030405060708090A0B0C0D0E0F",
      "000102030405060708090A0B0C0D0E0F1011121314151617",
      "000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F",
    ]) {
      const ciphertext = encryptSerpentBlock(plaintext, key);
      expect(decryptSerpentBlock(ciphertext, key)).toBe(plaintext);
    }
  });

  it("generates 33 128-bit subkeys", () => {
    const subkeys = generateSerpentSubkeys("00000000000000000000000000000000");

    expect(subkeys).toHaveLength(33);
    expect(subkeys.every((subkey) => subkey.length === 4)).toBe(true);
  });

  it("uses reversible rotations and linear transform", () => {
    const value = 0x12345678;
    const state = [0x01234567, 0x89abcdef, 0xfedcba98, 0x76543210];

    expect(rotr32(rotl32(value, 13), 13)).toBe(value);
    expect(inverseLinearTransform(linearTransform(state))).toEqual(state);
  });

  it("rejects invalid block and key values", () => {
    expect(() =>
      encryptSerpentBlock("", "00000000000000000000000000000000"),
    ).toThrow(/block is required/i);
    expect(() =>
      encryptSerpentBlock("0011", "00000000000000000000000000000000"),
    ).toThrow(/32 hexadecimal/i);
    expect(() =>
      encryptSerpentBlock("00000000000000000000000000000000", "bad-key"),
    ).toThrow(/hexadecimal/i);
    expect(() =>
      encryptSerpentBlock("00000000000000000000000000000000", "000102"),
    ).toThrow(/128, 192, or 256 bits/i);
  });

  it("returns encryption trace for visualizer integration", () => {
    const trace = traceSerpentEncryption(
      "00000000000000000000000000000000",
      "00000000000000000000000000000000",
    );

    expect(trace.roundTrace).toHaveLength(32);
    expect(trace.subkeys).toHaveLength(33);
    expect(trace.ciphertextHex).toBe(
      encryptSerpentBlock(trace.plaintextHex, trace.keyHex),
    );
    expect(trace.roundTrace[0]).toMatchObject({
      round: 1,
      sbox: 0,
    });
  });

  it("documents implementation notes", () => {
    expect(
      serpentImplementationNotes().some((note) =>
        note.includes("128/192/256-bit keys"),
      ),
    ).toBe(true);
    expect(
      serpentImplementationNotes().some((note) =>
        note.includes("33 128-bit round subkeys"),
      ),
    ).toBe(true);
  });
});
