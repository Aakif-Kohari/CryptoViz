import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import '@testing-library/jest-dom'
import DDTLATWorkbench from '../../../components/cryptanalysis/DDTLATWorkbench'

describe('DDTLATWorkbench', () => {
  it('renders with PRESENT S-box selected by default', () => {
    render(<DDTLATWorkbench />)
    expect(screen.getByRole('button', { name: 'PRESENT' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Differential uniformity δ')).toBeInTheDocument()
    expect(screen.getByText('Nonlinearity')).toBeInTheDocument()
    // By default, it's on DDT mode
    expect(screen.getByRole('grid', { name: 'Difference Distribution Table' })).toBeInTheDocument()
  })

  it('switches between DDT and LAT modes', () => {
    render(<DDTLATWorkbench />)
    const latBtn = screen.getByRole('button', { name: 'LAT' })
    fireEvent.click(latBtn)
    expect(screen.getByRole('grid', { name: 'Linear Approximation Table' })).toBeInTheDocument()

    const ddtBtn = screen.getByRole('button', { name: 'DDT' })
    fireEvent.click(ddtBtn)
    expect(screen.getByRole('grid', { name: 'Difference Distribution Table' })).toBeInTheDocument()
  })

  it('updates when built-in S-box selection changes', () => {
    render(<DDTLATWorkbench />)
    const serpentBtn = screen.getByRole('button', { name: 'Serpent S0' })
    fireEvent.click(serpentBtn)
    expect(serpentBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('handles custom S-box inputs and reports errors for malformed lists', () => {
    render(<DDTLATWorkbench />)
    const customInput = screen.getByLabelText(/Custom 4-bit S-box/i)
    
    // Type too few values
    fireEvent.change(customInput, { target: { value: '1 2 3' } })
    expect(screen.getByRole('alert')).toHaveTextContent(/Enter exactly 16 values/i)

    // Type exactly 16 valid values
    fireEvent.change(customInput, { target: { value: '12 5 6 11 9 0 10 13 3 14 15 8 4 7 1 2' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('displays detailed breakdown for a clicked DDT cell', () => {
    const { container } = render(<DDTLATWorkbench />)
    const tr = container.querySelectorAll('tbody tr')[1] // dx = 1
    const button = tr.querySelectorAll('button')[13] // dy = 13 (D)
    fireEvent.click(button)
    
    expect(screen.getByText(/Δx = 1 → Δy = D/i)).toBeInTheDocument()
    expect(screen.getByText(/x₁=8/i)).toBeInTheDocument()
    expect(screen.getByText(/x₂=9/i)).toBeInTheDocument()
  })

  it('implements roving tabindex on grid cells', () => {
    render(<DDTLATWorkbench />)
    // The first row dx=0 is entirely zeroes, so the default focusedCell starts at dx=0, dy=0.
    // Let's find the button for Δx 0, Δy 0
    const buttons = screen.getAllByRole('button', { name: /Δx 0, Δy [0-9A-F]/i })
    expect(buttons[0]).toHaveAttribute('tabindex', '0')
    expect(buttons[1]).toHaveAttribute('tabindex', '-1')
  })

  it('moves cell focus with keyboard arrow keys', () => {
    render(<DDTLATWorkbench />)
    const buttons = screen.getAllByRole('button', { name: /Δx 0, Δy [0-9A-F]/i })
    act(() => buttons[0].focus())
    expect(buttons[0]).toHaveFocus()

    fireEvent.keyDown(buttons[0], { key: 'ArrowRight' })
    expect(buttons[1]).toHaveFocus()

    fireEvent.keyDown(buttons[1], { key: 'ArrowDown' })
    expect(document.activeElement).not.toBe(buttons[1])
  })
})
