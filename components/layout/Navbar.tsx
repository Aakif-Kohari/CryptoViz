'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isDevelopmentMode } from '@/lib/utils/env'
import { safeGetItem, safeSetItem } from '../../lib/utils/storage'
import LanguageSelector from '../i18n/LanguageSelector'
import { useTranslation } from '@/lib/i18n/context'

export default function Navbar() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const savedTheme = safeGetItem('theme') as
      | 'light'
      | 'dark'
      | null

    const systemTheme = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
      ? 'dark'
      : 'light'

    const initialTheme = savedTheme || systemTheme

    setTheme(initialTheme)

    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!isMobileMenuOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
        mobileMenuBtnRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'

    setTheme(nextTheme)

    safeSetItem('theme', nextTheme)

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const allNavLinks = [
    { name: t('nav.visualizers') || 'Visualizers', href: '/visualizer' },
    { name: t('nav.playground'), href: '/visualizer/caesar/' },
    { name: t('nav.advisor') || 'Advisor', href: '/advisor' },
    { name: t('nav.modes'), href: '/modes' },
    { name: t('nav.protocols') || 'Protocols', href: '/protocols' },
    { name: t('nav.compare'), href: '/compare' },
    { name: t('nav.matrix') || 'Matrix', href: '/matrix' },
    { name: t('nav.benchmark'), href: '/benchmark' },
    { name: t('nav.avalanche'), href: '/avalanche' },
    { name: t('nav.sbox') || 'S-Box Explorer', href: '/sbox' },
    { name: t('nav.merkle') || 'Merkle Tree', href: '/merkle' },
    { name: t('nav.padding') || 'Padding', href: '/padding' },
    { name: t('nav.challenge'), href: '/challenge' },
    { name: t('nav.rainbow') || 'Rainbow Table', href: '/rainbow-table' },
    { name: t('nav.docs'), href: '/docs' },
    { name: t('nav.reference') || 'Reference Hub', href: '/reference' },
    { name: t('nav.offline') || 'Offline', href: '/offline' },
    { name: t('nav.glossary') || 'Glossary', href: '/glossary' },
    { name: t('nav.lifecycle') || 'Cipher Lifecycle', href: '/cipher-lifecycle' },
    { name: t('nav.graph') || 'Cipher Graph', href: '/timeline' },
    { name: t('nav.caseStudies') || 'Case Studies', href: '/case-studies' },
    { name: t('nav.mythBusters') || 'Myth Busters', href: '/myth-busters' },
    { name: t('nav.encodingErrors') || 'Encoding Errors', href: '/encoding-errors' },
    { name: t('nav.resources'), href: '/resources' },
    { name: t('nav.timeline') || 'Timeline', href: '/timeline' },
  ];

  const developerOnlyLinks = [
    { name: 'Benchmark History', href: '/benchmarks/history' },
    { name: 'Integration Tests', href: '/tests/integration' },
    { name: 'Snapshot Tests', href: '/tests/snapshots' },
    { name: 'Worker Tests', href: '/tests/worker' },
  ];

  const navLinks = isDevelopmentMode()
    ? [...allNavLinks, ...developerOnlyLinks]
    : allNavLinks;

  return (
    <nav
      className="sticky top-0 z-50 border-b border-zinc-200/20 bg-white/70 backdrop-blur-2xl dark:border-zinc-800/60 dark:bg-zinc-950/70"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="group flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 transition-colors duration-300 group-hover:bg-teal-500/20">
              <svg
                className="h-6 w-6 text-teal-600 transition-transform duration-300 group-hover:rotate-12 dark:text-teal-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>

              {/* Glow effect */}

              <div className="absolute inset-0 rounded-2xl bg-teal-500/20 blur-md transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
            </div>

            <span className="font-sans text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Crypto
              <span className="text-teal-600 dark:text-teal-400">
                Viz
              </span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href))

            return (
              <Link
                key={link.name}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  group relative rounded-xl px-3.5 py-2 text-sm font-medium
                  transition-all duration-300
                  ${isActive
                    ? 'text-teal-600 dark:text-teal-400 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
                  }
                `}
              >
                {/* Active Indicator Background */}

                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-teal-500/10 dark:bg-teal-500/15" />
                )}

                <span className="relative z-10">{link.name}</span>

                {/* Hover Line */}

                <div
                  className={`
                    absolute bottom-1 left-1/2 h-[2px] rounded-full bg-teal-500 transition-all duration-300
                    ${isActive
                      ? 'w-full -translate-x-1/2'
                      : 'w-0 -translate-x-1/2 group-hover:w-full'
                    }
                  `}
                />
              </Link>
            )
          })}
        </div>

        {/* Right Side */}

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="
              flex
              h-10
              w-10
              sm:h-12
              sm:w-12
              items-center
              justify-center
              rounded-2xl
              border
              border-zinc-200
              bg-white
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-lg
              hover:shadow-teal-500/20
              dark:border-zinc-800
              dark:bg-zinc-900
            "
          >
            {theme === 'dark' ? (
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m8-9h1M3 12H2m15.364-6.364l.707-.707M5.636 18.364l-.707.707m0-13.435l.707.707m12.021 12.021l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9 9 0 1012 21a9 9 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* Mobile Menu Button */}

          <button
            ref={mobileMenuBtnRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            className="
              flex
              xl:hidden
              h-10
              w-10
              sm:h-12
              sm:w-12
              items-center
              justify-center
              rounded-2xl
              border
              border-zinc-200
              bg-white
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-lg
              hover:shadow-teal-500/20
              dark:border-zinc-800
              dark:bg-zinc-900
            "
          >
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-700 dark:text-zinc-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}

      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="
            xl:hidden
            border-t
            border-zinc-200
            bg-white/95
            backdrop-blur-xl
            dark:border-zinc-800
            dark:bg-zinc-950/95
          "
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/visualizer'
                  ? pathname === '/visualizer' || pathname === '/visualizer/'
                  : pathname.startsWith(link.href) && link.href !== '#'

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    rounded-xl
                    px-4
                    py-3
                    text-base
                    font-semibold
                    transition-all
                    duration-300

                    ${isActive
                      ? 'bg-teal-500 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
                    }
                  `}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}