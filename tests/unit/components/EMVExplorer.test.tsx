import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EMVExplorer from '@/components/emv/EMVExplorer';

describe('EMVExplorer Component', () => {
  it('renders EMV Payment Cryptography Explorer header and top tabs', () => {
    render(<EMVExplorer />);

    expect(screen.getByText(/EMV Payment Cryptography Explorer/i)).toBeInTheDocument();
    expect(screen.getByText(/POS Terminal & Card Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/ARQC \/ ARPC Cryptogram Inspector/i)).toBeInTheDocument();
    expect(screen.getByText(/Key Derivation Hierarchy/i)).toBeInTheDocument();
    expect(screen.getByText(/POS Fraud & Security Sandbox/i)).toBeInTheDocument();
    expect(screen.getByText(/EMV Standards & HSM Theory/i)).toBeInTheDocument();
  });

  it('switches between tabs accurately', () => {
    render(<EMVExplorer />);

    // Switch to ARQC / ARPC Cryptogram Inspector
    const cryptogramTab = screen.getByRole('button', { name: /ARQC \/ ARPC Cryptogram Inspector/i });
    fireEvent.click(cryptogramTab);
    expect(screen.getByText(/EMV Application Cryptograms Inspector/i)).toBeInTheDocument();

    // Switch to Key Derivation Hierarchy
    const hierarchyTab = screen.getByRole('button', { name: /Key Derivation Hierarchy/i });
    fireEvent.click(hierarchyTab);
    expect(screen.getByText(/EMV Key Diversification Hierarchy/i)).toBeInTheDocument();

    // Switch to POS Fraud & Security Sandbox
    const fraudTab = screen.getByRole('button', { name: /POS Fraud & Security Sandbox/i });
    fireEvent.click(fraudTab);
    expect(screen.getByText(/Payment Attack & Issuer HSM Verification Sandbox/i)).toBeInTheDocument();

    // Switch to Theory tab
    const theoryTab = screen.getByRole('button', { name: /EMV Standards & HSM Theory/i });
    fireEvent.click(theoryTab);
    expect(screen.getByText(/EMV Payment Security Standards Guide/i)).toBeInTheDocument();
  });

  it('allows incrementing Application Transaction Counter (ATC)', () => {
    render(<EMVExplorer />);

    const incBtn = screen.getByRole('button', { name: /Increment Card ATC/i });
    fireEvent.click(incBtn);

    expect(screen.getByRole('button', { name: /Increment Card ATC \(143\)/i })).toBeInTheDocument();
  });

  it('simulates payment attack modes in sandbox tab', () => {
    render(<EMVExplorer />);

    // Switch to POS Fraud Sandbox
    const fraudTab = screen.getByRole('button', { name: /POS Fraud & Security Sandbox/i });
    fireEvent.click(fraudTab);

    // Click Replay Attack button
    const replayBtn = screen.getByText(/2. Replay Attack/i);
    fireEvent.click(replayBtn);

    expect(screen.getByText(/Transaction Declined by Issuer HSM/i)).toBeInTheDocument();
    expect(screen.getByText(/Duplicate ATC/i)).toBeInTheDocument();
  });
});
