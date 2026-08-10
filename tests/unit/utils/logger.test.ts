import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '../../../lib/utils/logger'

describe('Logger Utility', () => {
  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('delegates to console methods in development mode', () => {
    logger.log('test log')
    expect(consoleLogSpy).toHaveBeenCalledWith('test log')

    logger.info('test info')
    expect(consoleInfoSpy).toHaveBeenCalledWith('test info')

    logger.warn('test warn')
    expect(consoleWarnSpy).toHaveBeenCalledWith('test warn')

    logger.error('test error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('test error')
  })
})
