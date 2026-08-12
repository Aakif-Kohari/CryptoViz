import { describe, expect, it } from 'vitest'
import {
  VISUALIZER_PERMALINK_MAX_LENGTH,
  parseVisualizerPermalink,
} from '@/lib/utils/visualizerPermalink'

describe('parseVisualizerPermalink security boundary', () => {
  it('neutralizes HTML/script payloads in input, key, bobSecret, and aesMode', () => {
    const payload = '<img src=x onerror=alert(1)>'
    const result = parseVisualizerPermalink(
      `?input=${encodeURIComponent(payload)}&key=${encodeURIComponent(payload)}&bobSecret=${encodeURIComponent(payload)}&aesMode=${encodeURIComponent(payload)}`,
    )

    expect(result.input).not.toContain('<')
    expect(result.input).not.toContain('>')
    expect(result.input).not.toContain('onerror=')
    expect(result.key).not.toContain('<')
    expect(result.key).not.toContain('>')
    expect(result.options.bobSecret).not.toContain('<')
    expect(result.options.aesMode).not.toContain('<')
    expect(result.input).toContain('&lt;')
  })

  it('enforces the 4096-character limit on parsed text values', () => {
    const oversized = 'A'.repeat(VISUALIZER_PERMALINK_MAX_LENGTH + 500)
    const result = parseVisualizerPermalink(
      `?input=${encodeURIComponent(oversized)}&key=${encodeURIComponent(oversized)}&bobSecret=${encodeURIComponent(oversized)}`,
    )

    expect(result.input).toHaveLength(VISUALIZER_PERMALINK_MAX_LENGTH)
    expect(result.key).toHaveLength(VISUALIZER_PERMALINK_MAX_LENGTH)
    expect(result.options.bobSecret).toHaveLength(
      VISUALIZER_PERMALINK_MAX_LENGTH,
    )
  })

  it('removes control characters and normalizes whitespace', () => {
    const result = parseVisualizerPermalink(
      `?input=${encodeURIComponent('  hello\\n\\tworld  ')}`,
    )

    expect(result.input).toBe('hello world')
  })

  it('keeps controlled non-text parameters constrained', () => {
    const result = parseVisualizerPermalink(
      '?direction=javascript%3Aalert(1)&step=-9&rounds=999',
    )

    expect(result.direction).toBeUndefined()
    expect(result.step).toBe(0)
    expect(result.options.rounds).toBe(31)
  })
})
