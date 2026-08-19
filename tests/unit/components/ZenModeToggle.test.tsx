import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ZenModeToggle from '../../../components/cipher/ZenModeToggle';

describe('ZenModeToggle Component', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('renders correctly in normal mode', () => {
    render(<ZenModeToggle isZenMode={false} onToggle={mockOnToggle} />);
    const button = screen.getByRole('button', { name: /Enter Zen Mode/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders correctly in Zen mode', () => {
    render(<ZenModeToggle isZenMode={true} onToggle={mockOnToggle} />);
    const button = screen.getByRole('button', { name: /Exit Zen Mode/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggle when clicked', () => {
    render(<ZenModeToggle isZenMode={false} onToggle={mockOnToggle} />);
    const button = screen.getByRole('button', { name: /Enter Zen Mode/i });
    fireEvent.click(button);
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onToggle when Z is pressed', () => {
    render(<ZenModeToggle isZenMode={false} onToggle={mockOnToggle} />);
    fireEvent.keyDown(window, { key: 'z' });
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onToggle when Escape is pressed while in Zen Mode', () => {
    render(<ZenModeToggle isZenMode={true} onToggle={mockOnToggle} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('does not call onToggle when Escape is pressed in normal mode', () => {
    render(<ZenModeToggle isZenMode={false} onToggle={mockOnToggle} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it('does not call onToggle when typing in input elements', () => {
    render(
      <div>
        <input type="text" data-testid="test-input" />
        <textarea data-testid="test-textarea" />
        <div contentEditable data-testid="test-contenteditable" />
        <ZenModeToggle isZenMode={false} onToggle={mockOnToggle} />
      </div>
    );

    const input = screen.getByTestId('test-input');
    fireEvent.keyDown(input, { key: 'z' });
    expect(mockOnToggle).not.toHaveBeenCalled();

    const textarea = screen.getByTestId('test-textarea');
    fireEvent.keyDown(textarea, { key: 'z' });
    expect(mockOnToggle).not.toHaveBeenCalled();

    const contentEditable = screen.getByTestId('test-contenteditable');
    fireEvent.keyDown(contentEditable, { key: 'z' });
    expect(mockOnToggle).not.toHaveBeenCalled();
  });
});
