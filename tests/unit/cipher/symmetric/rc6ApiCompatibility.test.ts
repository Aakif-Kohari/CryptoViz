import { describe, expect, it } from "vitest";
import rc6Default, {
  RC6,
  decryptRc6,
  decryptRc6Block,
  encryptRc6,
  encryptRc6Block,
  generateRc6Subkeys,
  rc6,
  rc6Cipher,
  rc6ImplementationNotes,
  traceRc6Encryption,
} from "../../../../lib/cipher/symmetric/rc6";

const ZERO_KEY = "00000000000000000000000000000000";
const ZERO_BLOCK = "00000000000000000000000000000000";
const ZERO_VECTOR = "8FC3A53656B1F778C129DF4E9848A41E";

describe("RC6 API compatibility", () => {
  it("matches the RC6-32/20/16 published zero vector", () => {
    expect(encryptRc6Block(ZERO_BLOCK, ZERO_KEY)).toBe(ZERO_VECTOR);
    expect(decryptRc6Block(ZERO_VECTOR, ZERO_KEY)).toBe(ZERO_BLOCK);
  });

  it("keeps the legacy string encrypt/decrypt API", () => {
    expect(encryptRc6(ZERO_BLOCK, ZERO_KEY)).toBe(ZERO_VECTOR);
    expect(decryptRc6(ZERO_VECTOR, ZERO_KEY)).toBe(ZERO_BLOCK);
  });

  it("supports the object-based shared cipher API", () => {
    expect(
      encryptRc6({
        input: ZERO_BLOCK,
        key: ZERO_KEY,
        mode: "encrypt",
      }),
    ).toMatchObject({
      text: ZERO_VECTOR,
      output: ZERO_VECTOR,
      result: ZERO_VECTOR,
      mode: "encrypt",
      algorithm: "RC6",
      keyHex: ZERO_KEY,
      inputHex: ZERO_BLOCK,
    });

    expect(
      decryptRc6({
        input: ZERO_VECTOR,
        key: ZERO_KEY,
        mode: "decrypt",
      }),
    ).toMatchObject({
      text: ZERO_BLOCK,
      output: ZERO_BLOCK,
      result: ZERO_BLOCK,
      mode: "decrypt",
      algorithm: "RC6",
    });
  });

  it("exposes a common run helper", () => {
    expect(
      rc6({
        input: ZERO_BLOCK,
        key: ZERO_KEY,
        mode: "encrypt",
      }).result,
    ).toBe(ZERO_VECTOR);

    expect(
      rc6({
        input: ZERO_VECTOR,
        key: ZERO_KEY,
        mode: "decrypt",
      }).result,
    ).toBe(ZERO_BLOCK);
  });

  it("exposes registry-compatible metadata aliases", () => {
    expect(rc6Cipher).toMatchObject({
      name: "RC6",
      displayName: "RC6",
      blockSizeBits: 128,
      keySizeBits: [128, 192, 256],
    });

    expect(RC6).toBe(rc6Cipher);
    expect(rc6Default).toBe(rc6Cipher);
    expect(typeof rc6Cipher.encrypt).toBe("function");
    expect(typeof rc6Cipher.decrypt).toBe("function");
    expect(typeof rc6Cipher.run).toBe("function");
  });

  it("round trips non-zero plaintext and keys through both API styles", () => {
    const plaintext = "00112233445566778899AABBCCDDEEFF";
    const key = "000102030405060708090A0B0C0D0E0F";

    const legacyCiphertext = encryptRc6(plaintext, key) as string;
    expect(decryptRc6(legacyCiphertext, key)).toBe(plaintext);

    const objectCiphertext = rc6Cipher.encrypt({
      input: plaintext,
      key,
      mode: "encrypt",
    }) as ReturnType<typeof rc6>;

    expect(
      rc6Cipher.decrypt({
        input: objectCiphertext.result,
        key,
        mode: "decrypt",
      }),
    ).toMatchObject({
      result: plaintext,
    });
  });

  it("preserves trace output for visualizer integrations", () => {
    const trace = traceRc6Encryption(ZERO_BLOCK, ZERO_KEY);
    const wrapped = encryptRc6({
      input: ZERO_BLOCK,
      key: ZERO_KEY,
      mode: "encrypt",
    });

    expect(trace.roundTrace).toHaveLength(20);
    expect(trace.subkeys).toHaveLength(44);
    expect(trace.ciphertextHex).toBe(ZERO_VECTOR);
    expect((wrapped as ReturnType<typeof rc6>).trace?.roundTrace).toHaveLength(20);
  });

  it("generates expected subkey counts for default and custom rounds", () => {
    expect(generateRc6Subkeys(ZERO_KEY)).toHaveLength(44);
    expect(generateRc6Subkeys(ZERO_KEY, 12)).toHaveLength(28);
  });

  it("validates shared API input errors", () => {
    expect(() => encryptRc6(ZERO_BLOCK)).toThrow(/key is required/i);
    expect(() => rc6({ input: "", key: ZERO_KEY, mode: "encrypt" })).toThrow(/input text is required/i);
    expect(() => rc6({ input: "0011", key: ZERO_KEY, mode: "encrypt" })).toThrow(/32 hexadecimal/i);
    expect(() => rc6({ input: ZERO_BLOCK, key: "bad-key", mode: "encrypt" })).toThrow(/hexadecimal/i);
  });

  it("documents API compatibility notes", () => {
    expect(rc6ImplementationNotes().some((note) => note.includes("API-compatible"))).toBe(true);
    expect(rc6ImplementationNotes().some((note) => note.includes("object signature"))).toBe(true);
  });
});
