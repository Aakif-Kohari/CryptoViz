'use client'

import { useState, useMemo } from 'react'
import {
  QUESTION_BANK,
  type CipherCategory,
  type QuestionDifficulty,
  type QuizQuestion,
} from '../../lib/challenge/questionBank'
import { getQuestionBankStats } from '../../lib/challenge/generator'

const CATEGORY_LABELS: Record<CipherCategory | 'all', string> = {
  all: 'All Categories',
  classical: 'Classical Ciphers',
  symmetric: 'Symmetric Encryption',
  asymmetric: 'Asymmetric Public-Key',
  hash: 'Hash & KDF Primitives',
  attacks: 'Attacks & Security',
}

const DIFFICULTY_LABELS: Record<QuestionDifficulty | 'all', string> = {
  all: 'All Difficulties',
  easy: 'Easy Level',
  medium: 'Medium Level',
  hard: 'Hard Level',
}

export default function QuestionBankQuiz() {
  const stats = useMemo(() => getQuestionBankStats(), [])

  const [selectedCategory, setSelectedCategory] = useState<CipherCategory | 'all'>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const filteredQuestions = useMemo(() => {
    return QUESTION_BANK.filter((q) => {
      if (selectedCategory !== 'all' && q.category !== selectedCategory) return false
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchQ = q.question.toLowerCase().includes(query)
        const matchExpl = q.explanation.toLowerCase().includes(query)
        const matchTags = q.tags.some((t) => t.toLowerCase().includes(query))
        if (!matchQ && !matchExpl && !matchTags) return false
      }
      return true
    })
  }, [selectedCategory, selectedDifficulty, searchQuery])

  const currentQuestion: QuizQuestion | undefined = filteredQuestions[currentIndex]

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || !currentQuestion) return
    setSelectedOption(idx)
    setShowExplanation(true)
    setAnsweredCount((prev) => prev + 1)
    if (idx === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    setSelectedOption(null)
    setShowExplanation(false)
    setShowHint(false)
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  const handleResetQuiz = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setShowExplanation(false)
    setShowHint(false)
    setScore(0)
    setAnsweredCount(0)
  }

  return (
    <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full bg-teal-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-600 dark:bg-teal-400/10 dark:text-teal-400">
              300+ QUESTION BANK
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Interactive Quiz & Knowledge Bank
            </span>
          </div>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Expanded Cryptography Question Bank
          </h2>

          <p className="mt-1 max-w-2xl text-xs text-zinc-500 dark:text-zinc-400">
            Practice over 300 curated questions across classical, symmetric, asymmetric, hash algorithms, and security engineering.
          </p>
        </div>

        {/* Score & Progress Badge */}
        <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Score</div>
            <div className="text-lg font-black text-teal-600 dark:text-teal-400">
              {score} / {answeredCount}
            </div>
          </div>
          <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Total Bank</div>
            <div className="text-lg font-black text-zinc-900 dark:text-white">
              {stats.total}
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentIndex(0)
              }}
              placeholder="Search 300+ questions by keyword (e.g., AES, RSA, SHA-3, Diffie-Hellman, ECDSA)..."
              aria-label="Search questions"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-4 pr-10 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500 dark:focus:border-teal-400 dark:focus:bg-zinc-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="question-difficulty-select" className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              Difficulty:
            </label>
            <select
              id="question-difficulty-select"
              aria-label="Filter questions by difficulty"
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value as QuestionDifficulty | 'all')
                setCurrentIndex(0)
              }}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy ({stats.difficulties.easy})</option>
              <option value="medium">Medium ({stats.difficulties.medium})</option>
              <option value="hard">Hard ({stats.difficulties.hard})</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1" role="tablist" aria-label="Filter Question Bank by Category">
          {(Object.keys(CATEGORY_LABELS) as (CipherCategory | 'all')[]).map((cat) => {
            const isActive = selectedCategory === cat
            const count = cat === 'all' ? stats.total : stats.categories[cat]

            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setSelectedCategory(cat)
                  setCurrentIndex(0)
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/30 dark:bg-teal-400 dark:text-zinc-950'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-zinc-950/20 dark:text-zinc-950'
                      : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Question Display */}
      {currentQuestion ? (
        <div className="space-y-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950/60 sm:p-8">
          {/* Question Metadata */}
          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:bg-teal-400/10 dark:text-teal-400">
                {currentQuestion.category}
              </span>
              <span className="rounded-md bg-zinc-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {currentQuestion.difficulty}
              </span>
            </div>

            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Question {currentIndex + 1} of {filteredQuestions.length}
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-lg font-bold leading-relaxed text-zinc-900 dark:text-white sm:text-xl">
            {currentQuestion.question}
          </h3>

          {/* Options Grid */}
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Multiple choice answer options">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx
              const isCorrect = idx === currentQuestion.correctAnswer
              const isWrong = isSelected && !isCorrect

              let optionStyle =
                'border-zinc-200 bg-white hover:border-teal-500 hover:bg-teal-50/50 dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:border-teal-400 dark:hover:bg-teal-950/20'

              if (selectedOption !== null) {
                if (isCorrect) {
                  optionStyle =
                    'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold'
                } else if (isWrong) {
                  optionStyle =
                    'border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-500/50 dark:bg-rose-950/40 dark:text-rose-200'
                } else {
                  optionStyle =
                    'border-zinc-200 bg-zinc-100/50 opacity-40 dark:border-zinc-800 dark:bg-zinc-900/20'
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelectOption(idx)}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left text-sm transition-all ${optionStyle}`}
                >
                  <span className="leading-relaxed">{opt}</span>
                  {selectedOption !== null && isCorrect && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  )}
                  {selectedOption !== null && isWrong && (
                    <span className="text-rose-600 dark:text-rose-400 font-bold">✕</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Hint Section */}
          <div>
            {!showHint && selectedOption === null && (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400"
              >
                💡 Need a hint?
              </button>
            )}

            {showHint && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                <strong>Hint:</strong> {currentQuestion.hint}
              </div>
            )}
          </div>

          {/* Explanation Banner */}
          {showExplanation && (
            <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/60 p-5 dark:border-teal-900/40 dark:bg-teal-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                Explanation & Deep Dive
              </h4>
              <p className="text-sm font-medium text-teal-950 dark:text-teal-200">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Controls Footer */}
          <div className="flex items-center justify-between border-t border-zinc-200/80 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleResetQuiz}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Reset Quiz Score
            </button>

            <button
              type="button"
              disabled={selectedOption === null}
              onClick={handleNextQuestion}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                selectedOption !== null
                  ? 'bg-teal-500 text-white shadow-sm hover:bg-teal-600 dark:bg-teal-400 dark:text-zinc-950 dark:hover:bg-teal-300'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600'
              }`}
            >
              Next Question →
            </button>
          </div>
        </div>
      ) : (
        /* Empty Filter Results */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-950/40">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            No questions match your filters
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Try resetting your search query or selecting a different category/difficulty.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setSelectedDifficulty('all')
            }}
            className="mt-4 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-white shadow-sm dark:bg-teal-400 dark:text-zinc-950"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  )
}
