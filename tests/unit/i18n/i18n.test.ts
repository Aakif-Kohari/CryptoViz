import { describe, it, expect } from 'vitest'
import { en } from '../../../lib/i18n/locales/en'
import { es } from '../../../lib/i18n/locales/es'
import { fr } from '../../../lib/i18n/locales/fr'
import { de } from '../../../lib/i18n/locales/de'
import { hi } from '../../../lib/i18n/locales/hi'
import { zh } from '../../../lib/i18n/locales/zh'
import { SUPPORTED_LOCALES } from '../../../lib/i18n/types'

describe('Localization Framework (i18n)', () => {
  it('defines 6 supported locales', () => {
    expect(SUPPORTED_LOCALES).toHaveLength(6)
    const codes = SUPPORTED_LOCALES.map((l) => l.code)
    expect(codes).toEqual(['en', 'es', 'fr', 'de', 'hi', 'zh'])
  })

  it('contains complete dictionary keys for all supported locales', () => {
    const dicts = [en, es, fr, de, hi, zh]

    dicts.forEach((dict) => {
      expect(dict.common.title).toBe('CryptoViz')
      expect(dict.common.encrypt).toBeTruthy()
      expect(dict.common.decrypt).toBeTruthy()
      expect(dict.nav.playground).toBeTruthy()
      expect(dict.nav.docs).toBeTruthy()
      expect(dict.playground.title).toBeTruthy()
      expect(dict.docs.title).toBeTruthy()
      expect(dict.footer.copyright).toBeTruthy()
    })
  })

  it('contains template parameter placeholders in stepOfTotal', () => {
    expect(en.common.stepOfTotal).toContain('{step}')
    expect(en.common.stepOfTotal).toContain('{total}')
    expect(es.common.stepOfTotal).toContain('{step}')
    expect(es.common.stepOfTotal).toContain('{total}')
    expect(fr.common.stepOfTotal).toContain('{step}')
    expect(fr.common.stepOfTotal).toContain('{total}')
  })
})
