'use client'

import React, { useState, useEffect } from 'react'
import type { ChallengeHistoryEntry } from '@/lib/challenge/historyManager'

interface ChallengeHistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  history: ChallengeHistoryEntry[]
  onClearHistory: () => void
}

export default function ChallengeHistoryDrawer({
  isOpen,
  onClose,
  history,
  onClearHistory,
}: ChallengeHistoryDrawerProps) {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState<boolean>(false)

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const toggleExpand = (id: string) => {
    setExpandedSessionId((prev) => (prev === id ? null : id))
  }

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    onClearHistory()
    setConfirmClear(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-zinc-950/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-drawer-title"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-xl flex-col border-l border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <h2 id="history-drawer-title" className="text-xl font-bold text-zinc-900 dark:text-white">
              Historical Session Log
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Review past challenge attempts, mistake explanations, and accuracy progression.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Close history drawer"
          >
            ✕
          </button>
        </div>

        {/* History Content List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {history.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No session history saved yet.</p>
              <p className="mt-1 text-xs text-zinc-500">Complete a Challenge Mode run to track your accuracy and review mistakes here.</p>
            </div>
          ) : (
            history.map((entry) => {
              const dateStr = new Date(entry.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
              const isExpanded = expandedSessionId === entry.id
              const accuracyPercent = Math.round((entry.accuracy || 0) * 100)

              return (
                <div
                  key={entry.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-all dark:border-zinc-800 dark:bg-zinc-950/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-teal-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
                        {entry.difficulty}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{dateStr}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="font-bold text-amber-600 dark:text-amber-400">+{entry.xpEarned} XP</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">{accuracyPercent}% Acc</span>
                    </div>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-teal-600 dark:bg-teal-400"
                      style={{ width: `${accuracyPercent}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">
                      {entry.questions.filter((q) => q.correct).length} of {entry.questions.length} solved correctly
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleExpand(entry.id)}
                      className="text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400"
                    >
                      {isExpanded ? 'Hide Mistakes ▲' : 'Review Questions ▼'}
                    </button>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                      {entry.questions.map((q, idx) => (
                        <div
                          key={`q-${idx}-${q.cipherId}`}
                          className={`rounded-lg p-3 text-xs ${
                            q.correct
                              ? 'border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                              : 'border border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-900 dark:text-white">
                              Q{idx + 1}: <code className="font-mono text-teal-600 dark:text-teal-400">{q.cipherId}</code>
                            </span>
                            <span
                              className={`font-semibold ${
                                q.correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                              }`}
                            >
                              {q.correct ? '✓ Solved' : '✕ Incorrect'}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
                            <span>Hints: {q.hintRevealedCount}</span>
                            <span>Wrong attempts: {q.wrongAttempts}</span>
                            <span>Earned: +{q.earnedXp} XP</span>
                          </div>

                          {q.explanationTitle && (
                            <div className="mt-2 rounded bg-white p-2 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              <p className="font-semibold text-zinc-800 dark:text-zinc-200">{q.explanationTitle}</p>
                              {q.explanationDetails?.map((detail, dIdx) => (
                                <p key={dIdx} className="mt-0.5 text-zinc-600 dark:text-zinc-400">
                                  • {detail}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleClear}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              confirmClear
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {confirmClear ? 'Confirm Clear All History?' : 'Clear History'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
