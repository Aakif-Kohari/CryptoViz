/**
 * AEAD Utility helpers for authenticated encryption schemes (Ascon-128, ChaCha20-Poly1305, XChaCha20-Poly1305).
 * Provides padding, 64-bit little-endian length block formatting, and constant-time tag validation.
 */

export function pad16(length: number): Uint8Array {
  const remainder = length % 16;
  return remainder === 0 ? new Uint8Array(0) : new Uint8Array(16 - remainder);
}

export function pack64LE(value: number): Uint8Array {
  const out = new Uint8Array(8);
  let v = BigInt(value);
  for (let i = 0; i < 8; i++) {
    out[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return out;
}

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, curr) => acc + curr.length, 0);
  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    out.set(arr, offset);
    offset += arr.length;
  }
  return out;
}

export function formatAeadMacInput(aad: Uint8Array, ciphertext: Uint8Array): Uint8Array {
  return concatBytes(
    aad,
    pad16(aad.length),
    ciphertext,
    pad16(ciphertext.length),
    pack64LE(aad.length),
    pack64LE(ciphertext.length)
  );
}
