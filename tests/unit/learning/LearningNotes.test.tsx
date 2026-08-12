import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LearningNotesHub from '../../../components/learning/LearningNotesHub';
import LearningNotesDrawer from '../../../components/learning/LearningNotesDrawer';

vi.mock('@/components/layout/Navbar', () => ({
  default: () => <nav>Navbar</nav>,
}));

vi.mock('@/components/layout/footer', () => ({
  default: () => <footer>Footer</footer>,
}));

describe('Learning Notes UI Components', () => {
  it('renders LearningNotesHub title and header correctly', () => {
    render(<LearningNotesHub />);
    expect(screen.getByRole('heading', { name: /Learning Notes Hub/i })).toBeInTheDocument();
  });

  it('renders floating LearningNotesDrawer button and opens drawer', () => {
    render(<LearningNotesDrawer targetId="caesar" targetTitle="Caesar Cipher" />);
    const toggleBtn = screen.getByRole('button', { name: /Open Personal Learning Notes/i });
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Notes: Caesar Cipher/i)).toBeInTheDocument();
  });
});
