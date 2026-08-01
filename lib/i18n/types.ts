export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh'

export interface LocaleMeta {
  code: SupportedLocale
  name: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LOCALES: LocaleMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
]

export interface TranslationSchema {
  common: {
    title: string
    subtitle: string
    loading: string
    error: string
    success: string
    copy: string
    copied: string
    clear: string
    reset: string
    derive: string
    encrypt: string
    decrypt: string
    execute: string
    close: string
    themeToggle: string
    languageToggle: string
    stepOfTotal: string
    backToDocs: string
  }
  nav: {
    home: string
    playground: string
    modes: string
    compare: string
    benchmark: string
    avalanche: string
    challenge: string
    docs: string
    resources: string
  }
  playground: {
    title: string
    inputLabel: string
    keyLabel: string
    outputLabel: string
    optionsLabel: string
    stepTrace: string
  }
  docs: {
    title: string
    searchPlaceholder: string
    readingTime: string
    difficulty: string
    prerequisites: string
  }
  footer: {
    copyright: string
    rights: string
    github: string
  }
}
