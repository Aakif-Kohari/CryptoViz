import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SignalMessagingLab from '@/components/signal/SignalMessagingLab';

describe('SignalMessagingLab Component', () => {
  it('renders Signal Secure Messaging Lab header and tabs', () => {
    render(<SignalMessagingLab />);

    expect(screen.getByText(/Signal Secure Messaging Lab/i)).toBeInTheDocument();
    expect(screen.getByText(/Interactive Ratchet Chat/i)).toBeInTheDocument();
    expect(screen.getByText(/Ratchet State & Trees/i)).toBeInTheDocument();
    expect(screen.getByText(/Self-Healing Security Lab/i)).toBeInTheDocument();
    expect(screen.getByText(/X3DH Handshake Setup/i)).toBeInTheDocument();
    expect(screen.getByText(/Protocol Architecture & Theory/i)).toBeInTheDocument();
  });

  it('switches between tab views', () => {
    render(<SignalMessagingLab />);

    // Switch to Ratchet State & Trees
    const stateTab = screen.getByRole('button', { name: /Ratchet State & Trees/i });
    fireEvent.click(stateTab);
    expect(screen.getByText(/Double Ratchet Architecture Diagram/i)).toBeInTheDocument();

    // Switch to Self-Healing Security Lab
    const attackTab = screen.getByRole('button', { name: /Self-Healing Security Lab/i });
    fireEvent.click(attackTab);
    expect(screen.getByText(/Post-Compromise Security \(Break-in Recovery\) Simulator/i)).toBeInTheDocument();

    // Switch to X3DH Handshake Setup
    const x3dhTab = screen.getByRole('button', { name: /X3DH Handshake Setup/i });
    fireEvent.click(x3dhTab);
    expect(screen.getByText(/X3DH \(Extended Triple Diffie-Hellman\) Asynchronous Setup/i)).toBeInTheDocument();
  });

  it('allows sending messages in the interactive chat', () => {
    render(<SignalMessagingLab />);

    const sendBtn = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendBtn);

    // Initial message should appear in chat feed
    expect(screen.getAllByText(/Hello Bob! Double Ratchet session initialized./i).length).toBeGreaterThan(0);
  });

  it('runs key compromise attack simulation', () => {
    render(<SignalMessagingLab />);

    // Go to Self-Healing Lab
    const attackTab = screen.getByRole('button', { name: /Self-Healing Security Lab/i });
    fireEvent.click(attackTab);

    // Run attack simulation
    const attackBtn = screen.getByRole('button', { name: /Simulate Key Compromise Attack/i });
    fireEvent.click(attackBtn);

    expect(screen.getByText(/1. Forward Secrecy Guarantee/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Post-Compromise Self-Healing/i)).toBeInTheDocument();
  });
});
