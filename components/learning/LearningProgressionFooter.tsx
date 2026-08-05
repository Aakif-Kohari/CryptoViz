'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { CIPHER_REGISTRY, type CipherDefinition } from '../../lib/cipher/registry'

// ─── Types ────────────────────────────────────────────────────────────────────

export type LearningContext = 'visualizer' | 'challenge' | 'quiz'

interface LearningProgressionFooterProps {
  /** The cipher that was just explored / tested */
  cipherId: string
  /** Where the component is rendered — controls layout density */
  context: LearningContext
  /** Optional 0–1 accuracy from a completed challenge or quiz session */
  sessionAccuracy?: number
  /** Additional CSS class for the outer wrapper */
  className?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SECURITY_BADGE: Record<CipherDefinition['securityStatus'], { label: string; cls: string }> = {
  recommended: { label: 'Recommended', cls: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  secure:       { label: 'Secure',      cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  legacy:       { label: 'Legacy',      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  deprecated:   { label: 'Deprecated', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  broken:       { label: 'Broken',      cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  experimental: { label: 'Experimental', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
}

const CATEGORY_ICON: Record<CipherDefinition['category'], string> = {
  classical:  '🔤',
  symmetric:  '🔐',
  hash:       '#️⃣',
  asymmetric: '🔑',
}

function getRecommendedCiphers(cipherId: string): CipherDefinition[] {
  const current = CIPHER_REGISTRY.find((c) => c.id === cipherId)
  if (!current) return []

  // 1. Use explicit recommendedNext graph
  if (current.recommendedNext && current.recommendedNext.length > 0) {
    const explicit = current.recommendedNext
      .map((id) => CIPHER_REGISTRY.find((c) => c.id === id))
      .filter((c): c is CipherDefinition => c !== undefined)
    if (explicit.length > 0) return explicit.slice(0, 3)
  }

  // 2. Fall back to same-category ciphers, excluding current
  const sameCat = CIPHER_REGISTRY.filter(
    (c) => c.category === current.category && c.id !== cipherId,
  )
  return sameCat.slice(0, 3)
}

function getCategoryProgress(cipherId: string): { explored: number; total: number; category: CipherDefinition['category'] } | null {
  const current = CIPHER_REGISTRY.find((c) => c.id === cipherId)
  if (!current || typeof window === 'undefined') return null

  const category = current.category
  const categoryTotal = CIPHER_REGISTRY.filter((c) => c.category === category).length

  // Count recently-viewed ciphers in this category from localStorage
  try {
    const raw = localStorage.getItem('cryptoviz-recently-viewed')
    const viewed: string[] = raw ? (JSON.parse(raw) as string[]) : []
    const explored = CIPHER_REGISTRY.filter(
      (c) => c.category === category && viewed.includes(c.id),
    ).length
    return { explored: Math.max(explored, 1), total: categoryTotal, category }
  } catch {
    return { explored: 1, total: categoryTotal, category }
  }
}

function accuracyMessage(accuracy: number): string {
  if (accuracy >= 0.9) return '🏆 Outstanding performance!'
  if (accuracy >= 0.7) return '👍 Great work — keep going!'
  if (accuracy >= 0.5) return '📖 Good effort — review the theory to improve.'
  return '💡 Review the concepts and try again.'
}

// ─── Sub-component: single cipher suggestion card ─────────────────────────────

function NextCipherCard({ cipher, compact }: { cipher: CipherDefinition; compact?: boolean }) {
  const badge = SECURITY_BADGE[cipher.securityStatus]
  const icon = CATEGORY_ICON[cipher.category]

  return (
    <Link
      href={`/visualizer/${cipher.id}`}
      className={`group flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-teal-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-teal-600 ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none" aria-hidden="true">{icon}</span>
          <span className="text-sm font-bold text-zinc-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300 transition-colors">
            {cipher.name}
          </span>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.cls}`}>
          {badge.label}
        </span>
      </div>
      {!compact && (
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {cipher.description}
        </p>
      )}
      <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400">
        <span>Explore</span>
        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

// ─── Related resources bar ────────────────────────────────────────────────────

function RelatedResources({ cipherId }: { cipherId: string }) {
  const links = [
    { href: `/docs`, label: '📄 Docs & Theory', id: `lpf-docs-${cipherId}` },
    { href: `/challenge?cipher=${cipherId}`, label: '🎯 Challenge Mode', id: `lpf-challenge-${cipherId}` },
    { href: `/advisor`, label: '🧭 Cipher Advisor', id: `lpf-advisor-${cipherId}` },
    { href: `/compare`, label: '⚖️ Compare Ciphers', id: `lpf-compare-${cipherId}` },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <Link
          key={l.id}
          id={l.id}
          href={l.href}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-all hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400 dark:hover:border-teal-700 dark:hover:bg-teal-950/30 dark:hover:text-teal-300"
        >
          {l.label}
        </Link>
      ))}
    </div>
  )
}

// ─── Category progress indicator ─────────────────────────────────────────────

function CategoryProgress({ cipherId }: { cipherId: string }) {
  const progress = useMemo(() => getCategoryProgress(cipherId), [cipherId])
  if (!progress) return null

  const pct = Math.round((progress.explored / progress.total) * 100)
  const icon = CATEGORY_ICON[progress.category]
  const label = progress.category.charAt(0).toUpperCase() + progress.category.slice(1)

  return (
    <div className="flex items-center gap-3">
      <span className="text-base" aria-hidden="true">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {label} Progress
          </span>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
            {progress.explored}/{progress.total}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={progress.explored}
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-label={`${progress.explored} of ${progress.total} ${label} ciphers explored`}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * LearningProgressionFooter
 *
 * Placed at every natural "exit point" in CryptoViz (visualizers, challenge
 * completion screens, quiz explanations) to give users clear, curated guidance
 * on what to explore next, bridging the gap between isolated modules.
 */
export default function LearningProgressionFooter({
  cipherId,
  context,
  sessionAccuracy,
  className = '',
}: LearningProgressionFooterProps) {
  const suggestions = useMemo(() => getRecommendedCiphers(cipherId), [cipherId])
  const isCompact = context === 'quiz'
  const isChallenge = context === 'challenge'

  if (suggestions.length === 0) return null

  return (
    <section
      aria-label="Learning Progression"
      className={`mt-8 space-y-5 rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900/60 dark:to-zinc-950/40 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40">
          <svg className="h-4 w-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            {isChallenge ? 'Ready for More?' : 'Recommended Next Step'}
          </h2>
          {sessionAccuracy !== undefined && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {accuracyMessage(sessionAccuracy)}
            </p>
          )}
          {!isChallenge && sessionAccuracy === undefined && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Continue your cryptography learning path
            </p>
          )}
        </div>
      </div>

      {/* Next cipher cards */}
      <div className={`grid gap-3 ${isCompact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {suggestions.map((cipher) => (
          <NextCipherCard key={cipher.id} cipher={cipher} compact={isCompact} />
        ))}
      </div>

      {/* Category progress indicator (not shown in compact/quiz mode) */}
      {!isCompact && (
        <div className="rounded-xl border border-zinc-100 bg-white/70 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/30">
          <CategoryProgress cipherId={cipherId} />
        </div>
      )}

      {/* Related resources (not shown in compact/quiz mode) */}
      {!isCompact && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Related Resources
          </p>
          <RelatedResources cipherId={cipherId} />
        </div>
      )}
    </section>
  )
}

// Compact inline version for use after quiz explanation banners
export function CompactNextStepNudge({ cipherId }: { cipherId: string }) {
  const suggestions = useMemo(() => getRecommendedCiphers(cipherId).slice(0, 2), [cipherId])
  if (suggestions.length === 0) return null

  return (
    <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50/50 p-3 dark:border-teal-900/30 dark:bg-teal-950/20">
      <p className="mb-2 text-xs font-bold text-teal-800 dark:text-teal-300">
        🚀 Go deeper — explore next:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((c) => (
          <Link
            key={c.id}
            href={`/visualizer/${c.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-xs transition-all hover:border-teal-400 hover:shadow-sm dark:border-teal-800 dark:bg-zinc-900/50 dark:text-teal-300 dark:hover:border-teal-600"
          >
            {CATEGORY_ICON[c.category]} {c.name}
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
        <Link
          href={`/docs`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 shadow-xs transition-all hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400"
        >
          📄 Read the docs
        </Link>
      </div>
    </div>
  )
}
