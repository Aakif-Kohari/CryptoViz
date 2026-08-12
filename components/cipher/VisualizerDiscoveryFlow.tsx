'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CIPHER_REGISTRY, type CipherDefinition } from '../../lib/cipher/registry'
import FavoriteCipherButton from './FavoriteCipherButton'
import CipherLifecycleBadge from './CipherLifecycleBadge'

type LearningLevel = 'beginner' | 'intermediate' | 'advanced'
type Step = 1 | 2 | 3

const learningLevels: {
  id: LearningLevel
  label: string
  description: string
  categories: CipherDefinition['category'][]
}[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    description: 'Start with foundational substitution and transposition techniques',
    categories: ['classical'],
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: 'Explore shared-key encryption and modern block ciphers',
    categories: ['symmetric'],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Dive into public-key cryptography, hashing, and complex algorithms',
    categories: ['asymmetric', 'hash'],
  },
]

const categoryLabels: Record<CipherDefinition['category'], string> = {
  classical: 'Classical',
  symmetric: 'Symmetric',
  asymmetric: 'Asymmetric',
  hash: 'Hashing',
}

const categoryDescriptions: Record<CipherDefinition['category'], string> = {
  classical: 'Explore foundational substitution and transposition techniques.',
  symmetric: 'Study shared-key encryption, block ciphers, and stream operations.',
  asymmetric: 'Understand public-key cryptography and secure key exchange.',
  hash: 'Inspect hashing, message authentication, and password derivation.',
}

export default function VisualizerDiscoveryFlow() {
  const [step, setStep] = useState<Step>(1)
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CipherDefinition['category'] | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handleLevelSelect = (level: LearningLevel) => {
    setSelectedLevel(level)
    setStep(2)
  }

  const handleCategorySelect = (category: CipherDefinition['category']) => {
    setSelectedCategory(category)
    setStep(3)
  }

  const handleBack = () => {
    if (step === 2) {
      setSelectedLevel(null)
      setStep(1)
    } else if (step === 3) {
      setSelectedCategory(null)
      setStep(2)
    }
  }

  const handleReset = () => {
    setSelectedLevel(null)
    setSelectedCategory(null)
    setStep(1)
  }

  const getAvailableCategories = () => {
    if (!selectedLevel) return []
    const levelConfig = learningLevels.find((l) => l.id === selectedLevel)
    return levelConfig?.categories || []
  }

  const getFilteredCiphers = () => {
    if (!selectedCategory) return []
    return CIPHER_REGISTRY.filter((cipher) => cipher.category === selectedCategory)
  }

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                step === s
                  ? 'bg-teal-600 text-white dark:bg-teal-500'
                  : step > s
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                  : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 3 && (
              <div
                className={`mx-2 h-0.5 w-8 transition-colors ${
                  step > s ? 'bg-teal-600 dark:bg-teal-500' : 'bg-zinc-200 dark:bg-zinc-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Choose Learning Level */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
              Choose your learning level
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Select a level to see recommended algorithm families
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {learningLevels.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => handleLevelSelect(level.id)}
                className="group rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-teal-700"
              >
                <h3 className="text-lg font-bold text-zinc-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-400">
                  {level.label}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {level.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1">
                  {level.categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {categoryLabels[cat]}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Choose Algorithm Family */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              ← Back
            </button>
            <div className="text-center flex-1">
              <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
                Choose algorithm family
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {selectedLevel && learningLevels.find((l) => l.id === selectedLevel)?.label} level
              </p>
            </div>
            <div className="w-16" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {getAvailableCategories().map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategorySelect(category)}
                className="group rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-teal-700"
              >
                <h3 className="text-lg font-bold text-zinc-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-400">
                  {categoryLabels[category]}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {categoryDescriptions[category]}
                </p>
                <p className="mt-3 text-xs font-semibold text-teal-700 dark:text-teal-400">
                  {CIPHER_REGISTRY.filter((c) => c.category === category).length} algorithms →
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Launch Visualizer */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              ← Back
            </button>
            <div className="text-center flex-1">
              <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
                Launch visualizer
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {selectedCategory && categoryLabels[selectedCategory]}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Start over
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getFilteredCiphers().map((cipher) => (
              <article
                key={cipher.id}
                className="group relative rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-teal-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/visualizer/${cipher.id}/`}
                    className="min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    <h3 className="text-lg font-bold text-zinc-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-400">
                      {cipher.name}
                    </h3>
                  </Link>

                  <FavoriteCipherButton
                    cipherId={cipher.id}
                    cipherName={cipher.name}
                  />
                </div>

                <div className="mt-3">
                  <CipherLifecycleBadge status={cipher.securityStatus} />
                </div>

                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {cipher.description}
                </p>

                <Link
                  href={`/visualizer/${cipher.id}/`}
                  className="mt-5 inline-flex text-sm font-semibold text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400"
                >
                  Open visualizer →
                </Link>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters (Collapsed/Secondary) */}
      <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <span>{showAdvancedFilters ? '▼' : '▶'} Advanced filters</span>
        </button>

        {showAdvancedFilters && (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Browse all categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {(['classical', 'symmetric', 'asymmetric', 'hash'] as const).map((category) => (
                  <Link
                    key={category}
                    href={`/?category=${category}`}
                    className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-teal-700 dark:hover:text-teal-400"
                  >
                    {categoryLabels[category]}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Browse by security status
              </h3>
              <div className="flex flex-wrap gap-2">
                {(['recommended', 'secure', 'legacy', 'deprecated', 'broken'] as const).map((status) => (
                  <Link
                    key={status}
                    href={`/?status=${status}`}
                    className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-teal-700 dark:hover:text-teal-400"
                  >
                    {status}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
