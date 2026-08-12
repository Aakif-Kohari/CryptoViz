import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import React from 'react'
import GlobalError from '../../app/error'
import VisualizerError from '../../app/visualizer/error'
import CipherError from '../../app/visualizer/[cipher]/error'

// Mock next/link
vi.mock('next/link', () => {
    return {
        default: ({ children, href }: { children: React.ReactNode, href: string }) => (
            <a href={href} data-testid="next-link">{children}</a>
        )
    }
})

// Mock Navbar
vi.mock('../../components/layout/Navbar', () => ({
    default: () => <nav data-testid="mock-navbar" />
}))

describe('Error Boundaries', () => {
    const mockError = new Error('Test error message')
    const mockReset = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        // Supress console.error during tests since we're testing error boundaries 
        // and RouteErrorUI logs the error
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('GlobalError renders correctly', () => {
        render(<GlobalError error={mockError} reset={mockReset} />)
        
        expect(screen.getByTestId('mock-navbar')).toBeInTheDocument()
        expect(screen.getByText('A fatal error occurred')).toBeInTheDocument()
        expect(screen.getByText('The application encountered an unexpected global error.')).toBeInTheDocument()
        
        const tryAgainBtn = screen.getByText('Try Again')
        fireEvent.click(tryAgainBtn)
        expect(mockReset).toHaveBeenCalledTimes(1)
        
        expect(screen.getByText('Go Home')).toHaveAttribute('href', '/')
    })

    it('VisualizerError renders correctly', () => {
        render(<VisualizerError error={mockError} reset={mockReset} />)
        
        expect(screen.getByTestId('mock-navbar')).toBeInTheDocument()
        expect(screen.getByText('Visualizer Error')).toBeInTheDocument()
        expect(screen.getByText('An error occurred in the visualization system.')).toBeInTheDocument()
    })

    it('CipherError renders correctly', () => {
        render(<CipherError error={mockError} reset={mockReset} />)
        
        expect(screen.getByTestId('mock-navbar')).toBeInTheDocument()
        expect(screen.getByText('Cipher Error')).toBeInTheDocument()
        expect(screen.getByText('This specific cryptographic visualizer encountered an error.')).toBeInTheDocument()
    })
})
