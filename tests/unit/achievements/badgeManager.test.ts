import { describe, it, expect, beforeEach } from 'vitest'
import { getBadges, unlockBadge, checkAndAutoUnlockBadges } from '@/lib/achievements/badgeManager'

describe('Achievement Badge System', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads initial badges with default locked state', () => {
    const badges = getBadges()
    expect(badges.length).toBeGreaterThan(0)
    expect(badges.every((b) => !b.unlocked)).toBe(true)
  })

  it('unlocks a badge explicitly', () => {
    const updated = unlockBadge('first_cipher')
    const first = updated.find((b) => b.id === 'first_cipher')
    expect(first?.unlocked).toBe(true)
    expect(first?.unlockedAt).toBeDefined()
  })

  it('automatically unlocks badges based on user stats', () => {
    const updated = checkAndAutoUnlockBadges({ exploredCount: 1, streakCount: 3 })
    const firstCipher = updated.find((b) => b.id === 'first_cipher')
    const streak3 = updated.find((b) => b.id === 'streak_3')
    
    expect(firstCipher?.unlocked).toBe(true)
    expect(streak3?.unlocked).toBe(true)
  })
})
