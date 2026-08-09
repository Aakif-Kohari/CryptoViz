'use client'

import { safeGetItemJson, safeSetItemJson } from '../utils/storage'

export interface Badge {
  id: string
  title: string
  description: string
  icon: string
  category: 'learning' | 'challenge' | 'exploration' | 'streak'
  unlocked: boolean
  unlockedAt?: number
  requirementText: string
}

const BADGE_STORAGE_KEY = 'cryptoviz_unlocked_badges'

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_cipher',
    title: 'Cipher Novice',
    description: 'Explored your first cryptographic algorithm visualizer.',
    icon: '🔮',
    category: 'exploration',
    unlocked: false,
    requirementText: 'Visit 1 cipher visualizer',
  },
  {
    id: 'streak_3',
    title: 'Consistent Learner',
    description: 'Maintained a 3-day learning streak in CryptoViz.',
    icon: '🔥',
    category: 'streak',
    unlocked: false,
    requirementText: 'Maintain a 3-day streak',
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Completed 5 quizzes in the question bank.',
    icon: '🏆',
    category: 'challenge',
    unlocked: false,
    requirementText: 'Complete 5 quiz sessions',
  },
  {
    id: 'crypto_scholar',
    title: 'Crypto Scholar',
    description: 'Read articles and documents across all major categories.',
    icon: '📜',
    category: 'learning',
    unlocked: false,
    requirementText: 'Read 3 docs articles',
  },
  {
    id: 'polymath',
    title: 'Symmetric Specialist',
    description: 'Explored AES, DES, and ChaCha20 visualizers.',
    icon: '⚡',
    category: 'exploration',
    unlocked: false,
    requirementText: 'Explore 3 symmetric ciphers',
  },
]

export function getBadges(): Badge[] {
  const saved = safeGetItemJson<Record<string, number>>(BADGE_STORAGE_KEY, {} as Record<string, number>) || {}
  return INITIAL_BADGES.map((badge) => {
    if (saved[badge.id]) {
      return {
        ...badge,
        unlocked: true,
        unlockedAt: saved[badge.id],
      }
    }
    return badge
  })
}

export function unlockBadge(badgeId: string): Badge[] {
  const saved = safeGetItemJson<Record<string, number>>(BADGE_STORAGE_KEY, {} as Record<string, number>) || {}
  if (!saved[badgeId]) {
    saved[badgeId] = Date.now()
    safeSetItemJson(BADGE_STORAGE_KEY, saved)
  }
  return getBadges()
}

export function checkAndAutoUnlockBadges(stats: {
  exploredCount?: number
  streakCount?: number
  quizCount?: number
  docsCount?: number
}): Badge[] {
  const saved = safeGetItemJson<Record<string, number>>(BADGE_STORAGE_KEY, {} as Record<string, number>) || {}
  let updated = false

  if ((stats.exploredCount || 0) >= 1 && !saved['first_cipher']) {
    saved['first_cipher'] = Date.now()
    updated = true
  }
  if ((stats.streakCount || 0) >= 3 && !saved['streak_3']) {
    saved['streak_3'] = Date.now()
    updated = true
  }
  if ((stats.quizCount || 0) >= 5 && !saved['quiz_master']) {
    saved['quiz_master'] = Date.now()
    updated = true
  }
  if ((stats.docsCount || 0) >= 3 && !saved['crypto_scholar']) {
    saved['crypto_scholar'] = Date.now()
    updated = true
  }

  if (updated) {
    safeSetItemJson(BADGE_STORAGE_KEY, saved)
  }

  return getBadges()
}
