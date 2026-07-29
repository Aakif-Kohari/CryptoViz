import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CipherLifecyclePage from '@/app/cipher-lifecycle/page';

vi.mock('next/navigation', () => ({
  usePathname: () => '/cipher-lifecycle',
}));

describe('Cipher Lifecycle Page', () => {
  it('renders page hero title and classification matrix', () => {
    render(<CipherLifecyclePage />);
    expect(screen.getByRole('heading', { name: /Security Lifecycle/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Lifecycle Classification Matrix/i })).toBeInTheDocument();
  });

  it('filters algorithms when search input is typed', () => {
    render(<CipherLifecyclePage />);
    const searchInput = screen.getByPlaceholderText(/Search algorithms/i);
    fireEvent.change(searchInput, { target: { value: 'AES' } });

    expect(screen.getByText('AES')).toBeInTheDocument();
  });

  it('filters algorithms when status category tab is clicked', () => {
    render(<CipherLifecyclePage />);
    const brokenTab = screen.getByRole('tab', { name: /Broken/i });
    fireEvent.click(brokenTab);

    expect(screen.getByText('MD5')).toBeInTheDocument();
  });
});
