/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CipherSandbox from '../../../components/cipher-sandbox/CipherSandbox'

describe('CipherSandbox Component Unit Tests', () => {
  it('renders CipherSandbox component header and default preset', () => {
    render(<CipherSandbox />)

    expect(screen.getByText(/Cipher Template Presets/i)).toBeInTheDocument()
    expect(screen.getByText(/Pipeline Stages/i)).toBeInTheDocument()
    expect(screen.getByText(/Input Text/i)).toBeInTheDocument()
    expect(screen.getByText(/Output Result/i)).toBeInTheDocument()
  })

  it('updates output when input text is changed', () => {
    render(<CipherSandbox />)

    const inputArea = screen.getByPlaceholderText(/Type plaintext or ciphertext here.../i)
    fireEvent.change(inputArea, { target: { value: 'TESTDATA' } })

    expect(inputArea).toHaveValue('TESTDATA')
  })

  it('toggles encryption and decryption mode', { timeout: 15000 }, () => {
    render(<CipherSandbox />)

    const toggleBtn = screen.getByText(/Mode: Encryption/i)
    expect(toggleBtn).toBeInTheDocument()

    fireEvent.click(toggleBtn)

    expect(screen.getByText(/Mode: Decryption/i)).toBeInTheDocument()
  })

  it('switches tabs to Security Metrics and Export/Import', () => {
    render(<CipherSandbox />)

    const metricsTab = screen.getByRole('button', { name: /Security Metrics/i })
    fireEvent.click(metricsTab)

    expect(screen.getByText(/Avalanche Effect Metric/i)).toBeInTheDocument()
    expect(screen.getByText(/Ciphertext Symbol Distribution/i)).toBeInTheDocument()

    const exportTab = screen.getByRole('button', { name: /Export \/ Import/i })
    fireEvent.click(exportTab)

    expect(screen.getByText(/Copy Pipeline JSON/i)).toBeInTheDocument()
    expect(screen.getByText(/Import JSON File/i)).toBeInTheDocument()
  })
})
