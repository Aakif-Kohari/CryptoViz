import { describe, expect, it } from "vitest";
import {
  assertSipHashKeyHex,
  buildSipHashBlocks,
  buildSipHashManualChecklist,
  calculateSipHash,
  getDefaultSipHashKey,
} from "../../../lib/hash/siphashVisualizer";
describe("SipHash visualizer utilities", () => {
  it("validates SipHash keys", () => {
    expect(assertSipHashKeyHex("000102030405060708090A0B0C0D0E0F")).toBe(
      "000102030405060708090A0B0C0D0E0F",
    );
    expect(() => assertSipHashKeyHex("")).toThrow(/required/i);
    expect(() => assertSipHashKeyHex("0011")).toThrow(/16 bytes/i);
    expect(() =>
      assertSipHashKeyHex("000102030405060708090A0B0C0D0E0Z"),
    ).toThrow(/hexadecimal/i);
  });
  it("builds the expected final block for an empty message", () => {
    expect(
      buildSipHashBlocks(new Uint8Array()).map((block) => block.toString(16)),
    ).toEqual(["0"]);
  });
  it("matches the SipHash-2-4 reference vector for empty input", () => {
    const result = calculateSipHash("", getDefaultSipHashKey());
    expect(result.outputHex).toBe("310E0EDD47DB6F72");
    expect(result.cRounds).toBe(2);
    expect(result.dRounds).toBe(4);
  });
  it("produces deterministic output and trace rows", () => {
    const first = calculateSipHash("CryptoViz", getDefaultSipHashKey());
    const second = calculateSipHash("CryptoViz", getDefaultSipHashKey());
    expect(first.outputHex).toBe(second.outputHex);
    expect(first.trace.length).toBeGreaterThan(5);
    expect(first.trace[0]).toMatchObject({ step: "initialization", round: 0 });
  });
  it("changes output when the key changes", () => {
    const first = calculateSipHash(
      "CryptoViz",
      "000102030405060708090A0B0C0D0E0F",
    );
    const second = calculateSipHash(
      "CryptoViz",
      "0F0E0D0C0B0A09080706050403020100",
    );
    expect(first.outputHex).not.toBe(second.outputHex);
  });
  it("supports educational round count controls", () => {
    const sip24 = calculateSipHash("CryptoViz", getDefaultSipHashKey(), {
      cRounds: 2,
      dRounds: 4,
    });
    const sip13 = calculateSipHash("CryptoViz", getDefaultSipHashKey(), {
      cRounds: 1,
      dRounds: 3,
    });
    expect(sip24.outputHex).not.toBe(sip13.outputHex);
    expect(() =>
      calculateSipHash("x", getDefaultSipHashKey(), { cRounds: 0 }),
    ).toThrow(/between 1 and 4/i);
    expect(() =>
      calculateSipHash("x", getDefaultSipHashKey(), { dRounds: 9 }),
    ).toThrow(/between 1 and 8/i);
  });
  it("builds manual testing checklist", () => {
    const checklist = buildSipHashManualChecklist();
    expect(checklist).toContain(
      "Change the message and confirm the hash output updates.",
    );
    expect(
      checklist.some((item) => item.includes("focused SipHash unit tests")),
    ).toBe(true);
  });
});
