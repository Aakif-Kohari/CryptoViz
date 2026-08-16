import type { CipherStep } from '@/lib/cipher/types'

export interface NarrationContext {
  stepNumber?: number
  totalSteps?: number
  label?: string
  note?: string
  inputState?: string
  outputState?: string
  table?: Array<{
    key: string
    value: string
  }>
  isMilestone?: boolean
}

/**
 * Converts common cryptographic notation into language that is easier
 * for screen-reader users to understand.
 *
 * This intentionally avoids attempting to parse arbitrary mathematical
 * expressions. Unknown expressions are preserved as readable text.
 */
export function narrateMathematics(value: string): string {
  if (!value) return ''

  return value
    .replace(/≤/g, ' less than or equal to ')
    .replace(/≥/g, ' greater than or equal to ')
    .replace(/≠/g, ' not equal to ')
    .replace(/≈/g, ' approximately equal to ')
    .replace(/=/g, ' equals ')
    .replace(/\+/g, ' plus ')
    .replace(/−/g, ' minus ')
    .replace(/-/g, ' minus ')
    .replace(/\*/g, ' times ')
    .replace(/×/g, ' times ')
    .replace(/\//g, ' divided by ')
    .replace(/mod/gi, ' modulo ')
    .replace(/\^/g, ' to the power of ')
    .replace(/\(/g, ', open parenthesis, ')
    .replace(/\)/g, ', close parenthesis, ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Creates a concise description of a matrix/grid cell.
 */
export function narrateGridCell(
  row: number,
  column: number,
  value: string,
  highlighted = false,
): string {
  const highlightText = highlighted ? ', highlighted' : ''

  return `Row ${row + 1}, column ${column + 1}: ${value || 'empty'}${highlightText}.`
}

/**
 * Creates a textual description of a matrix.
 */
export function narrateMatrix(matrix: string[][]): string {
  if (matrix.length === 0) {
    return 'The matrix is empty.'
  }

  const rows = matrix.map((row, rowIndex) => {
    const values = row.length > 0 ? row.join(', ') : 'empty row'
    return `Row ${rowIndex + 1}: ${values}.`
  })

  return `Matrix with ${matrix.length} rows. ${rows.join(' ')}`
}

/**
 * Converts a CipherStep into a natural-language description suitable
 * for an ARIA live region.
 */
export function narrateCipherStep(
  step: CipherStep,
  context: NarrationContext = {},
): string {
  const stepNumber = context.stepNumber ?? 1
  const totalSteps = context.totalSteps
  const label = context.label ?? step.label

  const position = totalSteps
    ? `Step ${stepNumber} of ${totalSteps}.`
    : `Step ${stepNumber}.`

  const milestone = context.isMilestone ?? step.isMilestone
    ? ' This is a milestone step.'
    : ''

  const sections: string[] = [
    position,
    `${label}.`,
  ]

  if (step.note) {
    sections.push(step.note)
  }

  if (step.inputState !== undefined) {
    sections.push(
      `Input state: ${narrateMathematics(String(step.inputState))}.`,
    )
  }

  if (step.outputState !== undefined) {
    sections.push(
      `Output state: ${narrateMathematics(String(step.outputState))}.`,
    )
  }

  if (step.table && step.table.length > 0) {
    const tableDescription = step.table
      .map(
        (row) =>
          `${row.key}: ${narrateMathematics(String(row.value))}.`,
      )
      .join(' ')

    sections.push(`Parameters. ${tableDescription}`)
  }

  if (milestone) {
    sections.push(milestone)
  }

  return sections
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Creates a simple description of a Playfair matrix.
 */
export function narratePlayfairMatrix(
  matrix: string[][],
  highlights: number[] = [],
): string {
  if (matrix.length === 0) {
    return 'Playfair matrix is empty.'
  }

  const rows = matrix.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      const index = rowIndex * row.length + columnIndex

      return narrateGridCell(
        rowIndex,
        columnIndex,
        value,
        highlights.includes(index),
      )
    })

    return cells.join(' ')
  })

  return `Playfair 5 by 5 key square. ${rows.join(' ')}`
}

/**
 * Produces a compact accessible description of a visual state change.
 */
export function narrateStateChange(
  previousValue: string | undefined,
  nextValue: string | undefined,
  label: string,
): string {
  if (previousValue === nextValue) {
    return `${label}: no change.`
  }

  if (previousValue === undefined) {
    return `${label}: changed to ${nextValue ?? 'empty'}.`
  }

  if (nextValue === undefined) {
    return `${label}: changed from ${previousValue} to empty.`
  }

  return `${label}: changed from ${previousValue} to ${nextValue}.`
}