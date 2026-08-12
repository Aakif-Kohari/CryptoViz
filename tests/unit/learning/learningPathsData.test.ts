import { describe, it, expect } from 'vitest'
import { getLearningPaths, getLearningPathById, getLessonById } from '@/lib/learning-paths/data'

describe('Learning Paths Data Structure', () => {
  it('contains the required 6 core learning paths', () => {
    const paths = getLearningPaths()
    expect(paths.length).toBeGreaterThanOrEqual(6)

    const expectedIds = [
      'cryptography-fundamentals',
      'classical-ciphers',
      'modern-symmetric-encryption',
      'public-key-cryptography',
      'hash-functions',
      'digital-signatures',
    ]

    expectedIds.forEach((id) => {
      const found = paths.find((p) => p.id === id)
      expect(found).toBeDefined()
      expect(found?.title).toBeTruthy()
      expect(found?.lessons.length).toBeGreaterThan(0)
    })
  })

  it('retrieves path by id accurately', () => {
    const path = getLearningPathById('classical-ciphers')
    expect(path).toBeDefined()
    expect(path?.title).toBe('Classical Ciphers')
  })

  it('returns undefined for non-existent path', () => {
    const path = getLearningPathById('non-existent-path')
    expect(path).toBeUndefined()
  })

  it('retrieves specific lesson by pathId and lessonId', () => {
    const result = getLessonById('cryptography-fundamentals', 'intro-security-goals')
    expect(result).toBeDefined()
    expect(result?.lesson.title).toContain('Introduction & Core Security Goals')
    expect(result?.lessonIndex).toBe(0)
  })
})
