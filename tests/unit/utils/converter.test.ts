import { describe, expect, it } from "vitest";

import {
  asciiToBinary,
  asciiToHex,
  binaryToAscii,
  binaryToHex,
  hexToAscii,
  hexToBinary,
} from "@/lib/utils/converter";

describe("converter utilities", () => {
  it("converts ASCII to Hex", () => {
    expect(asciiToHex("ABC")).toBe("414243");
  });

  it("converts Hex to ASCII", () => {
    expect(hexToAscii("414243")).toBe("ABC");
  });

  it("converts ASCII to Binary", () => {
    expect(asciiToBinary("A")).toBe("01000001");
  });

  it("converts Binary to ASCII", () => {
    expect(binaryToAscii("01000001")).toBe("A");
  });

  it("converts Hex to Binary", () => {
    expect(hexToBinary("F")).toBe("1111");
  });

  it("converts Binary to Hex", () => {
    expect(binaryToHex("1111")).toBe("F");
  });

  it("throws on invalid hexadecimal", () => {
    expect(() => hexToAscii("ZZ")).toThrow();
  });

  it("throws on invalid binary", () => {
    expect(() => binaryToAscii("1234")).toThrow();
  });

  it("throws on invalid binary for hex conversion", () => {
    expect(() => binaryToHex("101")).toThrow();
  });

  it("throws on invalid hex for binary conversion", () => {
    expect(() => hexToBinary("XYZ")).toThrow();
  });
});