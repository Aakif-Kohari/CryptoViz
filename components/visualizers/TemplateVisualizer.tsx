'use client'

import { useMemo, useState, type KeyboardEvent } from 'react'
import type { CipherResult, CipherStep } from '../../lib/cipher/types'

/**
 * TemplateVisualizer - A standardized starter component for CryptoViz visualizers
 * 
 * This template demonstrates:
 * - Proper TypeScript typing with existing CryptoViz types
 * - Safe data consumption with null checks
 * - Responsive layout with Tailwind v4
 * - Dark/light theme support
 * - Accessibility features (ARIA, keyboard navigation)
 * - Error handling and empty states
 * - Matrix, highlight, table, and note rendering
 * 
 * Copy this component and customize for your specific visualization needs.
 */

interface TemplateVisualizerProps {
  /** Current step index (0-based) */
  currentStep: number
  /** Complete cipher execution result with all steps */
  result: CipherResult | null
  /** Optional: Custom step filter function */
  stepFilter?: (step: CipherStep, index: number) => boolean
  /** Optional: Additional UI configuration */
  config?: {
    showStepLabels?: boolean
    showNotes?: boolean
    compactMode?: boolean
  }
}

export default function TemplateVisualizer({ 
  currentStep, 
  result, 
  stepFilter,
  config = {} 
}: TemplateVisualizerProps) {
  const { showStepLabels = true, showNotes = true, compactMode = false } = config
  
  // State for keyboard navigation in matrix
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null)

  // Apply step filter if provided
  const filteredSteps = useMemo(() => {
    const steps = result?.steps ?? []
    if (!stepFilter) return steps
    return steps.filter(stepFilter)
  }, [result?.steps, stepFilter])

  // Get current step safely
  const activeStep = useMemo(() => {
    if (filteredSteps.length === 0) return null
    const adjustedIndex = Math.min(currentStep, filteredSteps.length - 1)
    return filteredSteps[adjustedIndex] || filteredSteps[0]
  }, [currentStep, filteredSteps])

  // Guard against missing data
  if (!result || result.steps.length === 0 || !activeStep) {
    return <EmptyState />
  }

  // Render matrix with safe null checks
  const renderMatrix = (matrix?: string[][], highlights?: number[]) => {
    if (!matrix || matrix.length === 0) {
      return (
        <div className="text-sm text-zinc-500 dark:text-zinc-400 p-4">
          No matrix data available for this step
        </div>
      )
    }

    const isHighlighted = (rowIndex: number, colIndex: number) => {
      if (!highlights) return false
      const flatIndex = rowIndex * matrix[0].length + colIndex
      return highlights.includes(flatIndex)
    }

    return (
      <div
        role="grid"
        aria-label="State matrix"
        aria-rowcount={matrix.length}
        aria-colcount={matrix[0]?.length || 0}
        className="flex flex-col gap-2"
      >
        {matrix.map((row, rowIndex) => (
          <div key={rowIndex} role="row" className="flex gap-2">
            {row.map((cell, colIndex) => {
              const cellHighlighted = isHighlighted(rowIndex, colIndex)
              const isFocused = focusedCell?.row === rowIndex && focusedCell?.col === colIndex

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  role="gridcell"
                  aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}: ${cell}${cellHighlighted ? ', highlighted' : ''}`}
                  aria-selected={cellHighlighted}
                  tabIndex={isFocused ? 0 : -1}
                  onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                  onKeyDown={(e) => handleMatrixKeyDown(e, rowIndex, colIndex, matrix)}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg border font-mono text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                    cellHighlighted
                      ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md shadow-teal-500/10 dark:border-teal-400 dark:bg-teal-950/50 dark:text-teal-400'
                      : 'border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
                  }`}
                >
                  {cell}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  // Handle keyboard navigation in matrix
  const handleMatrixKeyDown = (
    event: KeyboardEvent,
    row: number,
    col: number,
    matrix: string[][]
  ) => {
    let nextRow = row
    let nextCol = col

    switch (event.key) {
      case 'ArrowRight':
        nextCol = Math.min(col + 1, matrix[0].length - 1)
        break
      case 'ArrowLeft':
        nextCol = Math.max(col - 1, 0)
        break
      case 'ArrowDown':
        nextRow = Math.min(row + 1, matrix.length - 1)
        break
      case 'ArrowUp':
        nextRow = Math.max(row - 1, 0)
        break
      case 'Home':
        nextRow = 0
        nextCol = 0
        break
      case 'End':
        nextRow = matrix.length - 1
        nextCol = matrix[0].length - 1
        break
      default:
        return
    }

    event.preventDefault()
    setFocusedCell({ row: nextRow, col: nextCol })
  }

  // Render highlight bytes visualization
  const renderHighlights = (highlight?: number[], totalBytes: number = 16) => {
    if (!highlight || highlight.length === 0) {
      return null
    }

    return (
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: totalBytes }).map((_, index) => (
          <div
            key={index}
            className={`w-8 h-8 flex items-center justify-center rounded border font-mono text-xs font-bold transition-all duration-300 ${
              highlight.includes(index)
                ? 'border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-950/50 dark:text-teal-400'
                : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
            }`}
            aria-label={`Byte ${index}: ${index.toString(16).padStart(2, '0').toUpperCase()}${highlight.includes(index) ? ', changed' : ', unchanged'}`}
          >
            {index.toString(16).padStart(2, '0').toUpperCase()}
          </div>
        ))}
      </div>
    )
  }

  // Render table data
  const renderTable = (table?: { key: string; value: string }[]) => {
    if (!table || table.length === 0) {
      return null
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {table.map((row, index) => (
              <tr key={index}>
                <td className="font-medium text-zinc-700 dark:text-zinc-300 pr-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                  {row.key}
                </td>
                <td className="font-mono text-zinc-900 dark:text-zinc-100 py-2 border-b border-zinc-100 dark:border-zinc-800">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Render step note
  const renderNote = (note?: string) => {
    if (!note || !showNotes) return null

    return (
      <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-teal-600 dark:text-teal-400 text-xs">ℹ</span>
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {note}
          </p>
        </div>
      </div>
    )
  }

  // Render step labels
  const renderStepLabels = () => {
    if (!showStepLabels) return null

    return (
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-full text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Step {currentStep + 1} of {filteredSteps.length}
        </span>
        {activeStep.isMilestone && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              Milestone
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          {renderStepLabels()}
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {activeStep.label}
          </h3>
          {activeStep.sublabel && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {activeStep.sublabel}
            </p>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={`grid gap-6 ${compactMode ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
        {/* Left Column - Visualization */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Visualization
            </h4>
          </div>
          
          {/* Matrix Display */}
          <div className="flex justify-center p-4 bg-zinc-50 dark:bg-zinc-950/30 rounded-lg border border-zinc-100 dark:border-zinc-800">
            {renderMatrix(activeStep.matrix, activeStep.highlight)}
          </div>

          {/* Highlights Display */}
          {activeStep.highlight && activeStep.highlight.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                Changed Bytes
              </h5>
              {renderHighlights(activeStep.highlight)}
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Step Details
            </h4>
          </div>

          {/* Input/Output States */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Input State
              </label>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-950/50 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all">
                {activeStep.inputState || 'None'}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Output State
              </label>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-950/50 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono text-xs font-bold text-teal-600 dark:text-teal-400 break-all">
                {activeStep.outputState || 'None'}
              </div>
            </div>
          </div>

          {/* Table Data */}
          {activeStep.table && activeStep.table.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                Step Data
              </h5>
              {renderTable(activeStep.table)}
            </div>
          )}

          {/* Note */}
          {renderNote(activeStep.note)}
        </div>
      </div>
    </div>
  )
}

/**
 * Empty state component for when no visualization data is available
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="w-16 h-16 mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        <span className="text-3xl" role="img" aria-label="Chart icon">
          📊
        </span>
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
        No visualization data
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md">
        Run the cipher with instrumentation enabled to see step-by-step visualization of the cryptographic operations.
      </p>
    </div>
  )
}