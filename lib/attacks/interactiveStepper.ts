export type StepperStatus = 'unknown' | 'testing' | 'recovered'

export interface InteractiveByte {
  index: number
  value?: number
  status: StepperStatus
  guess?: number
}

export interface InteractiveAttackStep {
  id: string
  kind: 'query' | 'lookup' | 'derivation' | 'result'
  label: string
  detail: string
  status?: 'valid' | 'invalid' | 'match' | 'info'
  byteIndex?: number
  guess?: number
  recoveredByte?: number
  formula?: string
  memory?: InteractiveByte[]
}

export interface StepperState {
  cursor: number
  playing: boolean
}

export function createStepperState(): StepperState {
  return { cursor: -1, playing: false }
}

export function stepNext(state: StepperState, length: number): StepperState {
  return { ...state, cursor: Math.min(length - 1, state.cursor + 1) }
}

export function stepPrevious(state: StepperState): StepperState {
  return { ...state, cursor: Math.max(-1, state.cursor - 1) }
}

export function visibleSteps(steps: InteractiveAttackStep[], cursor: number) {
  return cursor < 0 ? [] : steps.slice(0, cursor + 1)
}

export function buildByteMemory(recovered: Uint8Array, testingIndex = -1, testingGuess?: number): InteractiveByte[] {
  return Array.from({ length: recovered.length }, (_, index) => {
    const value = recovered[index]
    return {
      index,
      value: value || undefined,
      status: value ? 'recovered' : index === testingIndex ? 'testing' : 'unknown',
      guess: index === testingIndex ? testingGuess : undefined,
    }
  })
}
