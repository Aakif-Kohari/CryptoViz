import { describe, expect, it } from 'vitest'
import {
  AES_INV_S_BOX,
  AES_S_BOX,
  DES_S_BOXES,
  DES_S_BOX_COUNT,
  aesLookup,
  desLookup,
  getAesSBoxGrid,
  getDesSBoxGrid,
  parseByteInput,
} from '../../../lib/symmetric/sboxExplorer'

describe('AES S-box lookup', () => {
  it('has 256 entries in both the forward and inverse tables', () => {
    expect(AES_S_BOX).toHaveLength(256)
    expect(AES_INV_S_BOX).toHaveLength(256)
  })

  it('matches the known FIPS 197 example: 0x00 -> 0x63', () => {
    expect(aesLookup(0x00).output).toBe(0x63)
  })

  it('matches another known example: 0x53 -> 0xed', () => {
    expect(aesLookup(0x53).output).toBe(0xed)
  })

  it('derives row/col from the high/low nibble', () => {
    const result = aesLookup(0x53)
    expect(result.row).toBe(0x5)
    expect(result.col).toBe(0x3)
  })

  it('the inverse S-box undoes the forward S-box for every byte', () => {
    for (let b = 0; b < 256; b++) {
      const forward = aesLookup(b).output
      const back = aesLookup(forward, true).output
      expect(back).toBe(b)
    }
  })

  it('rejects out-of-range or non-integer input', () => {
    expect(() => aesLookup(-1)).toThrow(RangeError)
    expect(() => aesLookup(256)).toThrow(RangeError)
    expect(() => aesLookup(1.5)).toThrow(RangeError)
  })

  it('produces a 16x16 grid matching the flat table', () => {
    const grid = getAesSBoxGrid()
    expect(grid).toHaveLength(16)
    expect(grid[0]).toHaveLength(16)
    expect(grid[5][3]).toBe(AES_S_BOX[5 * 16 + 3])
  })
})

describe('DES S-box lookup', () => {
  it('has 8 boxes, each 4 rows by 16 columns', () => {
    expect(DES_S_BOXES).toHaveLength(8)
    expect(DES_S_BOX_COUNT).toBe(8)
    for (const box of DES_S_BOXES) {
      expect(box).toHaveLength(4)
      for (const row of box) {
        expect(row).toHaveLength(16)
      }
    }
  })

  it('matches the classic S1 example: 011011 -> row 1, col 13 -> 5', () => {
    // 0 1 1 0 1 1 -> outer bits "01" = row 1, inner bits "1101" = col 13
    const result = desLookup(0, 0b011011)
    expect(result.row).toBe(1)
    expect(result.col).toBe(13)
    expect(result.output).toBe(5)
  })

  it('matches S1 all-zero input: 000000 -> row 0, col 0 -> 14', () => {
    const result = desLookup(0, 0)
    expect(result.row).toBe(0)
    expect(result.col).toBe(0)
    expect(result.output).toBe(14)
  })

  it('rejects an out-of-range S-box index', () => {
    expect(() => desLookup(-1, 0)).toThrow(RangeError)
    expect(() => desLookup(8, 0)).toThrow(RangeError)
  })

  it('rejects a 6-bit input outside 0-63', () => {
    expect(() => desLookup(0, -1)).toThrow(RangeError)
    expect(() => desLookup(0, 64)).toThrow(RangeError)
  })

  it('returns a copy of the requested box as a grid', () => {
    const grid = getDesSBoxGrid(2)
    expect(grid).toEqual(DES_S_BOXES[2])
    grid[0][0] = 999
    expect(DES_S_BOXES[2][0][0]).not.toBe(999)
  })
})

describe('parseByteInput', () => {
  it('parses hex with 0x prefix', () => {
    expect(parseByteInput('0x1a')).toBe(26)
  })

  it('parses binary with 0b prefix', () => {
    expect(parseByteInput('0b101')).toBe(5)
  })

  it('parses bare hex digits containing a-f', () => {
    expect(parseByteInput('ab')).toBe(0xab)
  })

  it('parses plain decimal', () => {
    expect(parseByteInput('42')).toBe(42)
  })

  it('returns null for empty input', () => {
    expect(parseByteInput('  ')).toBeNull()
  })

  it('returns null for unparsable input', () => {
    expect(parseByteInput('not-a-number')).toBeNull()
  })
})
