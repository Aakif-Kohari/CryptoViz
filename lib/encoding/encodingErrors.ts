import { EncodingType, EncodingErrorDetail, FaultType, MojibakeResult, ByteInspectorItem } from './types';

/**
 * Detects structural and specification errors in an encoded string.
 */
export function detectEncodingErrors(input: string, encoding: EncodingType): EncodingErrorDetail[] {
  const errors: EncodingErrorDetail[] = [];
  if (!input) return errors;

  if (encoding === 'Hex') {
    const cleanHex = input.replace(/\s+/g, '');
    if (cleanHex.length % 2 !== 0) {
      errors.push({
        index: cleanHex.length - 1,
        invalidValue: cleanHex[cleanHex.length - 1],
        reason: 'Hex strings must contain an even number of characters (2 hex digits per byte).',
        severity: 'error'
      });
    }
    for (let i = 0; i < cleanHex.length; i++) {
      if (!/^[0-9a-fA-F]$/.test(cleanHex[i])) {
        errors.push({
          index: i,
          invalidValue: cleanHex[i],
          reason: `Illegal character '${cleanHex[i]}' is not a valid hex digit (0-9, A-F).`,
          severity: 'error'
        });
      }
    }
  } else if (encoding === 'Base64') {
    const cleanB64 = input.trim();
    const b64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!b64Regex.test(cleanB64)) {
      for (let i = 0; i < cleanB64.length; i++) {
        const char = cleanB64[i];
        if (!/^[A-Za-z0-9+/=]$/.test(char)) {
          errors.push({
            index: i,
            invalidValue: char,
            reason: `Illegal Base64 character '${char}'. Base64 only allows A-Z, a-z, 0-9, +, /, and padding =.`,
            severity: 'error'
          });
        } else if (char === '=' && i < cleanB64.length - 2) {
          errors.push({
            index: i,
            invalidValue: char,
            reason: 'Padding symbol "=" appears in the middle of data instead of the trailing end.',
            severity: 'error'
          });
        }
      }
    }
    if (cleanB64.length % 4 !== 0 && !errors.some(e => e.reason.includes('Illegal Base64'))) {
      errors.push({
        index: cleanB64.length - 1,
        invalidValue: cleanB64.slice(-1),
        reason: `Base64 string length (${cleanB64.length}) is not a multiple of 4. Missing padding '=' characters.`,
        severity: 'error'
      });
    }
  } else if (encoding === 'ASCII') {
    for (let i = 0; i < input.length; i++) {
      const code = input.charCodeAt(i);
      if (code > 127) {
        errors.push({
          index: i,
          invalidValue: input[i],
          reason: `Character '${input[i]}' (code 0x${code.toString(16).toUpperCase()}) exceeds 7-bit ASCII range (0-127).`,
          severity: 'error'
        });
      }
    }
  } else if (encoding === 'URL-Encoding') {
    for (let i = 0; i < input.length; i++) {
      if (input[i] === '%') {
        const hexSub = input.slice(i + 1, i + 3);
        if (hexSub.length < 2 || !/^[0-9a-fA-F]{2}$/.test(hexSub)) {
          errors.push({
            index: i,
            invalidValue: input.slice(i, i + 3),
            reason: `Malformed percent-encoded sequence '%${hexSub}'. Must be followed by two hexadecimal digits.`,
            severity: 'error'
          });
        }
      }
    }
  }

  return errors;
}

/**
 * Injects deliberate encoding faults into a valid string.
 */
export function injectEncodingFault(input: string, encoding: EncodingType, fault: FaultType): { corrupted: string; explanation: string } {
  if (fault === 'INVALID_CHAR') {
    if (encoding === 'Hex') {
      const pos = Math.floor(input.length / 2);
      const corrupted = input.slice(0, pos) + 'Z' + input.slice(pos + 1);
      return { corrupted, explanation: 'Injected non-hex character "Z" into the hex sequence.' };
    }
    if (encoding === 'Base64') {
      const pos = Math.floor(input.length / 2);
      const corrupted = input.slice(0, pos) + '!' + input.slice(pos + 1);
      return { corrupted, explanation: 'Injected non-Base64 symbol "!" into the encoded string.' };
    }
    const corrupted = input + 'ñ';
    return { corrupted, explanation: 'Injected high-range character "ñ" (byte 0xF1) into strict ASCII.' };
  }

  if (fault === 'TRUNCATED_SEQUENCE') {
    if (encoding === 'UTF-8') {
      // Create a string with a 3-byte character like Euro '€' (0xE2 0x82 0xAC) truncated
      const _corrupted = 'Crypto€'.slice(0, -1); // Euro sign partially truncated
      return { corrupted: 'Crypto\xE2\x82', explanation: 'Truncated 3-byte UTF-8 sequence for "€" mid-way (0xE2 0x82 missing lead byte).' };
    }
    const corrupted = input.slice(0, Math.max(1, input.length - 1));
    return { corrupted, explanation: 'Truncated string, dropping the final byte or character.' };
  }

  if (fault === 'PADDING_CORRUPTION') {
    if (encoding === 'Base64') {
      // Remove or change padding '=' to 'X'
      const corrupted = input.endsWith('=') ? input.replace(/=/g, 'A') : input + '=X';
      return { corrupted, explanation: 'Corrupted Base64 padding characters at end of string.' };
    }
  }

  if (fault === 'ODD_LENGTH_HEX') {
    const corrupted = input.length % 2 !== 0 ? input : input.slice(0, -1);
    return { corrupted, explanation: 'Produced an odd-length Hex string (nibbles without paired byte).' };
  }

  if (fault === 'MALFORMED_URL_PERCENT') {
    const corrupted = input + '%2';
    return { corrupted, explanation: 'Appended incomplete percent sequence "%2" missing second hex nibble.' };
  }

  return { corrupted: input, explanation: 'No fault injected.' };
}

/**
 * Simulates Mojibake character set mismatches (e.g. UTF-8 read as ISO-8859-1 / Windows-1252).
 */
export function simulateMojibake(text: string, _sourceEncoding: string = 'UTF-8', targetEncoding: string = 'ISO-8859-1'): MojibakeResult {
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(text);
  const hexBytes = Array.from(utf8Bytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

  // Convert raw UTF-8 bytes to ISO-8859-1 characters (1-to-1 byte to char code)
  const mojibakeChars = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join('');

  return {
    originalText: text,
    encodedBytesHex: hexBytes,
    interpretedText: mojibakeChars,
    explanation: `Original UTF-8 text "${text}" was encoded into bytes [${hexBytes}]. When decoded as ${targetEncoding}, each byte was interpreted directly as a latin-1 code point, resulting in Mojibake: "${mojibakeChars}".`
  };
}

/**
 * Attempts to automatically repair common encoding errors.
 */
export function autoFixEncodingError(input: string, encoding: EncodingType): string {
  if (encoding === 'Hex') {
    let clean = input.replace(/[^0-9a-fA-F]/g, '');
    if (clean.length % 2 !== 0) {
      clean = clean.slice(0, -1); // drop trailing un-paired nibble
    }
    return clean;
  }
  if (encoding === 'Base64') {
    let clean = input.replace(/[^A-Za-z0-9+/=]/g, '');
    clean = clean.replace(/=/g, ''); // remove internal equals
    const rem = clean.length % 4;
    if (rem === 2) clean += '==';
    else if (rem === 3) clean += '=';
    else if (rem === 1) clean = clean.slice(0, -1);
    return clean;
  }
  if (encoding === 'ASCII') {
    return input.replace(/[^\x00-\x7F]/g, '?');
  }
  if (encoding === 'URL-Encoding') {
    return encodeURIComponent(input);
  }
  return input;
}

/**
 * Builds a byte-by-byte visualizer inspect dataset.
 */
export function buildByteInspector(input: string, encoding: EncodingType): ByteInspectorItem[] {
  const items: ByteInspectorItem[] = [];
  const errors = detectEncodingErrors(input, encoding);

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const code = char.charCodeAt(0);
    const err = errors.find(e => e.index === i);

    items.push({
      index: i,
      hex: code.toString(16).padStart(2, '0').toUpperCase(),
      binary: code.toString(2).padStart(8, '0'),
      char: char === ' ' ? '␣' : char,
      isError: Boolean(err),
      errorMessage: err?.reason
    });
  }

  return items;
}
