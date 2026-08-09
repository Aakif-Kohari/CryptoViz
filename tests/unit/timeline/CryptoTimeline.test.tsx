import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CryptoTimeline from '../../../components/timeline/CryptoTimeline'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

describe('CryptoTimeline Component', () => {
  it('renders title and stats header correctly', () => {
    render(<CryptoTimeline />)
    expect(screen.getByRole('heading', { name: /Cryptography Timeline/i })).toBeInTheDocument()
    expect(screen.getByText(/INTERACTIVE HISTORICAL TIMELINE/i)).toBeInTheDocument()
  })

  it('renders milestone cards and search functionality', () => {
    render(<CryptoTimeline />)
    const searchInput = screen.getByPlaceholderText(/Search milestones.../i)
    expect(searchInput).toBeInTheDocument()

    // Search for Caesar
    fireEvent.change(searchInput, { target: { value: 'Caesar' } })
    expect(screen.getByText(/Caesar Cipher/i)).toBeInTheDocument()
  })

  it('filters milestones by era button click', () => {
    render(<CryptoTimeline />)
    const classicalBtn = screen.getByRole('button', { name: 'Classical Era' })
    expect(classicalBtn).toBeInTheDocument()

    // Clicking Classical Era toggles off classical entries
    fireEvent.click(classicalBtn)
    expect(screen.queryByText('Caesar Cipher')).not.toBeInTheDocument()
  })

  it('expands card on click to reveal description and related ciphers', () => {
    render(<CryptoTimeline />)
    const caesarTitle = screen.getByText('Caesar Cipher')
    fireEvent.click(caesarTitle)

    expect(screen.getByText(/Julius Caesar used a simple shift substitution/i)).toBeInTheDocument()
  })
})
