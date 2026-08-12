import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import VisualizerLoading from '../../../app/visualizer/loading'
import BenchmarkLoading from '../../../app/benchmark/loading'
import CipherSandboxLoading from '../../../app/cipher-sandbox/loading'
import CipherVisualizerLoading from '../../../app/visualizer/[cipher]/loading'
import GlobalLoading from '../../../app/loading'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/visualizer',
  useSearchParams: () => new URLSearchParams(),
}))

describe('Route Loading Components', () => {
  it('renders VisualizerLoading skeleton with accessibility status', () => {
    render(<VisualizerLoading />)
    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status.textContent).toContain('Loading visualizers hub...')
  })

  it('renders BenchmarkLoading skeleton with accessibility status', () => {
    render(<BenchmarkLoading />)
    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status.textContent).toContain('Loading performance benchmark workspace...')
  })

  it('renders CipherSandboxLoading skeleton with accessibility status', () => {
    render(<CipherSandboxLoading />)
    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status.textContent).toContain('Loading cipher sandbox environment...')
  })

  it('renders CipherVisualizerLoading skeleton with accessibility status', () => {
    render(<CipherVisualizerLoading />)
    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status.textContent).toContain('Loading cipher visualizer workspace...')
  })

  it('renders GlobalLoading skeleton with spinner and status text', () => {
    render(<GlobalLoading />)
    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status.textContent).toContain('Loading CryptoViz...')
  })
})
