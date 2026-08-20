/**
 * Naor-Shamir (2, 2) Visual Cryptography & Optical Secret Sharing Engine.
 * @see Naor, M., & Shamir, A. (1994). Visual Cryptography. EUROCRYPT '94.
 *
 * Expands each 1x1 binary pixel into a 2x2 subpixel pattern.
 * - White pixel (0): Share 1 and Share 2 receive IDENTICAL subpixel patterns.
 *   Superposition (Share 1 OR Share 2) yields 2 black subpixels out of 4 (50% light transmission).
 * - Black pixel (1): Share 1 and Share 2 receive COMPLEMENTARY subpixel patterns.
 *   Superposition (Share 1 OR Share 2) yields 4 black subpixels out of 4 (0% light transmission).
 */

export interface SubpixelShareResult {
  width: number
  height: number
  subWidth: number
  subHeight: number
  share1: boolean[][]
  share2: boolean[][]
}

export type GridPreset = 'C' | 'X' | 'lock' | 'grid'

export function createEmptyGrid(width = 32, height = 32): boolean[][] {
  return Array.from({ length: height }, () => Array(width).fill(false))
}

export function createPresetGrid(preset: GridPreset, width = 32, height = 32): boolean[][] {
  const grid = createEmptyGrid(width, height)
  const cx = Math.floor(width / 2)
  const cy = Math.floor(height / 2)

  if (preset === 'C') {
    for (let r = 6; r < 26; r++) {
      for (let c = 6; c < 26; c++) {
        const distFromCenter = Math.hypot(c - cx, r - cy)
        if (distFromCenter >= 6 && distFromCenter <= 11) {
          // Open jaw of 'C' on the right side
          if (c < cx + 4 || Math.abs(r - cy) > 5) {
            grid[r][c] = true
          }
        }
      }
    }
  } else if (preset === 'X') {
    for (let i = 4; i < 28; i++) {
      for (let w = -1; w <= 1; w++) {
        const c1 = i + w
        const c2 = width - 1 - i + w
        if (c1 >= 0 && c1 < width) grid[i][c1] = true
        if (c2 >= 0 && c2 < width) grid[i][c2] = true
      }
    }
  } else if (preset === 'lock') {
    // Shackle
    for (let r = 5; r < 14; r++) {
      for (let c = 10; c <= 21; c++) {
        if ((c <= 12 || c >= 19) || r === 5) {
          grid[r][c] = true
        }
      }
    }
    // Body
    for (let r = 14; r < 27; r++) {
      for (let c = 7; c < 25; c++) {
        grid[r][c] = true
      }
    }
  } else if (preset === 'grid') {
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if ((r % 4 === 0) || (c % 4 === 0)) {
          grid[r][c] = true
        }
      }
    }
  }

  return grid
}

/**
 * Encodes a 32x32 binary matrix into two 64x64 subpixel shares.
 */
export function generateNaorShamirShares(grid: boolean[][]): SubpixelShareResult {
  const height = grid.length
  const width = grid[0]?.length || 0
  const subHeight = height * 2
  const subWidth = width * 2

  const share1 = createEmptyGrid(subWidth, subHeight)
  const share2 = createEmptyGrid(subWidth, subHeight)

  // Pattern pairs for 2x2 subpixel matrices
  // Pattern 0: [1, 0 / 0, 1]
  // Pattern 1: [0, 1 / 1, 0]
  const pattern0: boolean[][] = [
    [true, false],
    [false, true],
  ]
  const pattern1: boolean[][] = [
    [false, true],
    [true, false],
  ]

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const isBlackPixel = grid[r][c]
      // Pick random subpixel pattern for Share 1 (50% probability)
      const choosePattern0 = Math.random() < 0.5
      const s1Pattern = choosePattern0 ? pattern0 : pattern1

      let s2Pattern: boolean[][]
      if (isBlackPixel) {
        // Complementary pattern for black pixel
        s2Pattern = choosePattern0 ? pattern1 : pattern0
      } else {
        // Identical pattern for white pixel
        s2Pattern = s1Pattern
      }

      // Fill 2x2 subpixel blocks in share1 and share2
      const topR = r * 2
      const leftC = c * 2

      share1[topR][leftC] = s1Pattern[0][0]
      share1[topR][leftC + 1] = s1Pattern[0][1]
      share1[topR + 1][leftC] = s1Pattern[1][0]
      share1[topR + 1][leftC + 1] = s1Pattern[1][1]

      share2[topR][leftC] = s2Pattern[0][0]
      share2[topR][leftC + 1] = s2Pattern[0][1]
      share2[topR + 1][leftC] = s2Pattern[1][0]
      share2[topR + 1][leftC + 1] = s2Pattern[1][1]
    }
  }

  return {
    width,
    height,
    subWidth,
    subHeight,
    share1,
    share2,
  }
}

/**
 * Simulates physical optical stacking of Share 1 and Share 2.
 */
export function computeOpticalOverlay(share1: boolean[][], share2: boolean[][]): boolean[][] {
  const height = share1.length
  const width = share1[0]?.length || 0
  const overlay = createEmptyGrid(width, height)

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      overlay[r][c] = share1[r][c] || share2[r][c]
    }
  }

  return overlay
}
