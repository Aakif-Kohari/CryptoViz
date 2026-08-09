import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { generatePrecacheList } from '../../../scripts/generate-sw-precache.mjs'

describe('Service Worker Precache Generator', () => {
  it('discovers routes dynamically from app directory', () => {
    const precacheList = generatePrecacheList()
    expect(precacheList).toBeInstanceOf(Array)
    expect(precacheList.length).toBeGreaterThan(10)

    // Verify key routes exist in generated list
    expect(precacheList).toContain('/')
    expect(precacheList).toContain('/offline/')
    expect(precacheList).toContain('/docs/')
    expect(precacheList).toContain('/resources/')
    expect(precacheList).toContain('/benchmark/')
    expect(precacheList).toContain('/cipher-sandbox/')
    expect(precacheList).toContain('/visualizer/caesar/')
  })

  it('verifies public/sw.js contains auto-generated precache list', () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js')
    expect(fs.existsSync(swPath)).toBe(true)

    const content = fs.readFileSync(swPath, 'utf8')
    expect(content).toContain('CryptoViz Service Worker (Auto-Generated Precache)')
    expect(content).toContain('PRECACHE_URLS')
    expect(content).toContain('/visualizer/caesar/')
  })
})
