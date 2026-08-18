import { describe, expect, it } from 'vitest'
import { createStepperState, stepNext, stepPrevious, visibleSteps } from '@/lib/attacks/interactiveStepper'

describe('interactive attack stepper', () => {
  it('moves forward/backward without recomputing attack state', () => {
    let state = createStepperState()
    state = stepNext(state, 3)
    expect(state.cursor).toBe(0)
    state = stepNext(state, 3)
    expect(state.cursor).toBe(1)
    state = stepPrevious(state)
    expect(state.cursor).toBe(0)
    expect(visibleSteps([{id:'a',kind:'query',label:'a',detail:'a'},{id:'b',kind:'query',label:'b',detail:'b'}], state.cursor)).toHaveLength(1)
  })
  it('clamps at both ends', () => {
    expect(stepPrevious(createStepperState()).cursor).toBe(-1)
    expect(stepNext(createStepperState(), 0).cursor).toBe(-1)
    expect(stepNext({cursor: 2,playing:false}, 3).cursor).toBe(2)
  })
})
