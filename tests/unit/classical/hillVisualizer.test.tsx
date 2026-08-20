import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HillMatrixVisualizer from '../../../components/cipher/HillMatrixVisualizer'
import type { CipherStep } from '../../../lib/cipher/types'

describe('HillMatrixVisualizer', () => {
  it('renders key matrix with determinant and coprimality badge for invertible key', () => {
    render(<HillMatrixVisualizer keyString="HILL" />)

    expect(screen.getByText(/2×2 Hill Cipher Matrix Transformation/i)).toBeDefined()
    expect(screen.getByText(/det\(K\) = 15 \(Coprime with 26 ✓\)/i)).toBeDefined()
    expect(screen.getByText('Key Matrix K')).toBeDefined()
  })

  it('renders warning badge for non-invertible matrix', () => {
    // "AAAA" -> [[0, 0], [0, 0]] -> det = 0 mod 26
    render(<HillMatrixVisualizer keyString="AAAA" />)

    expect(screen.getByText(/det\(K\) = 0 \(Non-Invertible ✗\)/i)).toBeDefined()
  })

  it('renders prompt when key is incomplete', () => {
    render(<HillMatrixVisualizer keyString="HI" />)

    expect(
      screen.getByText(/Enter a 4-letter key.*to view the 2×2 Hill Matrix dot-product visualizer/i)
    ).toBeDefined()
  })

  it('renders vector dot products and intermediate calculations when step is provided', () => {
    const mockStep: CipherStep = {
      index: 1,
      label: "Block 1 — 'HE'",
      inputState: 'HE',
      outputState: 'DR',
      matrix: [
        ['7', '8'],
        ['11', '11'],
      ],
      note: "[7,4] -> K*v mod 26 = [3,17] = 'DR'",
    }

    render(<HillMatrixVisualizer keyString="HILL" step={mockStep} currentStepIndex={1} />)

    expect(screen.getByText(/Vector Dot Product/i)).toBeDefined()
    expect(screen.getByText(/Block: 'HE' → 'DR'/i)).toBeDefined()
    expect(screen.getByText(/C₁ = \(7×7 \+ 8×4\)/i)).toBeDefined()
    expect(screen.getByText(/C₂ = \(11×7 \+ 11×4\)/i)).toBeDefined()
  })

  it('renders decryption inverse matrix K⁻¹ during decryption step', () => {
    const mockStep: CipherStep = {
      index: 0,
      label: 'Key setup — invert matrix',
      inputState: 'HILL',
      outputState: 'DRPA',
      note: 'Computed K^-1 mod 26 from the key matrix so ciphertext blocks can be mapped back to plaintext.',
    }

    render(<HillMatrixVisualizer keyString="HILL" step={mockStep} currentStepIndex={0} />)

    expect(screen.getByText(/Decryption Inverse Matrix K⁻¹/i)).toBeDefined()
  })
})
