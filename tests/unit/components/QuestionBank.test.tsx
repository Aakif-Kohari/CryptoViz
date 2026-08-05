import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { QUESTION_BANK } from '@/lib/challenge/questionBank'
import { getQuestionBankStats, getFilteredQuestionBank } from '@/lib/challenge/generator'
import QuestionBankQuiz from '@/components/challenge/QuestionBankQuiz'

describe('Challenge Question Bank Module (Issue #480)', () => {
  it('contains over 300 total questions across all categories and difficulties', () => {
    const stats = getQuestionBankStats()
    expect(stats.total).toBeGreaterThanOrEqual(300)

    expect(stats.categories.classical).toBeGreaterThan(0)
    expect(stats.categories.symmetric).toBeGreaterThan(0)
    expect(stats.categories.asymmetric).toBeGreaterThan(0)
    expect(stats.categories.hash).toBeGreaterThan(0)
    expect(stats.categories.attacks).toBeGreaterThan(0)

    expect(stats.difficulties.easy).toBeGreaterThan(0)
    expect(stats.difficulties.medium).toBeGreaterThan(0)
    expect(stats.difficulties.hard).toBeGreaterThan(0)
  })

  it('filters questions accurately by category and difficulty', () => {
    const classicalEasy = getFilteredQuestionBank('classical', 'easy')
    expect(classicalEasy.length).toBeGreaterThan(0)
    classicalEasy.forEach((q) => {
      expect(q.category).toBe('classical')
      expect(q.difficulty).toBe('easy')
    })
  })

  it('renders QuestionBankQuiz component with stats and options', () => {
    render(<QuestionBankQuiz />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Expanded Cryptography Question Bank',
    )
    expect(screen.getByText('300+ QUESTION BANK')).toBeInTheDocument()
    expect(screen.getByLabelText('Search questions')).toBeInTheDocument()
  })

  it('filters QuestionBankQuiz by category tabs', () => {
    render(<QuestionBankQuiz />)

    const symmetricTab = screen.getByRole('tab', { name: /Symmetric Encryption/i })
    fireEvent.click(symmetricTab)

    expect(screen.getByText(/Classical Ciphers/i)).toBeInTheDocument()
  })

  it('handles option selection and reveals explanation', () => {
    render(<QuestionBankQuiz />)

    const firstQuestion = QUESTION_BANK[0]
    expect(screen.getByText(firstQuestion.question)).toBeInTheDocument()

    const optionRadio = screen.getByRole('radio', { name: firstQuestion.options[firstQuestion.correctAnswer] })
    fireEvent.click(optionRadio)

    expect(screen.getByText('Explanation & Deep Dive')).toBeInTheDocument()
    expect(screen.getByText(firstQuestion.explanation)).toBeInTheDocument()
  })
})
