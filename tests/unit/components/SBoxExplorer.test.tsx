import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom'
import SBoxExplorer from '../../../components/sbox/SBoxExplorer'

describe('SBoxExplorer', () => {
  it('renders the AES S-box by default and looks up the default input', () => {
    render(<SBoxExplorer />)
    expect(screen.getByRole('button', { name: 'AES S-Box' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText(/output = 0xed/)).toBeInTheDocument()
  })

  it('updates the lookup when the input changes', () => {
    render(<SBoxExplorer />)
    const input = screen.getByLabelText(/Input byte/i)
    fireEvent.change(input, { target: { value: '0x00' } })
    expect(screen.getByText(/output = 0x63/)).toBeInTheDocument()
  })

  it('shows a validation message for out-of-range input', () => {
    render(<SBoxExplorer />)
    const input = screen.getByLabelText(/Input byte/i)
    fireEvent.change(input, { target: { value: '999' } })
    expect(screen.getByRole('alert')).toHaveTextContent(/between 0 and 255/i)
  })

  it('switches to the AES inverse S-box and inverts the default lookup', () => {
    render(<SBoxExplorer />)
    fireEvent.click(screen.getByRole('button', { name: 'AES Inverse S-Box' }))
    const input = screen.getByLabelText(/Input byte/i)
    fireEvent.change(input, { target: { value: '0xed' } })
    expect(screen.getByText(/output = 0x53/)).toBeInTheDocument()
  })

  it('switches to DES S-boxes and shows the S-box selector', () => {
    render(<SBoxExplorer />)
    fireEvent.click(screen.getByRole('button', { name: 'DES S-Boxes' }))
    expect(screen.getByRole('group', { name: 'DES S-box selector' })).toBeInTheDocument()

    const input = screen.getByLabelText(/Input bits/i)
    fireEvent.change(input, { target: { value: '0b011011' } })
    expect(screen.getByText(/output = 5/)).toBeInTheDocument()
  })

  it('updates the input field when a grid cell is clicked', () => {
    render(<SBoxExplorer />)
    const cell = screen.getByRole('button', { name: /Row 0, column 0/i })
    fireEvent.click(cell)
    expect(screen.getByText(/output = 0x63/)).toBeInTheDocument()
  })
})
