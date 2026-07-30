import { describe, it, expect } from 'vitest';
import {
  detectEncodingErrors,
  injectEncodingFault,
  simulateMojibake,
  autoFixEncodingError,
  buildByteInspector,
} from '@/lib/encoding/encodingErrors';

describe('Encoding Error Detection & Manipulation', () => {
  it('detects invalid hex characters and odd-length hex strings', () => {
    const errors1 = detectEncodingErrors('48656C6C6F!', 'Hex');
    expect(errors1.length).toBeGreaterThan(0);
    expect(errors1.some(e => e.reason.includes('Illegal character'))).toBe(true);

    const errors2 = detectEncodingErrors('48656C6C6', 'Hex');
    expect(errors2.some(e => e.reason.includes('even number'))).toBe(true);
  });

  it('detects Base64 illegal characters and padding errors', () => {
    const errors = detectEncodingErrors('SGVsbG8s!World', 'Base64');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.reason.includes('Illegal Base64'))).toBe(true);
  });

  it('injects deliberate faults into valid strings', () => {
    const faultRes = injectEncodingFault('SGVsbG8=', 'Base64', 'INVALID_CHAR');
    expect(faultRes.corrupted).toContain('!');
  });

  it('simulates Mojibake character set mismatch', () => {
    const res = simulateMojibake('Café');
    expect(res.interpretedText).not.toBe('Café');
    expect(res.encodedBytesHex.length).toBeGreaterThan(0);
  });

  it('auto-fixes corrupt hex and base64 strings', () => {
    const fixedHex = autoFixEncodingError('48656C6C6F!Z', 'Hex');
    expect(fixedHex).toBe('48656C6C6F');

    const fixedB64 = autoFixEncodingError('SGVsbG8', 'Base64');
    expect(fixedB64.endsWith('=')).toBe(true);
  });

  it('builds byte inspector dataset', () => {
    const items = buildByteInspector('ABC', 'ASCII');
    expect(items.length).toBe(3);
    expect(items[0].hex).toBe('41');
  });
});
