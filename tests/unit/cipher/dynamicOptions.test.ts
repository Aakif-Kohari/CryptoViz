import { describe, expect, it } from 'vitest'
import { CIPHER_REGISTRY } from '@/lib/cipher/registry'
import { parseVisualizerPermalink, buildVisualizerPermalink } from '@/lib/utils/visualizerPermalink'

describe('Dynamic Cipher Options Schema & Permalink Integration', () => {
  it('defines valid options schema for configurable ciphers in registry', () => {
    const ciphersWithOptions = CIPHER_REGISTRY.filter((c) => c.options && c.options.length > 0)
    expect(ciphersWithOptions.length).toBeGreaterThan(0)

    for (const cipher of ciphersWithOptions) {
      for (const opt of cipher.options!) {
        expect(opt.id).toBeDefined()
        expect(opt.name).toBeDefined()
        expect(['boolean', 'number', 'text', 'select']).toContain(opt.type)
        expect(opt.default).toBeDefined()
        if (opt.type === 'select') {
          expect(Array.isArray(opt.choices)).toBe(true)
          expect(opt.choices!.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('correctly serializes and parses arbitrary dynamic cipher options in permalinks', () => {
    const testState = {
      input: 'custom-input',
      key: 'custom-key',
      direction: 'encrypt' as const,
      step: 3,
      options: {
        memoryCost: 65536,
        timeCost: 4,
        parallelism: 2,
        hash: 'SHA-512',
        demoMode: false,
      },
    }

    const permalink = buildVisualizerPermalink('https://cryptoviz.dev/visualizer/argon2', testState)
    const parsed = parseVisualizerPermalink(new URL(permalink).search)

    expect(parsed.input).toBe('custom-input')
    expect(parsed.key).toBe('custom-key')
    expect(parsed.direction).toBe('encrypt')
    expect(parsed.step).toBe(3)
    expect(parsed.options.memoryCost).toBe(65536)
    expect(parsed.options.timeCost).toBe(4)
    expect(parsed.options.parallelism).toBe(2)
    expect(parsed.options.hash).toBe('SHA-512')
    expect(parsed.options.demoMode).toBe(false)
  })
})
