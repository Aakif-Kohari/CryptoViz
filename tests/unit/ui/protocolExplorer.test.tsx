import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProtocolExplorer from '../../../components/protocols/ProtocolExplorer'
import React from 'react'

describe('ProtocolExplorer', () => {
  it('renders the initial TLS protocol by default', () => {
    render(<ProtocolExplorer />)
    
    // Should display the TLS title
    expect(screen.getByRole('heading', { name: /TLS \(Transport Layer Security\)/i })).toBeInTheDocument()
    
    // Should have actors listed
    expect(screen.getByText(/Client \(Browser\), Server/i)).toBeInTheDocument()
    
    // Should have the steps
    expect(screen.getByText('Client Hello')).toBeInTheDocument()
    expect(screen.getByText('Server Hello & Certificate')).toBeInTheDocument()
  })

  it('switches to another protocol when a tab is clicked', () => {
    render(<ProtocolExplorer />)
    
    // Click SSH tab
    fireEvent.click(screen.getByRole('button', { name: /SSH/i }))
    
    // Should display SSH details
    expect(screen.getByRole('heading', { name: /SSH \(Secure Shell\)/i })).toBeInTheDocument()
    expect(screen.getByText(/SSH Client, SSH Server/i)).toBeInTheDocument()
    
    // Should display SSH steps
    expect(screen.getByText('Version Exchange')).toBeInTheDocument()
  })

  it('advances through steps when Next Step is clicked', () => {
    render(<ProtocolExplorer />)
    
    // Initially step 1 is active (Client Hello)
    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument()
    
    // Click Next Step
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }))
    
    // Should advance to step 2
    expect(screen.getByText(/Step 2 of 4/i)).toBeInTheDocument()
    expect(screen.getByText('ServerHello + Cert + Random_S')).toBeInTheDocument()
  })
})
