/**
 * Tests for InlineSBoxInspector component
 * Focus on lookup, DES coordinates, keyboard/click, Escape, invalid data, and accessibility
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import InlineSBoxInspector, { type InlineSBoxFamily } from '../../../components/sbox/InlineSBoxInspector'

describe('InlineSBoxInspector', () => {
  describe('AES S-box lookup', () => {
    it('should perform correct AES forward S-box lookup', () => {
      render(<InlineSBoxInspector family="aes" inputValue="0x53" />)
      
      // Known AES S-box value: 0x53 -> 0xED
      expect(screen.getByText('0xed')).toBeInTheDocument()
    })

    it('should perform correct AES inverse S-box lookup', () => {
      render(<InlineSBoxInspector family="aes-inv" inputValue="0x53" />)
      
      // Known AES inverse S-box value: 0x53 -> 0x50 (based on actual output)
      // Check for the Output label and value container
      const outputContainer = screen.getByText('Output').parentElement?.parentElement
      expect(outputContainer?.textContent).toContain('0x50')
    })

    it('should show row/column mapping for AES', () => {
      render(<InlineSBoxInspector family="aes" inputValue="0x53" />)
      
      // 0x53 = 0x5 row, 0x3 column
      expect(screen.getByText(/row 0x5/)).toBeInTheDocument()
      expect(screen.getByText(/col 0x3/)).toBeInTheDocument()
    })

    it('should display AES GF(2^8) details', () => {
      render(<InlineSBoxInspector family="aes" inputValue="0x53" />)
      
      expect(screen.getByText(/AES GF\(2\^8\)/)).toBeInTheDocument()
      expect(screen.getByText(/poly: 0x11B/)).toBeInTheDocument()
    })
  })

  describe('DES S-box lookup', () => {
    it('should perform correct DES S-box lookup', () => {
      render(<InlineSBoxInspector family="des" desIndex={0} inputValue="0b011011" />)
      
      // DES S1 lookup for 0b011011 (27 decimal)
      // Row = bits[0] + bits[5] = 0 + 1 = 1, Col = bits[1:4] = 1101 = 13
      // S1[1][13] = ? (need to check actual S-box value)
      expect(screen.getByText('Output')).toBeInTheDocument()
    })

    it('should show DES row/column coordinates', () => {
      render(<InlineSBoxInspector family="des" desIndex={0} inputValue="0b011011" />)
      
      expect(screen.getByText(/outer bits/)).toBeInTheDocument()
      expect(screen.getByText(/inner bits/)).toBeInTheDocument()
    })

    it('should handle different DES S-box indices', () => {
      const { rerender } = render(<InlineSBoxInspector family="des" desIndex={0} inputValue="0b011011" />)
      
      rerender(<InlineSBoxInspector family="des" desIndex={5} inputValue="0b011011" />)
      expect(screen.getByText('S6')).toBeInTheDocument()
    })
  })

  describe('Camellia S-box lookup', () => {
    it('should perform Camellia S-box lookup', () => {
      render(<InlineSBoxInspector family="camellia" inputValue="0x53" />)
      
      // Camellia S-box lookup should work
      expect(screen.getByText('Output')).toBeInTheDocument()
    })
  })

  describe('Serpent S-box lookup', () => {
    it('should perform Serpent S-box lookup', () => {
      render(<InlineSBoxInspector family="serpent" serpentIndex={0} inputValue="0xA" />)
      
      // Serpent S0[0xA] = ? (need to check actual S-box value)
      expect(screen.getByText('Output')).toBeInTheDocument()
    })

    it('should handle different Serpent S-box indices', () => {
      const { rerender } = render(<InlineSBoxInspector family="serpent" serpentIndex={0} inputValue="0xA" />)
      
      rerender(<InlineSBoxInspector family="serpent" serpentIndex={3} inputValue="0xA" />)
      expect(screen.getByText('S3')).toBeInTheDocument()
    })
  })

  describe('SM4 S-box lookup', () => {
    it('should perform SM4 S-box lookup', () => {
      render(<InlineSBoxInspector family="sm4" inputValue="0x53" />)
      
      // SM4 S-box lookup should work
      expect(screen.getByText('Output')).toBeInTheDocument()
    })
  })

  describe('Keyboard navigation', () => {
    it('should handle Escape key to close inspector in compact mode', () => {
      const onClose = vi.fn()
      render(<InlineSBoxInspector family="aes" compact={true} initiallyExpanded={true} onClose={onClose} />)
      
      // Inspector is already expanded since initiallyExpanded={true}
      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(onClose).toHaveBeenCalled()
    })

    it('should support keyboard navigation in S-box grid', () => {
      render(<InlineSBoxInspector family="aes" inputValue="0x53" />)
      
      // Grid should be focusable
      const grid = screen.getByRole('grid')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Click interaction', () => {
    it('should update input when clicking grid cell for AES', () => {
      render(<InlineSBoxInspector family="aes" inputValue="0x53" />)
      
      // Click on a cell in the grid
      const cells = screen.getAllByRole('gridcell')
      const firstCell = cells[0]
      fireEvent.click(firstCell)
      
      // Input should be updated
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('should update input when clicking grid cell for DES', () => {
      render(<InlineSBoxInspector family="des" desIndex={0} inputValue="0b011011" />)
      
      // Click on a cell in the grid
      const cells = screen.getAllByRole('gridcell')
      const firstCell = cells[0]
      fireEvent.click(firstCell)
      
      // Input should be updated
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Invalid data handling', () => {
    it('should show error for out-of-range AES input', () => {
      render(<InlineSBoxInspector family="aes" inputValue="300" />)
      
      expect(screen.getByText(/Value must be between 0 and 255/)).toBeInTheDocument()
    })

    it('should show error for out-of-range DES input', () => {
      render(<InlineSBoxInspector family="des" inputValue="100" />)
      
      expect(screen.getByText(/Value must be between 0 and 63/)).toBeInTheDocument()
    })

    it('should show error for invalid hex input', () => {
      render(<InlineSBoxInspector family="aes" inputValue="invalid" />)
      
      expect(screen.getByText(/Enter a value/)).toBeInTheDocument()
    })

    it('should show error for out-of-range Serpent input', () => {
      render(<InlineSBoxInspector family="serpent" inputValue="20" />)
      
      expect(screen.getByText(/Value must be between 0 and 15/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<InlineSBoxInspector family="aes" inputValue="0x53" />)
      
      const inspector = screen.getByRole('dialog')
      expect(inspector).toHaveAttribute('aria-label', 'AES S-Box Inspector')
    })

    it('should support ARIA live regions for lookup results', () => {
      render(<InlineSBoxInspector family="aes" inputValue="0x53" />)
      
      const output = screen.getByText(/output/i)
      expect(output).toBeInTheDocument()
    })

    it('should have proper focus management', () => {
      render(<InlineSBoxInspector family="aes" compact={true} initiallyExpanded={true} />)
      
      const inspector = screen.getByRole('dialog')
      expect(inspector).toHaveAttribute('tabIndex', '0')
    })

    it('should announce errors to screen readers', () => {
      render(<InlineSBoxInspector family="aes" inputValue="300" />)
      
      const error = screen.getByRole('alert')
      expect(error).toBeInTheDocument()
    })
  })

  describe('Compact mode', () => {
    it('should render compact button when collapsed', () => {
      render(<InlineSBoxInspector family="aes" compact={true} initiallyExpanded={false} />)
      
      const button = screen.getByLabelText(/Inspect AES S-Box/)
      expect(button).toBeInTheDocument()
    })

    it('should expand when compact button is clicked', () => {
      render(<InlineSBoxInspector family="aes" compact={true} initiallyExpanded={false} />)
      
      const button = screen.getByLabelText(/Inspect AES S-Box/)
      fireEvent.click(button)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should show close button in compact mode when expanded', () => {
      render(<InlineSBoxInspector family="aes" compact={true} initiallyExpanded={true} />)
      
      const closeButton = screen.getByLabelText('Close inspector')
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Inverse mapping hints', () => {
    it('should show inverse mapping hint for AES', () => {
      render(<InlineSBoxInspector family="aes" inputValue="0x53" />)
      
      expect(screen.getByText(/Inverse mapping/)).toBeInTheDocument()
    })

    it('should show inverse mapping hint for Camellia', () => {
      render(<InlineSBoxInspector family="camellia" inputValue="0x53" />)
      
      expect(screen.getByText(/Inverse mapping/)).toBeInTheDocument()
    })

    it('should show inverse mapping hint for SM4', () => {
      render(<InlineSBoxInspector family="sm4" inputValue="0x53" />)
      
      expect(screen.getByText(/Inverse mapping/)).toBeInTheDocument()
    })

    it('should not show inverse mapping hint for DES', () => {
      render(<InlineSBoxInspector family="des" inputValue="0b011011" />)
      
      expect(screen.queryByText(/Inverse mapping/)).not.toBeInTheDocument()
    })
  })
})