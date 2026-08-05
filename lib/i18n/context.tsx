'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { SupportedLocale, TranslationSchema } from './types'
import { SUPPORTED_LOCALES } from './types'
import { en } from './locales/en'
import { es } from './locales/es'
import { fr } from './locales/fr'
import { de } from './locales/de'
import { hi } from './locales/hi'
import { zh } from './locales/zh'

const DICTIONARIES: Record<SupportedLocale, TranslationSchema> = {
  en,
  es,
  fr,
  de,
  hi,
  zh,
}

const STORAGE_KEY = 'cryptoviz_lang'

export interface LanguageContextType {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  t: (keyPath: string, params?: Record<string, string | number>) => string
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getNestedValue(obj: unknown, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return typeof current === 'string' ? current : undefined
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`
  })
}

function detectDefaultLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en'

  const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null
  if (saved && SUPPORTED_LOCALES.some((l) => l.code === saved)) {
    return saved
  }

  const browserLang = navigator.language?.toLowerCase() || ''
  for (const loc of SUPPORTED_LOCALES) {
    if (browserLang.startsWith(loc.code)) {
      return loc.code
    }
  }

  return 'en'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initialLocale = detectDefaultLocale()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(initialLocale)
    document.documentElement.lang = initialLocale
    setIsInitialized(true)
  }, [])

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    if (!SUPPORTED_LOCALES.some((l) => l.code === newLocale)) return
    setLocaleState(newLocale)
    document.documentElement.lang = newLocale
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {
      // LocalStorage access may be restricted
    }
  }, [])

  const t = useCallback(
    (keyPath: string, params?: Record<string, string | number>): string => {
      const activeDict = DICTIONARIES[locale] || en
      let translated = getNestedValue(activeDict, keyPath)

      // Fallback to English dictionary if key is missing in active locale
      if (!translated && locale !== 'en') {
        translated = getNestedValue(en, keyPath)
      }

      // If missing in English too, return key path
      if (!translated) {
        translated = keyPath
      }

      return interpolate(translated, params)
    },
    [locale]
  )

  const value: LanguageContextType = {
    locale,
    setLocale,
    t,
    dir: 'ltr',
  }

  return (
    <LanguageContext.Provider value={value}>
      <span style={{ display: isInitialized ? 'contents' : 'contents' }}>{children}</span>
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (!context) {
    // Return a fallback context if used outside provider (prevents crashes)
    return {
      locale: 'en',
      setLocale: () => {},
      t: (keyPath: string, params?: Record<string, string | number>) => {
        const val = getNestedValue(en, keyPath) || keyPath
        return interpolate(val, params)
      },
      dir: 'ltr',
    }
  }
  return context
}

export function useTranslation() {
  const { t, locale, setLocale, dir } = useLanguage()
  return { t, locale, setLocale, dir }
}
