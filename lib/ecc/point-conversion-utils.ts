/**
 * ECC Point Conversion Utilities for Weierstrass and Edwards curves.
 */

export interface EccPoint2D {
  x: bigint;
  y: bigint;
}

export function pointToHex(x: bigint, y: bigint, byteLength: number = 32): string {
  const xHex = x.toString(16).padStart(byteLength * 2, '0');
  const yHex = y.toString(16).padStart(byteLength * 2, '0');
  return `04${xHex}${yHex}`;
}

export function parseUncompressedPoint(uncompressedHex: string, byteLength: number = 32): EccPoint2D {
  const hex = uncompressedHex.replace(/^0x/i, '');
  if (!hex.startsWith('04') || hex.length !== 2 + byteLength * 4) {
    throw new Error(`Invalid uncompressed point hex length: expected ${2 + byteLength * 4} hex chars`);
  }
  const xHex = hex.substring(2, 2 + byteLength * 2);
  const yHex = hex.substring(2 + byteLength * 2);
  return {
    x: BigInt(`0x${xHex}`),
    y: BigInt(`0x${yHex}`),
  };
}
