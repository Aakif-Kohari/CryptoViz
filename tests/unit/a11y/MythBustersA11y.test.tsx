import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import MythCard from '@/components/myth-busters/MythCard';
import MythQuiz from '@/components/myth-busters/MythQuiz';
import MythDetailModal from '@/components/myth-busters/MythDetailModal';
import { CRYPTO_MYTHS } from '@/lib/myth-busters/mythData';

vi.mock('next/navigation', () => ({
  usePathname: () => '/myth-busters',
}));

describe('Myth Busters Accessibility (a11y)', () => {
  it('has zero axe accessibility violations on MythCard', async () => {
    const myth = CRYPTO_MYTHS[0];
    const { container } = render(<MythCard myth={myth} onOpenDetails={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has zero axe accessibility violations on MythQuiz', async () => {
    const { container } = render(<MythQuiz />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has zero axe accessibility violations on MythDetailModal', async () => {
    const myth = CRYPTO_MYTHS[0];
    const { container } = render(<MythDetailModal myth={myth} isOpen={true} onClose={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
