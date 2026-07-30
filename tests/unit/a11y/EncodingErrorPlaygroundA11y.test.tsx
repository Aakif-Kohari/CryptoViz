import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import EncodingErrorPlayground from '@/components/encoding/EncodingErrorPlayground';

vi.mock('next/navigation', () => ({
  usePathname: () => '/encoding-errors',
}));

describe('Encoding Error Playground Accessibility (a11y)', () => {
  it('has zero axe accessibility violations on EncodingErrorPlayground', async () => {
    const { container } = render(<EncodingErrorPlayground />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
