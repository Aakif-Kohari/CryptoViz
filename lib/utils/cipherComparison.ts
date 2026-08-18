
import type { CipherDefinition } from '../cipher/registry'
import type { CipherDirection, CipherOptions, Encoding } from '../cipher/types'

export interface ComparisonSelection {
  leftCipherId: string
  rightCipherId: string
}
export interface ComparisonPanelState {
  cipherId: string
  direction: CipherDirection
  key: string
  options: Record<string, string | number | boolean>
}
export interface CipherWorkerOptions extends CipherOptions {
  instrument: true
  hexInput?: boolean
  rounds?: number
  mode?: 'real' | 'demo'
  bobSecret?: string
}
export interface ComparisonStep {
  index: number
  left: number
  right: number
  leftLabel?: string
  rightLabel?: string
}
export function getSupportedDirections(cipher: CipherDefinition): CipherDirection[] {
  if (cipher.category === 'hash' || cipher.id === 'dh') return ['encrypt']
  return ['encrypt', 'decrypt']
}
export function normalizeComparisonDirection(cipher: CipherDefinition, direction: CipherDirection): CipherDirection {
  return getSupportedDirections(cipher).includes(direction) ? direction : 'encrypt'
}
export function createDefaultComparisonPanelState(cipher: CipherDefinition): ComparisonPanelState {
  const options: Record<string, string | number | boolean> = {}
  for (const option of cipher.options ?? []) {
    if (typeof option.default === 'string' || typeof option.default === 'number' || typeof option.default === 'boolean') {
      options[option.id] = option.default
    }
  }
  return { cipherId: cipher.id, direction: 'encrypt', key: cipher.defaultKey, options }
}
export function swapComparisonSelection(selection: ComparisonSelection): ComparisonSelection {
  return { leftCipherId: selection.rightCipherId, rightCipherId: selection.leftCipherId }
}
type CipherOptionHandler = (options: Record<string, string | number | boolean>) => Partial<CipherWorkerOptions>
const handleHexInputOptions: CipherOptionHandler = (options) => ({
  hexInput: typeof options.hexInput === 'boolean' ? options.hexInput : true,
})
export const CIPHER_WORKER_OPTION_HANDLERS: Record<string, CipherOptionHandler> = {
  des: handleHexInputOptions, '3des': handleHexInputOptions, aes: handleHexInputOptions,
  bcrypt: (options) => ({ rounds: typeof options.rounds === 'number' ? options.rounds : 4 }),
  rsa: (options) => ({ mode: options.demoMode === false ? 'real' : 'demo' }),
  dh: (options) => ({ mode: 'demo', bobSecret: typeof options.bobSecret === 'string' ? options.bobSecret : '15' }),
}
export function createCipherWorkerOptions(cipher: CipherDefinition, options: Record<string, string | number | boolean>): CipherWorkerOptions {
  const handler = CIPHER_WORKER_OPTION_HANDLERS[cipher.id]
  return { instrument: true, ...(handler ? handler(options) : {}) }
}
export function synchronizeComparisonSteps(leftCount: number, rightCount: number): ComparisonStep[] {
  const max = Math.max(leftCount, rightCount)
  return Array.from({ length: max }, (_, index) => ({
    index,
    left: leftCount ? Math.min(index, leftCount - 1) : -1,
    right: rightCount ? Math.min(index, rightCount - 1) : -1,
  }))
}
