import { describe, it, expect } from 'vitest'
import {
  constantTimeEqual,
  constantTimeHexEqual,
  constantTimeStringEqual,
  constantTimeSelect,
  constantTimeValidatePadding,
  constantTimeIntEqual,
  constantTimeInRange,
} from '@/lib/utils/constantTime'

describe('constantTimeEqual', () => {
  it('returns true for equal byte arrays', () => {
    const a = new Uint8Array([0x01, 0x02, 0x03, 0x04])
    const b = new Uint8Array([0x01, 0x02, 0x03, 0x04])
    expect(constantTimeEqual(a, b)).toBe(true)
  })

  it('returns false for different byte arrays', () => {
    const a = new Uint8Array([0x01, 0x02, 0x03, 0x04])
    const b = new Uint8Array([0x01, 0x02, 0x03, 0x05])
    expect(constantTimeEqual(a, b)).toBe(false)
  })

  it('returns false for different length arrays', () => {
    const a = new Uint8Array([0x01, 0x02, 0x03])
    const b = new Uint8Array([0x01, 0x02, 0x03, 0x04])
    expect(constantTimeEqual(a, b)).toBe(false)
  })

  it('returns true for empty arrays', () => {
    const a = new Uint8Array([])
    const b = new Uint8Array([])
    expect(constantTimeEqual(a, b)).toBe(true)
  })

  it('returns false when one array is empty', () => {
    const a = new Uint8Array([])
    const b = new Uint8Array([0x01])
    expect(constantTimeEqual(a, b)).toBe(false)
  })

  it('handles all zero bytes', () => {
    const a = new Uint8Array([0x00, 0x00, 0x00])
    const b = new Uint8Array([0x00, 0x00, 0x00])
    expect(constantTimeEqual(a, b)).toBe(true)
  })

  it('handles all 0xFF bytes', () => {
    const a = new Uint8Array([0xFF, 0xFF, 0xFF])
    const b = new Uint8Array([0xFF, 0xFF, 0xFF])
    expect(constantTimeEqual(a, b)).toBe(true)
  })

  it('detects single bit difference', () => {
    const a = new Uint8Array([0x01, 0x02, 0x03])
    const b = new Uint8Array([0x01, 0x02, 0x02]) // Last byte differs by 1 bit
    expect(constantTimeEqual(a, b)).toBe(false)
  })

  it('handles large arrays', () => {
    const a = new Uint8Array(1024).fill(0x42)
    const b = new Uint8Array(1024).fill(0x42)
    expect(constantTimeEqual(a, b)).toBe(true)
  })

  it('detects difference at end of large array', () => {
    const a = new Uint8Array(1024).fill(0x42)
    const b = new Uint8Array(1024).fill(0x42)
    b[1023] = 0x43
    expect(constantTimeEqual(a, b)).toBe(false)
  })
})

describe('constantTimeHexEqual', () => {
  it('returns true for equal hex strings', () => {
    expect(constantTimeHexEqual('1a2b3c4d', '1a2b3c4d')).toBe(true)
  })

  it('returns false for different hex strings', () => {
    expect(constantTimeHexEqual('1a2b3c4d', '1a2b3c4e')).toBe(false)
  })

  it('handles case sensitivity', () => {
    expect(constantTimeHexEqual('1A2B3C4D', '1a2b3c4d')).toBe(false)
  })

  it('ignores whitespace', () => {
    expect(constantTimeHexEqual('1a 2b 3c 4d', '1a2b3c4d')).toBe(true)
    expect(constantTimeHexEqual(' 1a2b3c4d ', '1a2b3c4d')).toBe(true)
  })

  it('returns false for different lengths', () => {
    expect(constantTimeHexEqual('1a2b3c', '1a2b3c4d')).toBe(false)
  })

  it('handles empty strings', () => {
    expect(constantTimeHexEqual('', '')).toBe(true)
  })

  it('handles odd-length hex strings', () => {
    expect(constantTimeHexEqual('abc', 'abc')).toBe(true)
    expect(constantTimeHexEqual('abc', 'abd')).toBe(false)
  })

  it('detects single character difference', () => {
    expect(constantTimeHexEqual('00000001', '00000000')).toBe(false)
  })
})

describe('constantTimeStringEqual', () => {
  it('returns true for equal strings', () => {
    expect(constantTimeStringEqual('hello', 'hello')).toBe(true)
  })

  it('returns false for different strings', () => {
    expect(constantTimeStringEqual('hello', 'hellp')).toBe(false)
  })

  it('returns false for different lengths', () => {
    expect(constantTimeStringEqual('hello', 'hello!')).toBe(false)
  })

  it('handles empty strings', () => {
    expect(constantTimeStringEqual('', '')).toBe(true)
  })

  it('handles strings with special characters', () => {
    expect(constantTimeStringEqual('test@123', 'test@123')).toBe(true)
    expect(constantTimeStringEqual('test@123', 'test#123')).toBe(false)
  })

  it('handles unicode characters', () => {
    expect(constantTimeStringEqual('café', 'café')).toBe(true)
    expect(constantTimeStringEqual('café', 'cafe')).toBe(false)
  })

  it('detects single character difference at start', () => {
    expect(constantTimeStringEqual('hello', 'aello')).toBe(false)
  })

  it('detects single character difference at end', () => {
    expect(constantTimeStringEqual('hello', 'hellp')).toBe(false)
  })
})

describe('constantTimeSelect', () => {
  it('returns a when condition is true', () => {
    expect(constantTimeSelect(true, 42, 100)).toBe(42)
  })

  it('returns b when condition is false', () => {
    expect(constantTimeSelect(false, 42, 100)).toBe(100)
  })

  it('handles zero values', () => {
    expect(constantTimeSelect(true, 0, 100)).toBe(0)
    expect(constantTimeSelect(false, 42, 0)).toBe(0)
  })

  it('handles negative values', () => {
    expect(constantTimeSelect(true, -5, 10)).toBe(-5)
    expect(constantTimeSelect(false, 10, -5)).toBe(-5)
  })

  it('handles large values', () => {
    // JavaScript uses 32-bit signed integers for bitwise operations
    // Values that fit in 32-bit signed range work correctly
    expect(constantTimeSelect(true, 2147483646, 0)).toBe(2147483646)
    expect(constantTimeSelect(false, 0, 2147483646)).toBe(2147483646)
  })
})

describe('constantTimeValidatePadding', () => {
  it('validates correct PKCS#7 padding', () => {
    // 4-byte block with padding 0x04 0x04 0x04 0x04
    const block = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x04, 0x04, 0x04, 0x04])
    expect(constantTimeValidatePadding(block)).toBe(true)
  })

  it('validates single byte padding', () => {
    const block = new Uint8Array([0x01, 0x02, 0x03, 0x01])
    expect(constantTimeValidatePadding(block)).toBe(true)
  })

  it('rejects invalid padding values', () => {
    // Last byte is 0x04 but not all padding bytes are 0x04
    const block = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x04, 0x04, 0x04, 0x03])
    expect(constantTimeValidatePadding(block)).toBe(false)
  })

  it('rejects padding value of zero', () => {
    const block = new Uint8Array([0x01, 0x02, 0x03, 0x00])
    expect(constantTimeValidatePadding(block)).toBe(false)
  })

  it('rejects padding value larger than block length', () => {
    const block = new Uint8Array([0x01, 0x02, 0x03, 0x05])
    expect(constantTimeValidatePadding(block)).toBe(false)
  })

  it('handles full block padding', () => {
    const block = new Uint8Array([0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10,
                                   0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10])
    expect(constantTimeValidatePadding(block)).toBe(true)
  })

  it('rejects when padding bytes don\'t match padding length', () => {
    const block = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x04, 0x04, 0x05, 0x04])
    expect(constantTimeValidatePadding(block)).toBe(false)
  })
})

describe('constantTimeIntEqual', () => {
  it('returns true for equal integers', () => {
    expect(constantTimeIntEqual(42, 42)).toBe(true)
  })

  it('returns false for different integers', () => {
    expect(constantTimeIntEqual(42, 43)).toBe(false)
  })

  it('handles zero', () => {
    expect(constantTimeIntEqual(0, 0)).toBe(true)
    expect(constantTimeIntEqual(0, 1)).toBe(false)
  })

  it('handles negative numbers', () => {
    expect(constantTimeIntEqual(-5, -5)).toBe(true)
    expect(constantTimeIntEqual(-5, 5)).toBe(false)
  })

  it('handles large numbers', () => {
    expect(constantTimeIntEqual(2147483647, 2147483647)).toBe(true)
    expect(constantTimeIntEqual(2147483647, 2147483646)).toBe(false)
  })
})

describe('constantTimeInRange', () => {
  it('returns true for value within range', () => {
    expect(constantTimeInRange(5, 1, 10)).toBe(true)
    expect(constantTimeInRange(1, 1, 10)).toBe(true)
    expect(constantTimeInRange(10, 1, 10)).toBe(true)
  })

  it('returns false for value below range', () => {
    expect(constantTimeInRange(0, 1, 10)).toBe(false)
    expect(constantTimeInRange(-5, 1, 10)).toBe(false)
  })

  it('returns false for value above range', () => {
    expect(constantTimeInRange(11, 1, 10)).toBe(false)
    expect(constantTimeInRange(100, 1, 10)).toBe(false)
  })

  it('handles negative ranges', () => {
    expect(constantTimeInRange(-5, -10, -1)).toBe(true)
    expect(constantTimeInRange(-11, -10, -1)).toBe(false)
    expect(constantTimeInRange(0, -10, -1)).toBe(false)
  })

  it('handles zero as boundary', () => {
    expect(constantTimeInRange(0, 0, 10)).toBe(true)
    expect(constantTimeInRange(5, 0, 10)).toBe(true)
    expect(constantTimeInRange(-1, 0, 10)).toBe(false)
  })

  it('handles single value range', () => {
    expect(constantTimeInRange(5, 5, 5)).toBe(true)
    expect(constantTimeInRange(4, 5, 5)).toBe(false)
    expect(constantTimeInRange(6, 5, 5)).toBe(false)
  })
})

describe('Edge cases and integration', () => {
  it('constantTimeEqual handles different byte order', () => {
    const a = new Uint8Array([0x01, 0x02])
    const b = new Uint8Array([0x02, 0x01])
    expect(constantTimeEqual(a, b)).toBe(false)
  })

  it('constantTimeHexEqual handles uppercase/lowercase difference', () => {
    expect(constantTimeHexEqual('ABCDEF', 'abcdef')).toBe(false)
  })

  it('constantTimeStringEqual handles very long strings', () => {
    const longA = 'a'.repeat(10000)
    const longB = 'a'.repeat(10000)
    const longC = 'a'.repeat(9999) + 'b'
    expect(constantTimeStringEqual(longA, longB)).toBe(true)
    expect(constantTimeStringEqual(longA, longC)).toBe(false)
  })

  it('constantTimeSelect preserves value identity', () => {
    const result1 = constantTimeSelect(true, 42, 100)
    const result2 = constantTimeSelect(true, 42, 100)
    expect(result1).toBe(result2)
  })

  it('constantTimeValidatePadding handles 16-byte block (AES size)', () => {
    const block = new Uint8Array(16)
    block[15] = 0x01 // Valid single byte padding
    expect(constantTimeValidatePadding(block)).toBe(true)
  })

  it('constantTimeInRange handles large ranges', () => {
    expect(constantTimeInRange(50000, 0, 100000)).toBe(true)
    expect(constantTimeInRange(100001, 0, 100000)).toBe(false)
  })
})
