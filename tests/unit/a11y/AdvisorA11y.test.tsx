import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'jest-axe'
import QuestionCard from '../../../components/advisor/QuestionCard'
import DecisionTree from '../../../components/advisor/DecisionTree'
import { QuestionNode } from '../../../lib/advisor/treeData'

const mockQuestionNode: QuestionNode = {
  id: 'test_node',
  type: 'question',
  question: 'What is your primary requirement?',
  description: 'Select the option that best describes your project goals.',
  options: [
    { id: 'opt_1', label: 'Speed & High Throughput', summary: 'Speed', nextId: 'rec_speed' },
    { id: 'opt_2', label: 'Strong Security Standards', summary: 'Security', nextId: 'rec_security' },
    { id: 'opt_3', label: 'Lightweight & Hardware-friendly', summary: 'Lightweight', nextId: 'rec_light' },
  ],
}

describe('Advisor Accessibility & Keyboard Navigation', () => {
  it('has no axe-core violations in QuestionCard', async () => {
    const { container } = render(
      <QuestionCard node={mockQuestionNode} onAnswer={() => {}} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('navigates option buttons with ArrowDown and ArrowUp keys', () => {
    const handleAnswer = vi.fn()
    render(<QuestionCard node={mockQuestionNode} onAnswer={handleAnswer} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)

    act(() => buttons[0].focus())
    expect(buttons[0]).toHaveFocus()

    fireEvent.keyDown(buttons[0], { key: 'ArrowDown' })
    expect(buttons[1]).toHaveFocus()

    fireEvent.keyDown(buttons[1], { key: 'ArrowDown' })
    expect(buttons[2]).toHaveFocus()

    fireEvent.keyDown(buttons[2], { key: 'ArrowUp' })
    expect(buttons[1]).toHaveFocus()
  })

  it('has no axe-core violations in full DecisionTree component', async () => {
    const { container } = render(<DecisionTree />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
