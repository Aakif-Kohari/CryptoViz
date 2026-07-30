import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MythBustersPage from '@/app/myth-busters/page';
import MythQuiz from '@/components/myth-busters/MythQuiz';
import MythCard from '@/components/myth-busters/MythCard';
import { CRYPTO_MYTHS } from '@/lib/myth-busters/mythData';

vi.mock('next/navigation', () => ({
  usePathname: () => '/myth-busters',
}));

describe('Myth Busters Page & Components', () => {
  it('renders Myth Busters Page hero and title', () => {
    render(<MythBustersPage />);
    expect(screen.getByRole('heading', { name: /Misconceptions/i })).toBeInTheDocument();
  });

  it('filters myths based on search input', () => {
    render(<MythBustersPage />);
    const searchInput = screen.getByPlaceholderText(/Search myths or concepts/i);

    fireEvent.change(searchInput, { target: { value: 'Base64' } });
    expect(screen.getByText(/Base64 is a Form of Encryption/i)).toBeInTheDocument();
  });

  it('renders MythCard with BUSTED status badge', () => {
    const myth = CRYPTO_MYTHS[0];
    render(<MythCard myth={myth} onOpenDetails={() => {}} />);

    expect(screen.getByText('BUSTED')).toBeInTheDocument();
    expect(screen.getByText(myth.mythTitle)).toBeInTheDocument();
  });

  it('interacts with MythQuiz and advances question on option click', () => {
    render(<MythQuiz />);
    expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();

    const optionBtn = screen.getByRole('button', { name: /No, Base64 uses no secret key/i });
    fireEvent.click(optionBtn);

    expect(screen.getByText(/Current Score: 1/i)).toBeInTheDocument();
  });
});
