import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLearningPath } from '@/lib/hooks/useLearningPath'

describe('useLearningPath Hook', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with default empty progress', () => {
    const { result } = renderHook(() => useLearningPath())
    expect(result.current.isLoaded).toBe(true)

    const overall = result.current.getOverallProgress()
    expect(overall.totalCompleted).toBe(0)
    expect(overall.percentage).toBe(0)
  })

  it('marks lesson complete and updates path progress percentage', () => {
    const { result } = renderHook(() => useLearningPath())

    act(() => {
      result.current.markLessonComplete('cryptography-fundamentals', 'intro-security-goals')
    })

    const pct = result.current.getPathProgressPercentage('cryptography-fundamentals')
    expect(pct).toBeGreaterThan(0)

    const overall = result.current.getOverallProgress()
    expect(overall.totalCompleted).toBe(1)
  })

  it('records quiz score accurately', () => {
    const { result } = renderHook(() => useLearningPath())

    act(() => {
      result.current.recordQuizScore('intro-security-goals', 100)
    })

    expect(result.current.progress.quizScores['intro-security-goals']).toBe(100)
  })

  it('provides recommended next lesson when no activity exists', () => {
    const { result } = renderHook(() => useLearningPath())
    const rec = result.current.getRecommendedNextLesson()

    expect(rec).not.toBeNull()
    expect(rec?.path.id).toBe('cryptography-fundamentals')
  })

  it('resets progress cleanly', () => {
    const { result } = renderHook(() => useLearningPath())

    act(() => {
      result.current.markLessonComplete('cryptography-fundamentals', 'intro-security-goals')
      result.current.resetProgress()
    })

    const overall = result.current.getOverallProgress()
    expect(overall.totalCompleted).toBe(0)
  })
})
