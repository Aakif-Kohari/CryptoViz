import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AttackCollectionPage from '../../../app/attacks/page';
import EcbPatternLeakageSimulator from '../../../components/attacks/EcbPatternLeakageSimulator';
import ReplayAttackSimulator from '../../../components/attacks/ReplayAttackSimulator';

vi.mock('@/components/layout/Navbar', () => ({
  default: () => <nav>Navbar</nav>,
}));

vi.mock('@/components/layout/footer', () => ({
  default: () => <footer>Footer</footer>,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('Attack Simulator Collection', () => {
  it('renders attack collection hero and title correctly', () => {
    render(<AttackCollectionPage />);
    expect(screen.getByRole('heading', { name: /Attack Simulator Collection/i })).toBeInTheDocument();
    expect(screen.getByText(/Brute-Force Key Search/i)).toBeInTheDocument();
  });

  it('filters attack simulators by search query', () => {
    render(<AttackCollectionPage />);
    const searchInput = screen.getByPlaceholderText(/Search attack simulations/i);
    fireEvent.change(searchInput, { target: { value: 'Replay' } });

    expect(screen.getByText(/Replay & Packet Transmission Attack/i)).toBeInTheDocument();
    expect(screen.queryByText(/Brute-Force Key Search/i)).not.toBeInTheDocument();
  });

  it('renders EcbPatternLeakageSimulator with pattern toggles', () => {
    render(<EcbPatternLeakageSimulator />);
    expect(screen.getByText(/Electronic Codebook \(ECB\) Pattern Vulnerability/i)).toBeInTheDocument();
    expect(screen.getByText(/ECB Mode Ciphertext/i)).toBeInTheDocument();
  });

  it('simulates replay attack and nonce protection in ReplayAttackSimulator', () => {
    render(<ReplayAttackSimulator />);
    const sendBtn = screen.getByRole('button', { name: /1. Alice Sends \$500/i });
    fireEvent.click(sendBtn);

    const replayBtn = screen.getByRole('button', { name: /2. Attacker Replays Message/i });
    fireEvent.click(replayBtn);

    expect(screen.getByText(/Replay Attack Success/i)).toBeInTheDocument();
  });
});
