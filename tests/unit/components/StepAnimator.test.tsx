import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import StepAnimator from '../../../components/cipher/StepAnimator'
import type { CipherStep } from '../../../lib/cipher/types'

function makeSteps(count: number, milestoneIndexes: number[] = []): CipherStep[] {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    label: milestoneIndexes.includes(i) ? `Round ${i + 1}` : `Step ${i + 1}`,
    inputState: `in-${i}`,
    outputState: `out-${i}`,
    note: `note ${i}`,
    isMilestone: milestoneIndexes.includes(i),
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
  return {
    mql,
    listeners,
    emitChange: (next: boolean) =>
      listeners.forEach((cb) => cb({ matches: next } as MediaQueryListEvent)),
  }
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
      <StepAnimator steps={[]} currentStep={0} onStepChange={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the current step label and progress percentage', () => {
    render(<StepAnimator steps={makeSteps(4)} currentStep={1} onStepChange={vi.fn()} />)
    expect(screen.getByText('Step 2')).toBeInTheDocument()
    expect(screen.getByText(/33%/)).toBeInTheDocument()
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

  it('jumps to the last step when Jump to end is clicked', () => {
    const onStepChange = vi.fn()
    render(<StepAnimator steps={makeSteps(5)} currentStep={0} onStepChange={onStepChange} />)
    fireEvent.click(screen.getByLabelText('Jump to end'))
    expect(onStepChange).toHaveBeenCalledWith(4)
  })

  it('renders milestone markers at the correct percentage positions', () => {
    render(
      <StepAnimator
        steps={makeSteps(11, [0, 5, 10])}
        currentStep={0}
        onStepChange={vi.fn()}
      />,
    )

    expect(screen.getByTestId('milestone-marker-0')).toHaveStyle({ left: '0%' })
    expect(screen.getByTestId('milestone-marker-5')).toHaveStyle({ left: '50%' })
    expect(screen.getByTestId('milestone-marker-10')).toHaveStyle({ left: '100%' })
  })

  it('jumps directly to a milestone when its chip is clicked', () => {
    const onStepChange = vi.fn()
    render(
      <StepAnimator
        steps={makeSteps(8, [0, 3, 7])}
        currentStep={1}
        onStepChange={onStepChange}
      />,
    )

    fireEvent.click(screen.getByLabelText('Jump to milestone: Round 4'))
    expect(onStepChange).toHaveBeenCalledWith(3)
  })

  it('moves to the next and previous milestones with keyboard shortcuts', () => {
    const onStepChange = vi.fn()
    render(
      <StepAnimator
        steps={makeSteps(8, [0, 3, 7])}
        currentStep={1}
        onStepChange={onStepChange}
      />,
    )

    fireEvent.keyDown(window, { key: ']' })
    expect(onStepChange).toHaveBeenCalledWith(3)

    fireEvent.keyDown(window, { key: '[', shiftKey: false })
    expect(onStepChange).toHaveBeenCalledWith(0)
  })

  it('supports Shift + ArrowLeft and Shift + ArrowRight for milestone navigation', () => {
    const onStepChange = vi.fn()
    render(
      <StepAnimator
        steps={makeSteps(8, [0, 3, 7])}
        currentStep={1}
        onStepChange={onStepChange}
      />,
    )

    fireEvent.keyDown(window, { key: 'ArrowRight', shiftKey: true })
    expect(onStepChange).toHaveBeenCalledWith(3)

    fireEvent.keyDown(window, { key: 'ArrowLeft', shiftKey: true })
    expect(onStepChange).toHaveBeenCalledWith(0)
  })

  it('shows the current phase badge', () => {
    render(
      <StepAnimator
        steps={makeSteps(8, [0, 3, 7])}
        currentStep={5}
        onStepChange={vi.fn()}
      />,
    )

    expect(screen.getByTestId('phase-badge')).toHaveTextContent('Phase: Round 4')
  })

  it('hides the milestone navigation when there are no milestones', () => {
    render(<StepAnimator steps={makeSteps(4)} currentStep={1} onStepChange={vi.fn()} />)
    expect(screen.queryByTestId('milestone-track')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Jump to milestone')).not.toBeInTheDocument()
  })

  it('does not crash for a single-step trace', () => {
    render(
      <StepAnimator
        steps={makeSteps(1, [0])}
        currentStep={0}
        onStepChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Step 1 / 1 (100%)')).toBeInTheDocument()
    expect(screen.queryByTestId('milestone-track')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Play')).toBeDisabled()
  })

  it('auto-advances while playing at the selected speed', () => {
    const onStepChange = vi.fn()
    const { rerender } = render(
      <StepAnimator steps={makeSteps(3)} currentStep={0} onStepChange={onStepChange} />,
    )

    fireEvent.click(screen.getByLabelText('Play'))
    fireEvent.change(screen.getByLabelText('Animation speed'), {
      target: { value: '2' },
    })

    act(() => {
      vi.advanceTimersByTime(750)
    })
    expect(onStepChange).toHaveBeenCalledWith(1)

    rerender(
      <StepAnimator steps={makeSteps(3)} currentStep={1} onStepChange={onStepChange} />,
    )

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

  it('ignores keyboard shortcuts when focus is inside a text input', () => {
    const onStepChange = vi.fn()
    render(
      <div>
        <input data-testid="cipher-input" />
        <StepAnimator steps={makeSteps(3)} currentStep={0} onStepChange={onStepChange} />
      </div>,
    )

    const input = screen.getByTestId('cipher-input')
    input.focus()
    fireEvent.keyDown(input, { key: ']' })
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
