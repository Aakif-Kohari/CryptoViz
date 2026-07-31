import React, { useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { QuestionNode } from '../../lib/advisor/treeData'

interface QuestionCardProps {
  node: QuestionNode
  onAnswer: (nextId: string, summary: string) => void
}

export default function QuestionCard({ node, onAnswer }: QuestionCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])

  // Focus management: when a new question appears, focus the container
  // to ensure screen readers announce the new question.
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus()
    }
  }, [node.id])

  const handleOptionKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const nextIndex = (index + 1) % node.options.length
        optionRefs.current[nextIndex]?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prevIndex = (index - 1 + node.options.length) % node.options.length
        optionRefs.current[prevIndex]?.focus()
      }
    },
    [node.options.length],
  )

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="flex flex-col gap-6 outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 rounded-3xl"
      aria-labelledby="question-heading"
      aria-describedby={node.description ? "question-description" : undefined}
    >
      <div className="space-y-3">
        <h2
          id="question-heading"
          className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          {node.question}
        </h2>
        {node.description && (
          <p
            id="question-description"
            className="text-lg text-zinc-600 dark:text-zinc-400"
          >
            {node.description}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-1" role="group" aria-label="Answer options">
        {node.options.map((option, idx) => (
          <button
            key={option.id}
            ref={(el) => {
              optionRefs.current[idx] = el
            }}
            onClick={() => onAnswer(option.nextId, option.label)}
            onKeyDown={(e) => handleOptionKeyDown(e, idx)}
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-2xl
              border
              border-zinc-200
              bg-white
              p-6
              text-left
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-teal-500
              hover:shadow-md
              hover:shadow-teal-500/10
              outline-none
              focus-visible:ring-2
              focus-visible:ring-teal-500
              focus-visible:ring-offset-2
              dark:border-zinc-800
              dark:bg-zinc-900/50
              dark:hover:border-teal-400
              dark:hover:shadow-teal-900/20
              dark:focus-visible:ring-offset-zinc-950
            "
          >
            <span className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
              {option.label}
            </span>
            <svg
              className="h-6 w-6 text-zinc-400 transition-colors group-hover:text-teal-500 dark:text-zinc-600 dark:group-hover:text-teal-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

