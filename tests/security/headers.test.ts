import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('Security headers configuration (vercel.json)', () => {
  const vercelConfig = JSON.parse(
    readFileSync(resolve(__dirname, '../../vercel.json'), 'utf-8')
  )

  const headers = vercelConfig.headers[0].headers as Array<{ key: string; value: string }>

  function getHeader(name: string): string | undefined {
    return headers.find(
      (h) => h.key.toLowerCase() === name.toLowerCase()
    )?.value
  }

  it('defines a Content-Security-Policy header', () => {
    const cspHeader = getHeader('Content-Security-Policy')
    expect(cspHeader).toBeDefined()
  })

  it('does not allow unsafe-inline scripts in script-src-elem', () => {
    const cspHeader = getHeader('Content-Security-Policy')!
    const scriptSrcElem = cspHeader
      .split(';')
      .map((d: string) => d.trim())
      .find((d: string) => d.startsWith('script-src-elem '))

    expect(scriptSrcElem).toBeDefined()
    expect(scriptSrcElem).toContain("'self'")
    expect(scriptSrcElem).not.toContain("'unsafe-inline'")
  })

  it('restricts worker-src to self and blob (required for cipher.worker.ts)', () => {
    const cspHeader = getHeader('Content-Security-Policy')!
    expect(cspHeader).toContain("worker-src 'self' blob:")
  })

  it('sets frame-ancestors to none (clickjacking protection)', () => {
    const cspHeader = getHeader('Content-Security-Policy')!
    expect(cspHeader).toContain("frame-ancestors 'none'")
  })

  it('sets object-src to none', () => {
    const cspHeader = getHeader('Content-Security-Policy')!
    expect(cspHeader).toContain("object-src 'none'")
  })

  it('configures standard security headers', () => {
    expect(getHeader('X-Frame-Options')).toBe('DENY')
    expect(getHeader('X-Content-Type-Options')).toBe('nosniff')
    expect(getHeader('Strict-Transport-Security')).toContain('max-age=63072000')
    expect(getHeader('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(getHeader('Cross-Origin-Opener-Policy')).toBe('same-origin')
    expect(getHeader('Cross-Origin-Resource-Policy')).toBe('same-origin')
    expect(getHeader('Permissions-Policy')).toContain('camera=()')
  })
})

