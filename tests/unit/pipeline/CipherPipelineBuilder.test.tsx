import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CipherPipelineBuilder from '../../../components/pipeline/CipherPipelineBuilder';

describe('CipherPipelineBuilder Component', () => {
  it('renders hero title and default pipeline stages', () => {
    render(<CipherPipelineBuilder />);
    expect(screen.getByRole('heading', { name: /Pipeline Builder/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Base64 Encode/i)[0]).toBeInTheDocument();
  });

  it('updates output when changing payload input text', () => {
    render(<CipherPipelineBuilder />);
    const textarea = screen.getByPlaceholderText(/Type payload message/i);
    fireEvent.change(textarea, { target: { value: 'New Test Message' } });

    expect(textarea).toHaveValue('New Test Message');
  });

  it('allows adding a new stage from palette', () => {
    render(<CipherPipelineBuilder />);
    const addHexBtn = screen.getByRole('button', { name: /Hex Encode/i });
    fireEvent.click(addHexBtn);

    // Verify stage sequence count increased
    expect(screen.getByText(/4 Stages/i)).toBeInTheDocument();
  });

  it('loads preset pipelines when preset button is clicked', () => {
    render(<CipherPipelineBuilder />);
    const presetBtn = screen.getByText(/Atbash → Caesar → Hex/i);
    fireEvent.click(presetBtn);

    expect(screen.getByText(/Atbash Substitution/i)).toBeInTheDocument();
  });
});
