import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CipherVisualizerHub from '@/components/cipher/CipherVisualizerHub'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/visualizer',
}))

describe('CipherVisualizerHub Component', () => {
  it('renders the header title and quick metrics bar', () => {
    render(<CipherVisualizerHub />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Cipher Visualizers Hub',
    )
    expect(screen.getByText('Total Visualizers')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('Recommended & Secure')).toBeInTheDocument()
  })

  it('filters ciphers by search query', () => {
    render(<CipherVisualizerHub />)

    const searchInput = screen.getByLabelText('Search cipher visualizers')
    fireEvent.change(searchInput, { target: { value: 'Caesar' } })

    expect(screen.getByText('Caesar Cipher')).toBeInTheDocument()
    expect(screen.queryByText('RSA-2048')).not.toBeInTheDocument()
  })

  it('filters by category tab when selected', () => {
    render(<CipherVisualizerHub />)

    const asymmetricTab = screen.getByRole('tab', { name: /Asymmetric/i })
    fireEvent.click(asymmetricTab)

    expect(screen.getByText('RSA-2048')).toBeInTheDocument()
    expect(screen.queryByText('Caesar Cipher')).not.toBeInTheDocument()
  })

  it('filters by specialized demos tab', () => {
    render(<CipherVisualizerHub />)

    const specializedTab = screen.getByRole('tab', { name: /Specialized Demos/i })
    fireEvent.click(specializedTab)

    expect(screen.getByText('AES Key Expansion Visualizer')).toBeInTheDocument()
    expect(screen.getByText('Argon2id Memory Hard KDF Visualizer')).toBeInTheDocument()
    expect(screen.queryByText('Caesar Cipher')).not.toBeInTheDocument()
  })

  it('filters by security status select dropdown', () => {
    render(<CipherVisualizerHub />)

    const securitySelect = screen.getByLabelText('Filter by security status')
    fireEvent.change(securitySelect, { target: { value: 'broken' } })

    expect(screen.getByText('Caesar Cipher')).toBeInTheDocument()
    expect(screen.queryByText('AES')).not.toBeInTheDocument()
  })

  it('renders empty search state when no items match and resets filters', () => {
    render(<CipherVisualizerHub />)

    const searchInput = screen.getByLabelText('Search cipher visualizers')
    fireEvent.change(searchInput, { target: { value: 'NonExistentCipher12345' } })

    expect(screen.getByText('No cipher visualizers found')).toBeInTheDocument()

    const resetButton = screen.getByRole('button', { name: /Reset All Filters/i })
    fireEvent.click(resetButton)

    expect(searchInput).toHaveValue('')
    expect(screen.getByText('Caesar Cipher')).toBeInTheDocument()
  })
})
