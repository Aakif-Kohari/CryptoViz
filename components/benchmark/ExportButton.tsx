'use client'

import { BenchmarkResult, BenchmarkSession } from '@/types/benchmark'
import { exportToCSV, exportSessionToCSV } from '@/lib/utils/csvExport'
import { useState } from 'react'

interface ExportButtonProps {
  results: BenchmarkResult[]
  session?: BenchmarkSession | null
  disabled?: boolean
}

export default function ExportButton({ results, session, disabled = false }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportResults = async () => {
    if (results.length === 0) return

    setIsExporting(true)
    try {
      exportToCSV(results, `benchmark-results-${Date.now()}.csv`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportSession = async () => {
    if (!session) return

    setIsExporting(true)
    try {
      exportSessionToCSV(session)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        onClick={handleExportResults}
        disabled={disabled || results.length === 0 || isExporting}
className="inline-flex items-center justify-center gap-2 rounded-lg border border-teal-600 bg-white px-4 py-2 font-medium text-teal-600 transition-all duration-200 hover:scale-[1.02] hover:bg-teal-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:border-teal-400 dark:bg-zinc-900 dark:text-teal-400 dark:hover:bg-zinc-800"      >
        {isExporting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent dark:border-teal-400"></div>
            Exporting...
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4"
              />
            </svg>
            Export Results (CSV)
          </>
        )}
      </button>

      {session && (
        <button
          onClick={handleExportSession}
          disabled={disabled || isExporting}
className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2 font-medium text-blue-600 transition-all duration-200 hover:scale-[1.02] hover:bg-blue-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:border-blue-400 dark:bg-zinc-900 dark:text-blue-400 dark:hover:bg-zinc-800"        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export Session
        </button>
      )}
    </div>
  )
}
