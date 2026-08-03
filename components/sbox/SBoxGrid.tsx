'use client'

import { useRef, useState, useCallback, type KeyboardEvent } from 'react'

/**
 * SBoxGrid — renders a substitution box as an accessible HTML table.
 * Highlights the active row, column, and resulting cell so a lookup is easy
 * to trace visually. Shared between the AES (16x16) and DES (4x16) views.
 *
 * Accessibility contract:
 *   Includes roving tabindex (Tab once into grid, Arrow keys / Home / End to navigate cells).
 */

interface SBoxGridProps {
  /** Row-major grid of output values. */
  grid: number[][]
  /** Row index to highlight, or null when nothing is selected. */
  activeRow: number | null
  /** Column index to highlight, or null when nothing is selected. */
  activeCol: number | null
  /** Accessible label for the table. */
  label: string
  /** Render cell values in hex (AES) or decimal (DES nibble values). */
  format?: 'hex' | 'decimal'
  /** Called when the user clicks or activates a cell directly. */
  onCellSelect?: (row: number, col: number) => void
}

function formatValue(value: number, format: 'hex' | 'decimal'): string {
  return format === 'hex' ? value.toString(16).padStart(2, '0') : String(value)
}

export default function SBoxGrid({
  grid,
  activeRow,
  activeCol,
  label,
  format = 'hex',
  onCellSelect,
}: SBoxGridProps) {
  const rowCount = grid.length
  const colCount = grid[0]?.length ?? 0

  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number }>({
    row: activeRow ?? 0,
    col: activeCol ?? 0,
  })

  const cellRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map())

  // Keep focused cell synced if active selection changes externally
  const effectiveRow = activeRow !== null ? activeRow : Math.min(focusedCell.row, rowCount - 1)
  const effectiveCol = activeCol !== null ? activeCol : Math.min(focusedCell.col, colCount - 1)

  const focusCell = useCallback(
    (row: number, col: number) => {
      const clampedRow = Math.max(0, Math.min(rowCount - 1, row))
      const clampedCol = Math.max(0, Math.min(colCount - 1, col))
      setFocusedCell({ row: clampedRow, col: clampedCol })

      const key = `${clampedRow}-${clampedCol}`
      cellRefs.current.get(key)?.focus()
    },
    [rowCount, colCount],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, rIdx: number, cIdx: number) => {
      let nextRow = rIdx
      let nextCol = cIdx

      switch (event.key) {
        case 'ArrowRight':
          nextCol = Math.min(cIdx + 1, colCount - 1)
          break
        case 'ArrowLeft':
          nextCol = Math.max(cIdx - 1, 0)
          break
        case 'ArrowDown':
          nextRow = Math.min(rIdx + 1, rowCount - 1)
          break
        case 'ArrowUp':
          nextRow = Math.max(rIdx - 1, 0)
          break
        case 'Home':
          nextRow = 0
          nextCol = 0
          break
        case 'End':
          nextRow = rowCount - 1
          nextCol = colCount - 1
          break
        default:
          return
      }

      event.preventDefault()
      focusCell(nextRow, nextCol)
    },
    [colCount, rowCount, focusCell],
  )

  if (rowCount === 0 || colCount === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table
        role="grid"
        aria-label={label}
        className="w-full border-collapse text-center font-mono text-[11px] sm:text-xs"
      >
        <thead>
          <tr role="row">
            <th
              scope="col"
              className="border-b border-r border-zinc-200 bg-zinc-50 p-1.5 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-500"
            >
              row \ col
            </th>
            {Array.from({ length: colCount }, (_, col) => (
              <th
                key={col}
                scope="col"
                className={`border-b border-zinc-200 p-1.5 font-semibold transition-colors dark:border-zinc-800 ${
                  col === activeCol
                    ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {col.toString(16)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, rowIndex) => (
            <tr key={rowIndex} role="row">
              <th
                scope="row"
                className={`border-r border-zinc-200 p-1.5 font-semibold transition-colors dark:border-zinc-800 ${
                  rowIndex === activeRow
                    ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {rowIndex.toString(16)}
              </th>
              {row.map((value, colIndex) => {
                const isActiveCell = rowIndex === activeRow && colIndex === activeCol
                const isActiveLine = rowIndex === activeRow || colIndex === activeCol
                const isTabbable = rowIndex === effectiveRow && colIndex === effectiveCol

                return (
                  <td
                    key={colIndex}
                    role="gridcell"
                    className={`border-b border-zinc-100 p-0 dark:border-zinc-800/60 ${
                      isActiveLine ? 'bg-teal-500/5' : ''
                    }`}
                  >
                    <button
                      ref={(el) => {
                        cellRefs.current.set(`${rowIndex}-${colIndex}`, el)
                      }}
                      type="button"
                      tabIndex={isTabbable ? 0 : -1}
                      onClick={() => onCellSelect?.(rowIndex, colIndex)}
                      onKeyDown={(event) => handleKeyDown(event, rowIndex, colIndex)}
                      onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                      aria-selected={isActiveCell}
                      aria-pressed={isActiveCell}
                      aria-label={`Row ${rowIndex}, column ${colIndex}: output ${formatValue(value, format)}`}
                      className={`h-7 w-7 rounded-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-950 sm:h-8 sm:w-8 ${
                        isActiveCell
                          ? 'bg-teal-500 font-bold text-white'
                          : 'text-zinc-700 hover:bg-teal-500/20 dark:text-zinc-300'
                      }`}
                    >
                      {formatValue(value, format)}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

