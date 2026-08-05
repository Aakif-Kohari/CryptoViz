'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/context'
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/i18n/types'

export default function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentMeta = SUPPORTED_LOCALES.find((l) => l.code === locale) || SUPPORTED_LOCALES[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function selectLocale(code: SupportedLocale) {
    setLocale(code)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white/50 px-2.5 text-xs font-medium text-zinc-700 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
        aria-label={t('common.languageToggle')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-sm" aria-hidden="true">
          {currentMeta.flag}
        </span>
        <span className="hidden md:inline font-sans">{currentMeta.nativeName}</span>
        <span className="inline md:hidden font-mono uppercase">{currentMeta.code}</span>
        <svg
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-1.5 w-44 origin-top-right rounded-lg border border-zinc-200 bg-white/95 p-1 shadow-lg backdrop-blur-md focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/95"
          role="listbox"
          aria-label="Languages"
        >
          {SUPPORTED_LOCALES.map((loc) => {
            const isSelected = loc.code === locale
            return (
              <button
                key={loc.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => selectLocale(loc.code)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm" aria-hidden="true">
                    {loc.flag}
                  </span>
                  <span>{loc.nativeName}</span>
                </span>
                {isSelected && (
                  <svg className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
