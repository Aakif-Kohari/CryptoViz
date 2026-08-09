'use client'

import React, { useState, useEffect } from 'react'

interface OfflineOnboardingProps {
  onComplete?: () => void
}

export default function OfflineOnboarding({ onComplete }: OfflineOnboardingProps) {
  const [dismissed, setDismissed] = useState(false)
  const [isCached, setIsCached] = useState(false)

  useEffect(() => {
    // Check local storage or service worker cache status
    const hasSeenOnboarding = localStorage.getItem('cryptoviz_offline_onboarding_seen')
    if (hasSeenOnboarding) {
      setDismissed(true)
    }

    if ('caches' in window) {
      caches.keys().then((names) => {
        if (names.length > 0) {
          setIsCached(true)
        }
      })
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('cryptoviz_offline_onboarding_seen', 'true')
    setDismissed(true)
    if (onComplete) onComplete()
  }

  if (dismissed) return null

  return (
    <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-4 rounded-xl border border-teal-500/30 bg-teal-50/20 p-6 backdrop-blur-sm dark:border-teal-500/20 dark:bg-teal-950/10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
            Offline Mode Ready
          </span>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
            Welcome to CryptoViz Offline Experience
          </h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl">
            CryptoViz works seamlessly without an active internet connection. All cryptographic calculations run locally via Web Workers and cached assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <span className={`h-2 w-2 rounded-full ${isCached ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            Cache Status: {isCached ? 'Fully Cached' : 'Standard Storage'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-2">
        <div className="rounded-lg border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/50">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">1. Setup & Caching</h3>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            Assets are pre-cached automatically on your first visit for uninterrupted local execution.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/50">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">2. Local Computation</h3>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            Ciphers, hashes, and visual traces run entirely client-side with zero data transmission.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-900/50">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">3. Recommended Content</h3>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            Explore symmetric primitives and hash walkthroughs fully functional offline.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleDismiss}
          className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400"
        >
          Got it, let's begin
        </button>
      </div>
    </div>
  )
}
