import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'jest-axe'
import Navbar from '../../../components/layout/Navbar'

describe('Navbar Accessibility & Mobile Menu Navigation', () => {
  it('has no axe-core violations in default desktop view', async () => {
    const { container } = render(<Navbar />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('toggles mobile menu and closes it when Escape key is pressed', () => {
    render(<Navbar />)
    const toggleBtn = screen.getByRole('button', { name: 'Toggle menu' })

    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false')

    // Open mobile menu
    fireEvent.click(toggleBtn)
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true')

    // Press Escape to close
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false')
    expect(toggleBtn).toHaveFocus()
  })
})
