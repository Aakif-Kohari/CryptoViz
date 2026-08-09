import { describe, expect, it } from "vitest";
import {
  PUBLISHED_CIPHER_VECTORS,
  assertPublishedVectorHex,
  buildCipherVectorAuditChecklist,
  buildCipherVectorAuditSummary,
  getVectorsForCipher,
  runPublishedVector,
  runPublishedVectorSuite,
  type CipherAdapter,
} from "../../../lib/cipher/symmetric/publishedCipherVectors";

const matchingAdapters: CipherAdapter[] = [
  { cipher: "NOEKEON", encryptBlock: () => "B1656851699E29FA24B70148503D2DFC" },
  {
    cipher: "PRESENT",
    encryptBlock: (_plain, _key, variant) =>
      variant === "PRESENT-128" ? "96DB702A2E6900AF" : "5579C1387B228445",
  },
  { cipher: "RC6", encryptBlock: () => "8FC3A53656B1F778C129DF4E9848A41E" },
  { cipher: "SEED", encryptBlock: () => "5EBAC6E0054E166819AFF1CC6D346CDB" },
  { cipher: "SIMON", encryptBlock: () => "44C8FC20B9DFA07A" },
  { cipher: "SPECK", encryptBlock: () => "8C6FA548454E028B" },
  { cipher: "TWOFISH", encryptBlock: () => "9F589F5CF6122C32B6BFEC2F2AE8C35A" },
];

describe("published cipher vector audit utilities", () => {
  it("contains all affected ciphers from issue 720", () => {
    expect(Array.from(new Set(PUBLISHED_CIPHER_VECTORS.map((vector) => vector.cipher)))).toEqual([
      "NOEKEON",
      "PRESENT",
      "RC6",
      "SEED",
      "SIMON",
      "SPECK",
      "TWOFISH",
    ]);
  });

  it("contains complete vector metadata", () => {
    expect(PUBLISHED_CIPHER_VECTORS).toHaveLength(8);
    expect(
      PUBLISHED_CIPHER_VECTORS.every(
        (vector) =>
          vector.keyHex &&
          vector.plaintextHex &&
          vector.ciphertextHex &&
          vector.source &&
          vector.notes,
      ),
    ).toBe(true);
  });

  it("normalizes and validates vector hex", () => {
    expect(assertPublishedVectorHex(" 00 aa FF ", "value")).toBe("00AAFF");
    expect(() => assertPublishedVectorHex("", "value")).toThrow(/required/i);
    expect(() => assertPublishedVectorHex("ABC", "value")).toThrow(/complete bytes/i);
    expect(() => assertPublishedVectorHex("ZZ", "value")).toThrow(/hexadecimal/i);
  });

  it("filters vectors by cipher", () => {
    expect(getVectorsForCipher("PRESENT")).toHaveLength(2);
    expect(getVectorsForCipher("RC6")).toHaveLength(1);
  });

  it("runs a single published vector with an adapter", () => {
    const vector = getVectorsForCipher("RC6")[0];
    const adapter = matchingAdapters.find((candidate) => candidate.cipher === "RC6")!;

    expect(runPublishedVector(adapter, vector)).toMatchObject({
      cipher: "RC6",
      passed: true,
      expected: "8FC3A53656B1F778C129DF4E9848A41E",
    });
  });

  it("runs the full published vector suite", () => {
    const results = runPublishedVectorSuite(matchingAdapters);
    const summary = buildCipherVectorAuditSummary(results);

    expect(results).toHaveLength(PUBLISHED_CIPHER_VECTORS.length);
    expect(summary).toEqual({
      total: PUBLISHED_CIPHER_VECTORS.length,
      passed: PUBLISHED_CIPHER_VECTORS.length,
      failed: 0,
      complete: true,
      failingCiphers: [],
    });
  });

  it("reports missing adapters as failures", () => {
    const results = runPublishedVectorSuite([]);
    const summary = buildCipherVectorAuditSummary(results);

    expect(summary.failed).toBe(PUBLISHED_CIPHER_VECTORS.length);
    expect(summary.failingCiphers).toContain("NOEKEON");
    expect(results[0].actual).toBe("MISSING_ADAPTER");
  });

  it("builds the manual audit checklist", () => {
    const checklist = buildCipherVectorAuditChecklist();

    expect(checklist[0]).toMatch(/published known-answer vector/i);
    expect(checklist).toContain("Confirm Twofish-128 matches the zero-key reference vector.");
  });
});
