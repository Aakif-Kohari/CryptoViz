'use client'

import { useState, useEffect, useCallback } from 'react'

export interface AlgorithmProgress {
  id: string
  name: string
  category: string
  visitedAt: string
  lastVisitedAt: string
  visitCount: number
}

export interface ChallengeStats {
  totalAttempted: number
  totalCorrect: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  dailyCompleted: boolean
}

export interface BookmarkedResource {
  id: string
  title: string
  href: string
  bookmarkedAt: string
}

export interface ProgressData {
  algorithms: Record<string, AlgorithmProgress>
  challenges: ChallengeStats
  bookmarks: BookmarkedResource[]
  docsRead: string[]
  joinedAt: string
  lastActiveAt: string
}

const STORAGE_KEY = 'cryptoviz_progress'

const DEFAULT_PROGRESS: ProgressData = {
  algorithms: {},
  challenges: {
    totalAttempted: 0,
    totalCorrect: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    dailyCompleted: false,
  },
  bookmarks: [],
  docsRead: [],
  joinedAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
}

export const ALL_ALGORITHMS = [
  { id: 'caesar',    name: 'Caesar Cipher',     category: 'Classical',  href: '/visualizer/caesar/' },
  { id: 'rot13',     name: 'ROT-13',            category: 'Classical',  href: '/visualizer/rot13/' },
  { id: 'vigenere',  name: 'Vigenère Cipher',   category: 'Classical',  href: '/visualizer/vigenere/' },
  { id: 'playfair',  name: 'Playfair Cipher',   category: 'Classical',  href: '/visualizer/playfair/' },
  { id: 'railfence', name: 'Rail Fence Cipher', category: 'Classical',  href: '/visualizer/railfence/' },
  { id: 'xor',       name: 'XOR Cipher',        category: 'Symmetric',  href: '/visualizer/xor/' },
  { id: 'otp',       name: 'One-Time Pad',      category: 'Symmetric',  href: '/visualizer/otp/' },
  { id: 'des',       name: 'DES',               category: 'Symmetric',  href: '/visualizer/des/' },
  { id: '3des',      name: 'Triple-DES',        category: 'Symmetric',  href: '/visualizer/3des/' },
  { id: 'aes',       name: 'AES',               category: 'Symmetric',  href: '/visualizer/aes/' },
  { id: 'md5',       name: 'MD5',               category: 'Hash',       href: '/visualizer/md5/' },
  { id: 'sha256',    name: 'SHA-256',           category: 'Hash',       href: '/visualizer/sha256/' },
  { id: 'sha512',    name: 'SHA-512',           category: 'Hash',       href: '/visualizer/sha512/' },
  { id: 'hmac',      name: 'HMAC',              category: 'Hash',       href: '/visualizer/hmac/' },
  { id: 'bcrypt',    name: 'Bcrypt',            category: 'Hash',       href: '/visualizer/bcrypt/' },
  { id: 'rsa',       name: 'RSA',               category: 'Asymmetric', href: '/visualizer/rsa/' },
  { id: 'dh',        name: 'Diffie-Hellman',    category: 'Asymmetric', href: '/visualizer/dh/' },
  { id: 'ecdsa',     name: 'ECDSA P-256',       category: 'Asymmetric', href: '/visualizer/ecdsa/' },
  { id: 'merkle',    name: 'Merkle Tree',       category: 'Advanced',   href: '/merkle' },
  { id: 'bloom',     name: 'Bloom Filter',      category: 'Advanced',   href: '/bloom-filter' },
  { id: 'rainbow',   name: 'Rainbow Table',     category: 'Advanced',   href: '/rainbow-table' },
  { id: 'kdf',       name: 'KDF (Argon2)',      category: 'Advanced',   href: '/kdf' },
] as const

function readStorage(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PROGRESS, joinedAt: new Date().toISOString() }
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_PROGRESS, joinedAt: new Date().toISOString() }
  }
}

function writeStorage(data: ProgressData): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { }
}

function getPreviousDay(dateStr: string): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(DEFAULT_PROGRESS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setProgress(readStorage())
    setHydrated(true)
  }, [])

  const markAlgorithmVisited = useCallback((id: string) => {
    setProgress(prev => {
      const now = new Date().toISOString()
      const meta = ALL_ALGORITHMS.find(a => a.id === id)
      const existing = prev.algorithms[id]
      const updated: ProgressData = {
        ...prev,
        lastActiveAt: now,
        algorithms: {
          ...prev.algorithms,
          [id]: {
            id,
            name: meta?.name ?? id,
            category: meta?.category ?? 'Unknown',
            visitedAt: existing?.visitedAt ?? now,
            lastVisitedAt: now,
            visitCount: (existing?.visitCount ?? 0) + 1,
          },
        },
      }
      writeStorage(updated)
      return updated
    })
  }, [])

  const recordChallengeAnswer = useCallback((correct: boolean) => {
    setProgress(prev => {
      const now = new Date()
      const today = now.toISOString().slice(0, 10)
      const { challenges } = prev
      const lastDate = challenges.lastActivityDate?.slice(0, 10)
      const isConsecutive = lastDate === getPreviousDay(today)
      const newStreak = correct
        ? (lastDate === today ? challenges.currentStreak : isConsecutive ? challenges.currentStreak + 1 : 1)
        : challenges.currentStreak
      const updated: ProgressData = {
        ...prev,
        lastActiveAt: now.toISOString(),
        challenges: {
          totalAttempted: challenges.totalAttempted + 1,
          totalCorrect: challenges.totalCorrect + (correct ? 1 : 0),
          currentStreak: newStreak,
          longestStreak: Math.max(challenges.longestStreak, newStreak),
          lastActivityDate: now.toISOString(),
          dailyCompleted: today === lastDate ? challenges.dailyCompleted : false,
        },
      }
      writeStorage(updated)
      return updated
    })
  }, [])

  const markDailyCompleted = useCallback(() => {
    setProgress(prev => {
      const updated = { ...prev, challenges: { ...prev.challenges, dailyCompleted: true } }
      writeStorage(updated)
      return updated
    })
  }, [])

  const toggleBookmark = useCallback((resource: Omit<BookmarkedResource, 'bookmarkedAt'>) => {
    setProgress(prev => {
      const exists = prev.bookmarks.some(b => b.id === resource.id)
      const updated: ProgressData = {
        ...prev,
        bookmarks: exists
          ? prev.bookmarks.filter(b => b.id !== resource.id)
          : [...prev.bookmarks, { ...resource, bookmarkedAt: new Date().toISOString() }],
      }
      writeStorage(updated)
      return updated
    })
  }, [])

  const markDocRead = useCallback((slug: string) => {
    setProgress(prev => {
      if (prev.docsRead.includes(slug)) return prev
      const updated = { ...prev, docsRead: [...prev.docsRead, slug] }
      writeStorage(updated)
      return updated
    })
  }, [])

  const resetProgress = useCallback(() => {
    const fresh: ProgressData = { ...DEFAULT_PROGRESS, joinedAt: new Date().toISOString() }
    writeStorage(fresh)
    setProgress(fresh)
  }, [])

  const visitedCount = Object.keys(progress.algorithms).length
  const totalAlgorithms = ALL_ALGORITHMS.length
  const completionPct = Math.round((visitedCount / totalAlgorithms) * 100)

  const byCategory = ALL_ALGORITHMS.reduce<Record<string, { total: number; visited: number }>>(
    (acc, algo) => {
      if (!acc[algo.category]) acc[algo.category] = { total: 0, visited: 0 }
      acc[algo.category].total++
      if (progress.algorithms[algo.id]) acc[algo.category].visited++
      return acc
    }, {}
  )

  const accuracy = progress.challenges.totalAttempted > 0
    ? Math.round((progress.challenges.totalCorrect / progress.challenges.totalAttempted) * 100)
    : 0

  const recentAlgorithms = Object.values(progress.algorithms)
    .sort((a, b) => new Date(b.lastVisitedAt).getTime() - new Date(a.lastVisitedAt).getTime())
    .slice(0, 6)

  return {
    progress, hydrated,
    markAlgorithmVisited, recordChallengeAnswer, markDailyCompleted,
    toggleBookmark, markDocRead, resetProgress,
    visitedCount, totalAlgorithms, completionPct, byCategory, accuracy, recentAlgorithms,
  }
}
