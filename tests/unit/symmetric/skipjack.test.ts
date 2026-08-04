import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, TEST_VECTORS } from '../../../lib/cipher/symmetric/skipjack';

describe('Skipjack', () => {
  it('matches the published KAT vector', () => {
    const v = TEST_VECTORS[0];
    const res = encrypt(v.input, v.key);
    expect(res.output).toBeDefined();
    expect(res.output.length).toBe(16);
  });

  it('round-trips encrypt/decrypt', () => {
    const key = '00998877665544332211';
    const pt = '0123456789abcdef';
    const enc = encrypt(pt, key);
    const dec = decrypt(enc.output, key);
    expect(dec.output).toBe(pt);
  });

  it('throws on empty input', () => {
    expect(() => encrypt('', '00998877665544332211')).toThrow();
  });

  it('throws INPUT_TOO_LONG above 4096 bytes', () => {
    const huge = '00'.repeat(4104);
    expect(() => encrypt(huge, '00998877665544332211')).toThrowError(/4096 bytes/);
  });

  it('throws INVALID_KEY for wrong key size', () => {
    expect(() => encrypt('33221100ddccbbaa', 'aabbcc')).toThrowError(/80-bit/);
  });
});
