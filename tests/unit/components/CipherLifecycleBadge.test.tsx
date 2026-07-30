import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CipherLifecycleBadge, { BADGE_CONFIG, SecurityStatus } from '@/components/cipher/CipherLifecycleBadge';

describe('CipherLifecycleBadge Component', () => {
  const statuses: SecurityStatus[] = ['recommended', 'secure', 'experimental', 'legacy', 'deprecated', 'broken'];

  statuses.forEach(status => {
    it(`renders ${status} badge correctly with accessibility label`, () => {
      render(<CipherLifecycleBadge status={status} />);
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent(BADGE_CONFIG[status].label);
      expect(badge).toHaveAttribute('aria-label', expect.stringContaining(BADGE_CONFIG[status].label));
    });
  });

  it('hides icon when hideIcon prop is true', () => {
    render(<CipherLifecycleBadge status="recommended" hideIcon />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Recommended');
    expect(badge.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});
