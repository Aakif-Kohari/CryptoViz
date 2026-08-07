import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CASE_STUDIES } from '@/lib/case-studies/data'
import CaseStudiesHub from '@/components/case-studies/CaseStudiesHub'
import CaseStudyDetail from '@/components/case-studies/CaseStudyDetail'

vi.mock('next/navigation', () => ({
  usePathname: () => '/case-studies',
}))

describe('Cryptographic Case Studies Module (Issue #477)', () => {
  it('contains all required case studies in dataset', () => {
    const ids = CASE_STUDIES.map((s) => s.id)
    expect(ids).toContain('enigma')
    expect(ids).toContain('heartbleed')
    expect(ids).toContain('wannacry')
    expect(ids).toContain('debian-openssl')
    expect(ids).toContain('stuxnet')
    expect(ids).toContain('diginotar')
    expect(ids).toContain('sony-ps3')
    expect(ids).toContain('shattered-sha1')
    expect(ids).toContain('dual-ec-drbg')
  })

  it('renders CaseStudiesHub with title, search, and metrics', () => {
    render(<CaseStudiesHub />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Cryptographic Case Studies',
    )
    expect(screen.getByText('Total Case Studies')).toBeInTheDocument()
    expect(screen.getByText('Critical Incidents')).toBeInTheDocument()
    expect(screen.getByText('Enigma Machine Cryptanalysis')).toBeInTheDocument()
    expect(screen.getByText('Heartbleed OpenSSL Vulnerability')).toBeInTheDocument()
  })

  it('filters case studies by search query', () => {
    render(<CaseStudiesHub />)

    const searchInput = screen.getByLabelText('Search case studies')
    fireEvent.change(searchInput, { target: { value: 'Heartbleed' } })

    expect(screen.getByText('Heartbleed OpenSSL Vulnerability')).toBeInTheDocument()
    expect(screen.queryByText('Enigma Machine Cryptanalysis')).not.toBeInTheDocument()
  })

  it('filters case studies by category tabs', () => {
    render(<CaseStudiesHub />)

    const nonceTab = screen.getByRole('tab', { name: /Nonce Reuse/i })
    fireEvent.click(nonceTab)

    expect(screen.getByText('Sony PlayStation 3 ECDSA Nonce Reuse')).toBeInTheDocument()
    expect(screen.queryByText('Heartbleed OpenSSL Vulnerability')).not.toBeInTheDocument()
  })

  it('renders CaseStudyDetail page with breakdown and timeline', () => {
    const study = CASE_STUDIES.find((s) => s.id === 'sony-ps3')!
    render(<CaseStudyDetail study={study} />)

    expect(screen.getByText('Sony PlayStation 3 ECDSA Nonce Reuse')).toBeInTheDocument()
    expect(screen.getByText('Incident Overview')).toBeInTheDocument()
    expect(screen.getByText('Technical Root Cause Analysis')).toBeInTheDocument()
    expect(screen.getByText('Incident Timeline')).toBeInTheDocument()
    expect(screen.getByText(/recover_ecdsa_private_key/i)).toBeInTheDocument()
  })
})
