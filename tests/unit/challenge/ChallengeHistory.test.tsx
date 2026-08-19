import React from 'react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  getChallengeHistory,
  saveChallengeHistoryEntry,
  clearChallengeHistory,
  computeHistoryStats,
  HISTORY_KEY,
  type ChallengeHistoryEntry,
} from '../../../lib/challenge/historyManager'

describe('Challenge History & Mistake Manager', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and retrieves challenge history entries capped at cap limit', () => {
    const entry: ChallengeHistoryEntry = {
      id: 'test-1',
      createdAt: Date.now(),
      difficulty: 'beginner',
      xpEarned: 150,
      accuracy: 0.8,
      streakAfter: 2,
      questions: [
        {
          cipherId: 'caesar',
          correct: true,
          hintRevealedCount: 0,
          wrongAttempts: 0,
          earnedXp: 100,
        },
        {
          cipherId: 'vigenere',
          correct: false,
          hintRevealedCount: 1,
          wrongAttempts: 2,
          earnedXp: 0,
          explanationTitle: 'Incorrect Shift Key',
          explanationDetails: ['Expected key shift was +3.'],
        },
      ],
    }

    saveChallengeHistoryEntry(entry)
    const history = getChallengeHistory()

    expect(history.length).toBe(1)
    expect(history[0].id).toBe('test-1')
    expect(history[0].accuracy).toBe(0.8)
    expect(history[0].questions.length).toBe(2)
  })

  it('computes correct accuracy stats from history', () => {
    const entry1: ChallengeHistoryEntry = {
      id: '1',
      createdAt: Date.now(),
      difficulty: 'beginner',
      xpEarned: 200,
      accuracy: 1.0,
      streakAfter: 1,
      questions: [],
    }
    const entry2: ChallengeHistoryEntry = {
      id: '2',
      createdAt: Date.now(),
      difficulty: 'intermediate',
      xpEarned: 100,
      accuracy: 0.5,
      streakAfter: 2,
      questions: [],
    }

    saveChallengeHistoryEntry(entry1)
    saveChallengeHistoryEntry(entry2)

    const stats = computeHistoryStats(getChallengeHistory())
    expect(stats.totalSessions).toBe(2)
    expect(stats.totalXp).toBe(300)
    expect(stats.avgAccuracy).toBe(0.75)
    expect(stats.bestStreak).toBe(2)
  })

  it('clears challenge history completely from storage', () => {
    saveChallengeHistoryEntry({
      id: 'test-del',
      createdAt: Date.now(),
      difficulty: 'advanced',
      xpEarned: 50,
      accuracy: 0.5,
      streakAfter: 0,
      questions: [],
    })

    expect(getChallengeHistory().length).toBe(1)
    clearChallengeHistory()
    expect(getChallengeHistory().length).toBe(0)
  })
})
