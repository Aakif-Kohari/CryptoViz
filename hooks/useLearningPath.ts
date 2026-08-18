'use client'

import { useState, useCallback } from 'react'
import { safeGetItemJson, safeSetItemJson } from '@/lib/utils/storage'
import { UserLearningProgress, LastActiveLesson, LearningPath, Lesson } from '@/lib/learning-paths/types'
import { LEARNING_PATHS, getLearningPathById } from '@/lib/learning-paths/data'

const STORAGE_KEY = 'cryptoviz_learning_path_progress_v1'

const DEFAULT_PROGRESS: UserLearningProgress = {
  completedLessons: {},
  quizScores: {},
  lastActiveLesson: null,
  completedPaths: {},
}

export function useLearningPath() {
  const [progress, setProgress] = useState<UserLearningProgress>(() =>
    safeGetItemJson<UserLearningProgress>(STORAGE_KEY, DEFAULT_PROGRESS)
  )
  const isLoaded = true

  // Save progress helper
  const updateProgress = useCallback((updater: (prev: UserLearningProgress) => UserLearningProgress) => {
    setProgress((prev) => {
      const updated = updater(prev)
      safeSetItemJson(STORAGE_KEY, updated)
      return updated
    })
  }, [])

  const markLessonComplete = useCallback((pathId: string, lessonId: string) => {
    const key = `${pathId}:${lessonId}`
    updateProgress((prev) => {
      const completedLessons = { ...prev.completedLessons, [key]: true }

      // Check if entire path is now complete
      const path = getLearningPathById(pathId)
      let pathComplete = false
      if (path) {
        pathComplete = path.lessons.every((l) => completedLessons[`${pathId}:${l.id}`])
      }

      const completedPaths = {
        ...prev.completedPaths,
        [pathId]: pathComplete,
      }

      return {
        ...prev,
        completedLessons,
        completedPaths,
        lastActiveLesson: {
          pathId,
          lessonId,
          timestamp: Date.now(),
        },
      }
    })
  }, [updateProgress])

  const recordQuizScore = useCallback((lessonId: string, scorePercentage: number) => {
    updateProgress((prev) => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [lessonId]: Math.max(prev.quizScores[lessonId] || 0, Math.round(scorePercentage)),
      },
    }))
  }, [updateProgress])

  const setLastActiveLesson = useCallback((pathId: string, lessonId: string) => {
    updateProgress((prev) => ({
      ...prev,
      lastActiveLesson: {
        pathId,
        lessonId,
        timestamp: Date.now(),
      },
    }))
  }, [updateProgress])

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS)
    safeSetItemJson(STORAGE_KEY, DEFAULT_PROGRESS)
  }, [])

  const getPathProgressPercentage = useCallback((pathId: string): number => {
    const path = getLearningPathById(pathId)
    if (!path || path.lessons.length === 0) return 0

    const completedCount = path.lessons.filter((l) => progress.completedLessons[`${pathId}:${l.id}`]).length
    return Math.round((completedCount / path.lessons.length) * 100)
  }, [progress.completedLessons])

  const getOverallProgress = useCallback(() => {
    let totalLessons = 0
    let totalCompleted = 0

    LEARNING_PATHS.forEach((path) => {
      path.lessons.forEach((l) => {
        totalLessons++
        if (progress.completedLessons[`${path.id}:${l.id}`]) {
          totalCompleted++
        }
      })
    })

    const percentage = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0
    return {
      totalLessons,
      totalCompleted,
      percentage,
      completedPathsCount: Object.values(progress.completedPaths).filter(Boolean).length,
    }
  }, [progress])

  const getLastActiveLessonDetails = useCallback((): { path: LearningPath; lesson: Lesson; lastActive: LastActiveLesson } | null => {
    if (!progress.lastActiveLesson) return null

    const { pathId, lessonId } = progress.lastActiveLesson
    const path = getLearningPathById(pathId)
    if (!path) return null

    const lesson = path.lessons.find((l) => l.id === lessonId)
    if (!lesson) return null

    return { path, lesson, lastActive: progress.lastActiveLesson }
  }, [progress.lastActiveLesson])

  const getRecommendedNextLesson = useCallback((): { path: LearningPath; lesson: Lesson } | null => {
    // 1. If user has a last active path, find the first uncompleted lesson in that path
    if (progress.lastActiveLesson) {
      const activePath = getLearningPathById(progress.lastActiveLesson.pathId)
      if (activePath) {
        const nextUncompleted = activePath.lessons.find((l) => !progress.completedLessons[`${activePath.id}:${l.id}`])
        if (nextUncompleted) {
          return { path: activePath, lesson: nextUncompleted }
        }
      }
    }

    // 2. Otherwise find the first uncompleted lesson in the first uncompleted path
    for (const path of LEARNING_PATHS) {
      const nextUncompleted = path.lessons.find((l) => !progress.completedLessons[`${path.id}:${l.id}`])
      if (nextUncompleted) {
        return { path, lesson: nextUncompleted }
      }
    }

    // 3. If all lessons are completed, recommend first lesson of first path
    if (LEARNING_PATHS.length > 0 && LEARNING_PATHS[0].lessons.length > 0) {
      return { path: LEARNING_PATHS[0], lesson: LEARNING_PATHS[0].lessons[0] }
    }

    return null
  }, [progress])

  return {
    progress,
    isLoaded,
    markLessonComplete,
    recordQuizScore,
    setLastActiveLesson,
    resetProgress,
    getPathProgressPercentage,
    getOverallProgress,
    getLastActiveLessonDetails,
    getRecommendedNextLesson,
  }
}
