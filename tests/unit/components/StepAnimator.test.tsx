import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import StepAnimator from '../../../components/cipher/StepAnimator'
import type { CipherStep } from '../../../lib/cipher/types'

function makeSteps(count: number): CipherStep[] {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    label: `Step ${i + 1}`,
    inputState: `in-${i}`,
    outputState: `out-${i}`,
    note: `note ${i}`,
  }))
}

function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []
  const mql = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql))
  return { mql, listeners, emitChange: (next: boolean) => listeners.forEach((cb) => cb({ matches: next } as MediaQueryListEvent)) }
}

describe('StepAnimator', () => {
  beforeEach(() => {
    mockMatchMedia(false)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('renders nothing when there are no steps', () => {
    const { container } = render(
      <StepAnimator steps={[]} currentStep={0} onStepChange={vi.fn()} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the current step label and progress percentage', () => {
    render(<StepAnimator steps={makeSteps(4)} currentStep={1} onStepChange={vi.fn()} />)
    expect(screen.getByText('Step 2')).toBeInTheDocument()
    expect(screen.getByText('33%')).toBeInTheDocument()
  })

  it('calls onStepChange with the next index when Next is clicked', () => {
    const onStepChange = vi.fn()
    render(<StepAnimator steps={makeSteps(3)} currentStep={0} onStepChange={onStepChange} />)
    fireEvent.click(screen.getByLabelText('Next step'))
    expect(onStepChange).toHaveBeenCalledWith(1)
  })

  it('calls onStepChange with the previous index when Previous is clicked', () => {
    const onStepChange = vi.fn()
    render(<StepAnimator steps={makeSteps(3)} currentStep={2} onStepChange={onStepChange} />)
    fireEvent.click(screen.getByLabelText('Previous step'))
    expect(onStepChange).toHaveBeenCalledWith(1)
  })

  it('restarts to step 0 when Restart is clicked', () => {
    const onStepChange = vi.fn()
    render(<StepAnimator steps={makeSteps(5)} currentStep={3} onStepChange={onStepChange} />)
    fireEvent.click(screen.getByLabelText('Restart'))
    expect(onStepChange).toHaveBeenCalledWith(0)
  })

  it('jumps to the last step when Jump to end is clicked', () => {
    const onStepChange = vi.fn()
    render(<StepAnimator steps={makeSteps(5)} currentStep={0} onStepChange={onStepChange} />)
    fireEvent.click(screen.getByLabelText('Jump to end'))
    expect(onStepChange).toHaveBeenCalledWith(4)
  })

  it('auto-advances while playing at the selected speed', () => {
    const onStepChange = vi.fn()
    const { rerender } = render(
      <StepAnimator steps={makeSteps(3)} currentStep={0} onStepChange={onStepChange} />
    )

    fireEvent.click(screen.getByLabelText('Play'))
    fireEvent.click(screen.getByTitle('2x speed'))

    act(() => {
      vi.advanceTimersByTime(750) // 1500ms / 2x
    })
    expect(onStepChange).toHaveBeenCalledWith(1)

    rerender(<StepAnimator steps={makeSteps(3)} currentStep={1} onStepChange={onStepChange} />)
    act(() => {
      vi.advanceTimersByTime(750)
    })
    expect(onStepChange).toHaveBeenCalledWith(2)
  })

  it('toggles play/pause with the Space key', () => {
    const onStepChange = vi.fn()
    render(<StepAnimator steps={makeSteps(3)} currentStep={0} onStepChange={onStepChange} />)

    fireEvent.keyDown(window, { key: ' ' })
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(onStepChange).toHaveBeenCalledWith(1)
  })

  it('steps forward and backward with arrow keys', () => {
    const onStepChange = vi.fn()
    render(<StepAnimator steps={makeSteps(3)} currentStep={1} onStepChange={onStepChange} />)

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onStepChange).toHaveBeenCalledWith(2)

    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(onStepChange).toHaveBeenCalledWith(0)
  })

  it('restarts with the R and Home keys', () => {
    const onStepChange = vi.fn()
    render(<StepAnimator steps={makeSteps(5)} currentStep={3} onStepChange={onStepChange} />)

    fireEvent.keyDown(window, { key: 'r' })
    expect(onStepChange).toHaveBeenCalledWith(0)

    fireEvent.keyDown(window, { key: 'Home' })
    expect(onStepChange).toHaveBeenCalledTimes(2)
  })

  it('ignores keyboard shortcuts when focus is inside a text input', () => {
    const onStepChange = vi.fn()
    render(
      <div>
        <input data-testid="cipher-input" />
        <StepAnimator steps={makeSteps(3)} currentStep={0} onStepChange={onStepChange} />
      </div>
    )

    const input = screen.getByTestId('cipher-input')
    input.focus()
    fireEvent.keyDown(input, { key: 'ArrowRight' })
    expect(onStepChange).not.toHaveBeenCalled()
  })

  it('jumps straight to the last step on Play when reduced motion is preferred', () => {
    mockMatchMedia(true)
    const onStepChange = vi.fn()
    render(<StepAnimator steps={makeSteps(4)} currentStep={0} onStepChange={onStepChange} />)

    fireEvent.click(screen.getByLabelText('Play'))
    expect(onStepChange).toHaveBeenCalledWith(3)
  })

  it('stops playback if reduced motion turns on mid-play', () => {
    const { emitChange } = mockMatchMedia(false)
    const onStepChange = vi.fn()
    render(<StepAnimator steps={makeSteps(4)} currentStep={0} onStepChange={onStepChange} />)

    fireEvent.click(screen.getByLabelText('Play'))
    expect(screen.getByLabelText('Pause')).toBeInTheDocument()

    act(() => {
      emitChange(true)
    })

    expect(screen.getByLabelText('Play')).toBeInTheDocument()

    // Timer ticks should no longer advance steps once paused.
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(onStepChange).not.toHaveBeenCalled()
  })

  it('disables playback controls when there is only one step', () => {
    render(<StepAnimator steps={makeSteps(1)} currentStep={0} onStepChange={vi.fn()} />)
    expect(screen.getByLabelText('Play')).toBeDisabled()
  })
})
