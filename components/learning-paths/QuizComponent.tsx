'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, HelpCircle, RefreshCw } from 'lucide-react'
import { QuizQuestion } from '@/lib/learning-paths/types'

interface QuizComponentProps {
  quiz: QuizQuestion[]
  onComplete?: (scorePercentage: number) => void
}

export default function QuizComponent({ quiz, onComplete }: QuizComponentProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!quiz || quiz.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-sm">
        No quiz questions for this lesson yet.
      </div>
    )
  }

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submitted) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  const handleSubmit = () => {
    setSubmitted(true)
    let correctCount = 0
    quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++
      }
    })
    const score = Math.round((correctCount / quiz.length) * 100)
    if (onComplete) {
      onComplete(score)
    }
  }

  const handleReset = () => {
    setSelectedAnswers({})
    setSubmitted(false)
  }

  const allAnswered = quiz.every((q) => selectedAnswers[q.id] !== undefined)
  const scoreCount = quiz.filter((q) => selectedAnswers[q.id] === q.correctAnswer).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <span>Knowledge Check ({quiz.length} Questions)</span>
        </h4>

        {submitted && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake Quiz</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {quiz.map((q, idx) => {
          const selectedIdx = selectedAnswers[q.id]
          const isCorrect = selectedIdx === q.correctAnswer

          return (
            <div
              key={q.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 transition-all"
            >
              <div className="font-semibold text-slate-200 text-sm sm:text-base flex items-start gap-2">
                <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                <span>{q.question}</span>
              </div>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isOptionSelected = selectedIdx === optIdx
                  let optionStyle =
                    'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'

                  if (submitted) {
                    if (optIdx === q.correctAnswer) {
                      optionStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold'
                    } else if (isOptionSelected) {
                      optionStyle = 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                    }
                  } else if (isOptionSelected) {
                    optionStyle = 'border-indigo-500 bg-indigo-500/10 text-indigo-200 font-semibold'
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border border-current/30 flex items-center justify-center text-xs font-semibold shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {submitted && optIdx === q.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {submitted && isOptionSelected && optIdx !== q.correctAnswer && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {submitted && (
                <div
                  className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                    isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
                      : 'border-slate-800 bg-slate-950/80 text-slate-400'
                  }`}
                >
                  <strong className="block font-semibold mb-1">
                    {isCorrect ? 'Correct!' : 'Explanation:'}
                  </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!submitted ? (
        <button
          disabled={!allAnswered}
          onClick={handleSubmit}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {allAnswered ? 'Submit Quiz Answers' : 'Select an option for all questions'}
        </button>
      ) : (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-center space-y-1">
          <div className="text-lg font-bold text-slate-100">
            Quiz Result: {scoreCount} / {quiz.length} ({Math.round((scoreCount / quiz.length) * 100)}%)
          </div>
          <p className="text-xs text-slate-400">
            {scoreCount === quiz.length
              ? 'Perfect score! You mastered this checkpoint.'
              : 'Good effort! Review the explanations above to strengthen your understanding.'}
          </p>
        </div>
      )}
    </div>
  )
}
