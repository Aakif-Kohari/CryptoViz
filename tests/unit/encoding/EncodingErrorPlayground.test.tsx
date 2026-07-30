import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EncodingErrorPage from '@/app/encoding-errors/page';
import EncodingErrorPlayground from '@/components/encoding/EncodingErrorPlayground';

vi.mock('next/navigation', () => ({
  usePathname: () => '/encoding-errors',
}));

describe('Encoding Error Playground Component & Page', () => {
  it('renders hero title and playground tabs', () => {
    render(<EncodingErrorPage />);
    expect(screen.getByRole('heading', { name: /Mojibake Playground/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Invalid Input Debugger/i })).toBeInTheDocument();
  });

  it('switches playground mode tabs', () => {
    render(<EncodingErrorPlayground />);
    const mojibakeTab = screen.getByRole('tab', { name: /Mojibake Simulator/i });
    fireEvent.click(mojibakeTab);

    expect(screen.getByText(/Character Set Misinterpretation/i)).toBeInTheDocument();
  });

  it('triggers auto-repair on corrupt input', () => {
    render(<EncodingErrorPlayground />);
    const inputArea = screen.getByLabelText(/Encoded String Input/i);
    fireEvent.change(inputArea, { target: { value: 'SGVsbG8!' } });

    const fixBtn = screen.getByRole('button', { name: /Auto-Repair Encoding/i });
    fireEvent.click(fixBtn);

    expect(screen.getByText(/Valid Encoded Sequence/i)).toBeInTheDocument();
  });
});
