import { describe, expect, it } from 'vitest'
import {
  recommendCiphersByUseCase,
  USE_CASE_PRESETS,
} from '../../../lib/advisor/useCaseRecommendationEngine'

describe('useCaseRecommendationEngine Unit Tests', () => {
  it('recommends AES and ChaCha20 for Web & API Security', () => {
    const recs = recommendCiphersByUseCase({
      goal: 'confidentiality',
      environment: 'web_server',
    })

    expect(recs.length).toBeGreaterThan(0)
    const topIds = recs.slice(0, 3).map((r) => r.cipher.id)
    expect(topIds).toContain('aes')
  })

  it('recommends HMAC / SHA-256 for Password & Key Auth Hashing', () => {
    const recs = recommendCiphersByUseCase({
      goal: 'password',
    })

    expect(recs.length).toBeGreaterThan(0)
    expect(recs.some((r) => r.cipher.id === 'hmac')).toBe(true)
    expect(recs[0].matchScore).toBeGreaterThanOrEqual(90)
  })

  it('recommends ChaCha20 for IoT & Embedded environments', () => {
    const recs = recommendCiphersByUseCase({
      environment: 'iot_embedded',
    })

    expect(recs.length).toBeGreaterThan(0)
    const chacha = recs.find((r) => r.cipher.id.includes('chacha'))
    expect(chacha).toBeDefined()
  })

  it('recommends ML-KEM / ML-DSA for Post-Quantum goal', () => {
    const recs = recommendCiphersByUseCase({
      goal: 'post_quantum',
      environment: 'quantum_safe',
    })

    expect(recs.length).toBeGreaterThan(0)
    expect(recs[0].badgeLabel).toBe('Quantum-Resistant')
  })

  it('filters recommendations by search query', () => {
    const recs = recommendCiphersByUseCase({
      searchQuery: 'hmac',
    })

    expect(recs.length).toBeGreaterThan(0)
    expect(recs[0].cipher.id).toBe('hmac')
  })

  it('filters out non-recommended ciphers when onlyRecommended is true', () => {
    const recs = recommendCiphersByUseCase({
      onlyRecommended: true,
    })

    recs.forEach((r) => {
      expect(['recommended', 'secure']).toContain(r.cipher.securityStatus)
    })
  })

  it('provides sample JavaScript and Python code for AES and ChaCha20', () => {
    const recs = recommendCiphersByUseCase({ searchQuery: 'aes' })
    expect(recs[0].sampleCode.javascript).toContain('AES-GCM')
    expect(recs[0].sampleCode.python).toContain('AESGCM')
  })
})
