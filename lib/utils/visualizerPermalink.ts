export const STEP_QUERY_PARAM = 'step'

export const VISUALIZER_PERMALINK_MAX_LENGTH = 4096

export interface VisualizerPermalinkState {
  input: string
  key: string
  direction: 'encrypt' | 'decrypt'
  step: number
  options: {
    hexInput?: boolean
    rounds?: number
    demoMode?: boolean
    bobSecret?: string
    padding?: boolean
    aesMode?: string
    autoCompute?: boolean
    [key: string]: unknown
  }
}

export interface ParsedVisualizerPermalink {
  input?: string
  key?: string
  direction?: 'encrypt' | 'decrypt'
  step?: number
  options: {
    hexInput?: boolean
    rounds?: number
    demoMode?: boolean
    bobSecret?: string
    padding?: boolean
    aesMode?: string
    autoCompute?: boolean
    [key: string]: unknown
  }
}

function parseBoolean(value: string | null): boolean | undefined {
  if (value === '1' || value === 'true') return true
  if (value === '0' || value === 'false') return false
  return undefined
}

function parseInteger(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

function sanitizePermalinkText(value: string | null): string {
  if (value === null) return ''

  return sanitizeCryptoInput(value, {
    maxLength: VISUALIZER_PERMALINK_MAX_LENGTH,
    allowNewlines: false,
    trim: true,
    collapseWhitespace: true,
  }).value
}

import { sanitizeCryptoInput } from '@/lib/security/inputSanitization'

export function clampStepIndex(index: number, stepCount: number): number {
  if (!Number.isFinite(index) || stepCount <= 0) return 0
  return Math.min(Math.max(Math.trunc(index), 0), stepCount - 1)
}

export function parseVisualizerPermalink(
  search: string,
): ParsedVisualizerPermalink {
  const params = new URLSearchParams(search)
  const direction = params.get('direction')
  const rawStep = parseInteger(params.get(STEP_QUERY_PARAM))
  const rawRounds = parseInteger(params.get('rounds'))

  const options: Record<string, unknown> = {
    hexInput: parseBoolean(params.get('hexInput')),
    rounds:
      rawRounds === undefined
        ? undefined
        : Math.min(Math.max(rawRounds, 4), 31),
    demoMode: parseBoolean(params.get('demoMode')),
    bobSecret: params.has('bobSecret')
      ? sanitizePermalinkText(params.get('bobSecret'))
      : undefined,
    padding: parseBoolean(params.get('padding')),
    aesMode: params.has('aesMode')
      ? sanitizePermalinkText(params.get('aesMode'))
      : undefined,
    autoCompute: parseBoolean(params.get('autoCompute')),
  }

  // Parse any additional dynamic query params into options
  const knownKeys = new Set([
    'input',
    'key',
    'direction',
    STEP_QUERY_PARAM,
    'hexInput',
    'rounds',
    'demoMode',
    'bobSecret',
    'padding',
    'aesMode',
    'autoCompute',
  ])

  for (const [k, v] of params.entries()) {
    if (!knownKeys.has(k)) {
      const boolVal = parseBoolean(v)
      if (boolVal !== undefined) {
        options[k] = boolVal
      } else {
        const numVal = parseInteger(v)
        if (numVal !== undefined && String(numVal) === v.trim()) {
          options[k] = numVal
        } else {
          options[k] = sanitizePermalinkText(v)
        }
      }
    }
  }

  return {
    input: params.has('input')
      ? sanitizePermalinkText(params.get('input'))
      : undefined,
    key: params.has('key')
      ? sanitizePermalinkText(params.get('key'))
      : undefined,
    direction:
      direction === 'encrypt' || direction === 'decrypt'
        ? direction
        : undefined,
    step:
      rawStep === undefined ? undefined : Math.max(Math.trunc(rawStep), 0),
    options,
  }
}

export function buildVisualizerPermalink(
  currentUrl: string,
  state: VisualizerPermalinkState,
): string {
  const url = new URL(currentUrl)
  url.searchParams.set('input', state.input)
  url.searchParams.set('key', state.key)
  url.searchParams.set('direction', state.direction)
  url.searchParams.set(STEP_QUERY_PARAM, String(Math.max(0, state.step)))

  for (const [key, value] of Object.entries(state.options)) {
    if (value === undefined) continue
    if (typeof value === 'boolean') {
      url.searchParams.set(key, value ? '1' : '0')
    } else {
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

export function updateStepInCurrentUrl(
  currentUrl: string,
  step: number | null,
): string {
  const url = new URL(currentUrl)

  if (step === null) {
    url.searchParams.delete(STEP_QUERY_PARAM)
  } else {
    url.searchParams.set(STEP_QUERY_PARAM, String(Math.max(0, step)))
  }

  return `${url.pathname}${url.search}${url.hash}`
}
