import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import QuizComponent from '@/components/learning-paths/QuizComponent'
import PathCard from '@/components/learning-paths/PathCard'
import { LEARNING_PATHS } from '@/lib/learning-paths/data'

describe('QuizComponent', () => {
  const sampleQuiz = [
    {
      id: 'test-q1',
      question: 'What is the goal of confidentiality?',
      options: ['Prevent unauthorized disclosure', 'Ensure availability', 'Compress text', 'Format data'],
      correctAnswer: 0,
      explanation: 'Confidentiality ensures that information remains accessible only to authorized entities.',
    },
  ]

  it('renders question and option choices', () => {
    render(<QuizComponent quiz={sampleQuiz} />)
    expect(screen.getByText('What is the goal of confidentiality?')).toBeInTheDocument()
    expect(screen.getByText('Prevent unauthorized disclosure')).toBeInTheDocument()
  })

  it('evaluates submitted answer and calls onComplete callback', () => {
    const handleComplete = vi.fn()
    render(<QuizComponent quiz={sampleQuiz} onComplete={handleComplete} />)

    fireEvent.click(screen.getByText('Prevent unauthorized disclosure'))
    fireEvent.click(screen.getByText('Submit Quiz Answers'))

    expect(handleComplete).toHaveBeenCalledWith(100)
    expect(screen.getByText(/Confidentiality ensures that information/)).toBeInTheDocument()
  })
})

describe('PathCard Component', () => {
  it('renders learning path title and progress percentage', () => {
    const samplePath = LEARNING_PATHS[0]
    render(<PathCard path={samplePath} progressPercentage={50} isCompleted={false} />)

    expect(screen.getByText(samplePath.title)).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })
})
