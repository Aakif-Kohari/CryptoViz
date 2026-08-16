import { describe, expect, it } from 'vitest'
import {
  createEmptyGrid,
  createPresetGrid,
  generateNaorShamirShares,
  computeOpticalOverlay,
} from '../../../lib/crypto/naorShamir'

describe('Naor-Shamir Visual Cryptography', () => {
  it('creates empty and preset 32x32 grids correctly', () => {
    const empty = createEmptyGrid(32, 32)
    expect(empty.length).toBe(32)
    expect(empty[0].length).toBe(32)
    expect(empty.every((row) => row.every((val) => val === false))).toBe(true)

    const gridC = createPresetGrid('C', 32, 32)
    const filledCountC = gridC.flat().filter(Boolean).length
    expect(filledCountC).toBeGreaterThan(0)
  })

  it('expands each pixel to 2x2 subpixels (64x64 output for 32x32 input)', () => {
    const grid = createPresetGrid('C', 32, 32)
    const result = generateNaorShamirShares(grid)

    expect(result.subWidth).toBe(64)
    expect(result.subHeight).toBe(64)
    expect(result.share1.length).toBe(64)
    expect(result.share1[0].length).toBe(64)
    expect(result.share2.length).toBe(64)
    expect(result.share2[0].length).toBe(64)
  })

  it('guarantees 50% light transmission (2 black subpixels) per 2x2 block in each individual share', () => {
    const grid = createPresetGrid('lock', 32, 32)
    const result = generateNaorShamirShares(grid)

    for (let r = 0; r < 32; r++) {
      for (let c = 0; c < 32; c++) {
        let s1Blacks = 0
        let s2Blacks = 0
        for (let dr = 0; dr < 2; dr++) {
          for (let dc = 0; dc < 2; dc++) {
            if (result.share1[r * 2 + dr][c * 2 + dc]) s1Blacks++
            if (result.share2[r * 2 + dr][c * 2 + dc]) s2Blacks++
          }
        }
        // Perfect secrecy: every 2x2 block in Share 1 and Share 2 has exactly 2 black subpixels
        expect(s1Blacks).toBe(2)
        expect(s2Blacks).toBe(2)
      }
    }
  })

  it('reconstructs white pixels as 50% black subpixels and black pixels as 100% black subpixels', () => {
    const grid = createEmptyGrid(32, 32)
    grid[10][10] = false // White pixel
    grid[10][11] = true  // Black pixel

    const result = generateNaorShamirShares(grid)
    const overlay = computeOpticalOverlay(result.share1, result.share2)

    // White pixel (10, 10): 2 black subpixels out of 4
    let whiteSubpixelsBlack = 0
    for (let dr = 0; dr < 2; dr++) {
      for (let dc = 0; dc < 2; dc++) {
        if (overlay[10 * 2 + dr][10 * 2 + dc]) whiteSubpixelsBlack++
      }
    }
    expect(whiteSubpixelsBlack).toBe(2)

    // Black pixel (10, 11): 4 black subpixels out of 4
    let blackSubpixelsBlack = 0
    for (let dr = 0; dr < 2; dr++) {
      for (let dc = 0; dc < 2; dc++) {
        if (overlay[10 * 2 + dr][11 * 2 + dc]) blackSubpixelsBlack++
      }
    }
    expect(blackSubpixelsBlack).toBe(4)
  })
})
