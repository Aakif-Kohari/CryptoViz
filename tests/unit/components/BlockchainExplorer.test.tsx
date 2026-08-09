import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BlockchainExplorer from '@/components/blockchain/BlockchainExplorer';

describe('BlockchainExplorer Component', () => {
  it('renders Blockchain Transaction Signature Explorer header and top tabs', () => {
    render(<BlockchainExplorer />);

    expect(screen.getByText(/Blockchain Transaction Signature Explorer/i)).toBeInTheDocument();
    expect(screen.getByText(/Tx Builder & Signer/i)).toBeInTheDocument();
    expect(screen.getByText(/ecrecover Key Recovery/i)).toBeInTheDocument();
    expect(screen.getByText(/secp256k1 & Schnorr Math/i)).toBeInTheDocument();
    expect(screen.getByText(/Nonce Reuse & Attack Lab/i)).toBeInTheDocument();
    expect(screen.getByText(/Standards & Security Theory/i)).toBeInTheDocument();
  });

  it('switches between tabs accurately', () => {
    render(<BlockchainExplorer />);

    // Switch to ecrecover Key Recovery
    const ecrecoverTab = screen.getByRole('button', { name: /ecrecover Key Recovery/i });
    fireEvent.click(ecrecoverTab);
    expect(screen.getByText(/Ethereum `ecrecover` EVM Precompile Inspector/i)).toBeInTheDocument();

    // Switch to Curve Math & Signature Lab
    const mathTab = screen.getByRole('button', { name: /secp256k1 & Schnorr Math/i });
    fireEvent.click(mathTab);
    expect(screen.getByText(/secp256k1 Curve Math & Schnorr vs ECDSA/i)).toBeInTheDocument();

    // Switch to Nonce Reuse & Attack Lab
    const attackTab = screen.getByRole('button', { name: /Nonce Reuse & Attack Lab/i });
    fireEvent.click(attackTab);
    expect(screen.getByText(/Nonce Reuse Attack & Signature Malleability Lab/i)).toBeInTheDocument();

    // Switch to Theory tab
    const theoryTab = screen.getByRole('button', { name: /Standards & Security Theory/i });
    fireEvent.click(theoryTab);
    expect(screen.getByText(/Blockchain Transaction Standards Guide/i)).toBeInTheDocument();
  });

  it('allows switching networks (Ethereum vs Bitcoin)', () => {
    render(<BlockchainExplorer />);

    const btcBtn = screen.getByRole('button', { name: /Bitcoin Network/i });
    fireEvent.click(btcBtn);

    expect(screen.getByText(/Bitcoin Transaction Fields/i)).toBeInTheDocument();
  });

  it('runs Nonce Reuse attack simulation', () => {
    render(<BlockchainExplorer />);

    // Go to Attack Lab
    const attackTab = screen.getByRole('button', { name: /Nonce Reuse & Attack Lab/i });
    fireEvent.click(attackTab);

    // Trigger Nonce Reuse Attack
    const nonceAttackBtn = screen.getByText(/1. Nonce Reuse Attack/i);
    fireEvent.click(nonceAttackBtn);

    expect(screen.getByText(/CATASTROPHIC VULNERABILITY: Private Key Extracted/i)).toBeInTheDocument();
  });
});
