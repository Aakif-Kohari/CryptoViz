'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'


export default function Navbar() {
  const pathname = usePathname()

  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as
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

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'

    setTheme(nextTheme)

    localStorage.setItem('theme', nextTheme)

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

    const navCategories = [
    { name: 'Home', href: '/' },
    {
      name: 'Learn',
      items: [
        { name: 'Cipher Lifecycle', href: '/cipher-lifecycle' },
        { name: 'Myth Busters', href: '/myth-busters' },
        { name: 'Encoding Errors', href: '/encoding-errors' },
        { name: 'Merkle Tree', href: '/merkle' },
        { name: 'Padding', href: '/padding' },
      ],
    },
    {
      name: 'Practice',
      items: [
        { name: 'Playground', href: '/visualizer/caesar/' },
        { name: 'Challenge', href: '/challenge' },
        { name: 'Advisor', href: '/advisor' },
      ],
    },
    {
      name: 'Reference',
      items: [
        { name: 'Glossary', href: '/glossary' },
        { name: 'Modes', href: '/modes' },
        { name: 'Compare', href: '/compare' },
        { name: 'Matrix', href: '/matrix' },
        { name: 'Benchmark', href: '/benchmark' },
        { name: 'Avalanche', href: '/avalanche' },
      ],
    },
    {
      name: 'More',
      items: [
        { name: 'Resources', href: '/resources' },
        { name: 'Offline', href: '/offline' },
      ],
    },
  ];

  return (
    <nav
      className="sticky top-0 z-50 border-b border-zinc-200/20 bg-white/70 backdrop-blur-2xl dark:border-zinc-800/60 dark:bg-zinc-950/70"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-[88px] max-w-[1450px] items-center justify-between px-4 sm:px-6 lg:px-12">
        {/* Logo */}

        <Link
          href="/"
          className="group flex items-center gap-3 sm:gap-4 transition-all duration-300"        >
          <div
            className="
            flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center
            rounded-2xl
            bg-gradient-to-br
            from-teal-500
            to-cyan-500
            text-white
            shadow-lg
            shadow-teal-500/30
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-6
          "
          >
            <svg
              className="h-5 w-5 sm:h-7 sm:w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-xl sm:text-[28px] font-black tracking-tight text-zinc-900 dark:text-white">
              Crypto
              <span className="text-teal-500">Viz</span>
            </span>


          </div>
        </Link>

        {/* Desktop Navigation */}

        <div className="hidden items-center gap-10 xl:flex">
          {navCategories.map((category) => {
            const isCategoryActive = category.href
              ? pathname === category.href
              : category.items?.some((item) => pathname.startsWith(item.href) && item.href !== '#');

            return (
              <div key={category.name} className="group relative">
                {category.href ? (
                  <Link
                    href={category.href}
                    className={`
                      relative
                      text-[15px]
                      font-semibold
                      transition-all
                      duration-300
                      ${isCategoryActive
                        ? 'text-teal-500'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                      }
                    `}
                  >
                    {category.name}
                    <span
                      className={`
                        absolute
                        -bottom-6
                        left-1/2
                        h-[3px]
                        rounded-full
                        bg-teal-500
                        transition-all
                        duration-300
                        ${isCategoryActive
                          ? 'w-full -translate-x-1/2'
                          : 'w-0 -translate-x-1/2 group-hover:w-full'
                        }
                      `}
                    />
                  </Link>
                ) : (
                  <div className="cursor-default py-6 -my-6 flex items-center">
                    <span
                      className={`
                        relative
                        text-[15px]
                        font-semibold
                        transition-all
                        duration-300
                        ${isCategoryActive
                          ? 'text-teal-500'
                          : 'text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white'
                        }
                      `}
                    >
                      {category.name}
                      <span
                        className={`
                          absolute
                          -bottom-[28px]
                          left-1/2
                          h-[3px]
                          rounded-full
                          bg-teal-500
                          transition-all
                          duration-300
                          ${isCategoryActive
                            ? 'w-full -translate-x-1/2'
                            : 'w-0 -translate-x-1/2 group-hover:w-full'
                          }
                        `}
                      />
                    </span>
                    
                    <div className="absolute left-1/2 top-full mt-4 w-56 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="rounded-xl border border-zinc-200/50 bg-white/95 p-2 shadow-xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/95 flex flex-col gap-1">
                        {category.items?.map((item) => {
                          const isItemActive = pathname.startsWith(item.href) && item.href !== '#';
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                                isItemActive
                                  ? 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400'
                                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-white'
                              }`}
                            >
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right Side */}

        <div className="flex items-center gap-2 sm:gap-4">
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
            {navCategories.map((category) => {
              if (category.href) {
                const isActive = pathname === category.href;
                return (
                  <Link
                    key={category.name}
                    href={category.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      rounded-xl px-4 py-3 text-base font-semibold transition-all duration-300
                      ${isActive
                        ? 'bg-teal-500 text-white'
                        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
                      }
                    `}
                  >
                    {category.name}
                  </Link>
                );
              }

              return (
                <div key={category.name} className="py-2">
                  <h3 className="px-4 mb-2 text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {category.name}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {category.items?.map((item) => {
                      const isActive = pathname.startsWith(item.href) && item.href !== '#';
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`
                            rounded-xl pl-8 pr-4 py-2.5 text-[15px] font-medium transition-all duration-300
                            ${isActive
                              ? 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400'
                              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
                            }
                          `}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  )
}