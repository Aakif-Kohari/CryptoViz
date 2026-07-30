'use client'

/**
 * SBoxGrid — renders a substitution box as an accessible HTML table.
 * Highlights the active row, column, and resulting cell so a lookup is easy
 * to trace visually. Shared between the AES (16x16) and DES (4x16) views.
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
  const colCount = grid[0]?.length ?? 0

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table
        role="table"
        aria-label={label}
        className="w-full border-collapse text-center font-mono text-[11px] sm:text-xs"
      >
        <thead>
          <tr>
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
            <tr key={rowIndex}>
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
                return (
                  <td
                    key={colIndex}
                    className={`border-b border-zinc-100 p-0 dark:border-zinc-800/60 ${
                      isActiveLine ? 'bg-teal-500/5' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onCellSelect?.(rowIndex, colIndex)}
                      aria-pressed={isActiveCell}
                      aria-label={`Row ${rowIndex}, column ${colIndex}: output ${formatValue(value, format)}`}
                      className={`h-7 w-7 rounded-sm transition-colors sm:h-8 sm:w-8 ${
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
