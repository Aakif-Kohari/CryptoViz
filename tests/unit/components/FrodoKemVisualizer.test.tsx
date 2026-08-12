import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FrodoKemVisualizer from '@/components/cipher/FrodoKemVisualizer';

describe('FrodoKemVisualizer component', () => {
  it('renders title and navigation tabs', () => {
    render(<FrodoKemVisualizer />);

    expect(screen.getByText('FrodoKEM Interactive Matrix Visualizer')).toBeInTheDocument();
    expect(screen.getByText('1. Matrix LWE KeyGen')).toBeInTheDocument();
    expect(screen.getByText('2. Encapsulation')).toBeInTheDocument();
    expect(screen.getByText('3. Decapsulation')).toBeInTheDocument();
    expect(screen.getByText('4. FrodoKEM vs ML-KEM')).toBeInTheDocument();
  });

  it('switches between interactive tabs and updates view', () => {
    render(<FrodoKemVisualizer />);

    // Click Encapsulation Tab
    const encapsTab = screen.getByText('2. Encapsulation');
    fireEvent.click(encapsTab);
    expect(screen.getByText('FrodoKEM Encapsulation Steps:')).toBeInTheDocument();

    // Click Decapsulation Tab
    const decapsTab = screen.getByText('3. Decapsulation');
    fireEvent.click(decapsTab);
    expect(screen.getByText('Decapsulation & Error Cancellation:')).toBeInTheDocument();

    // Click Comparison Tab
    const compareTab = screen.getByText('4. FrodoKEM vs ML-KEM');
    fireEvent.click(compareTab);
    expect(screen.getByText('FrodoKEM-640 Public Key Size')).toBeInTheDocument();
    expect(screen.getByText('ML-KEM-768 Public Key Size')).toBeInTheDocument();
    expect(screen.getByText('Unstructured LWE (Standard Matrices)')).toBeInTheDocument();
  });
});
