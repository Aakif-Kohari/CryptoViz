import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'jest-axe'
import CollectionsPage from '@/app/collections/page'

vi.mock('next/navigation', () => ({
  usePathname: () => '/collections',
}))

describe('Collections Page Accessibility & Interaction', () => {
  it('has no axe-core violations in default view', async () => {
    const { container } = render(<CollectionsPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders AES and SHA families and switches active collection on click', () => {
    render(<CollectionsPage />)

    // Ensure AES and SHA family entries exist in the selector
    const aesTab = screen.getByRole('tab', { name: /AES Family/i })
    const shaTab = screen.getByRole('tab', { name: /SHA Family/i })

    expect(aesTab).toBeInTheDocument()
    expect(shaTab).toBeInTheDocument()

    // Click SHA and assert the panel updates
    fireEvent.click(shaTab)
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', expect.stringContaining('sha-family'))

    // Click AES and assert the panel updates
    fireEvent.click(aesTab)
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', expect.stringContaining('aes-family'))
  })
})
