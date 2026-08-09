'use client'

import { useState, useEffect } from 'react'
import { getBadges, unlockBadge, type Badge } from '../../lib/achievements/badgeManager'

export default function AchievementGallery() {
  const [badges, setBadges] = useState<Badge[]>([])

  useEffect(() => {
    setBadges(getBadges())
  }, [])

  const unlockedCount = badges.filter((b) => b.unlocked).length

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Achievement & Badge Gallery</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Earn badges by exploring ciphers, completing practice challenges, and maintaining learning streaks.
          </p>
        </div>
        <div className="rounded-xl bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
          {unlockedCount} / {badges.length} Unlocked
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
              badge.unlocked
                ? 'border-teal-500/30 bg-teal-50/20 dark:border-teal-500/20 dark:bg-teal-950/20'
                : 'border-zinc-200 bg-zinc-50/50 opacity-60 dark:border-zinc-800 dark:bg-zinc-900/30'
            }`}
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{badge.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{badge.title}</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    {badge.category}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{badge.description}</p>
            </div>

            <div className="mt-4 border-t border-zinc-100 pt-2 dark:border-zinc-800 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500 dark:text-zinc-400">{badge.requirementText}</span>
              {badge.unlocked ? (
                <span className="font-bold text-teal-600 dark:text-teal-400">✓ Unlocked</span>
              ) : (
                <button
                  onClick={() => setBadges(unlockBadge(badge.id))}
                  className="font-bold text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400"
                >
                  Test Unlock
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
