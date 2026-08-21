import type { CipherTraceFile } from './cipherTrace'
import { stepToLatex, escapeLatexText } from './latexExport'
import { citationToBibtex } from './citationRegistry'

/**
 * Converts an entire CipherTraceFile to a Markdown session document.
 * Only exports information actually present in the trace.
 */
export function traceToMarkdown(trace: CipherTraceFile): string {
  const lines: string[] = []

  lines.push('# Cipher Execution')
  lines.push('')

  lines.push('## Cipher')
  lines.push(`**Name:** ${trace.metadata.name}`)
  if (trace.metadata.modeOfOperation) {
    lines.push(`**Mode:** ${trace.metadata.modeOfOperation}`)
  }
  lines.push(`**Direction:** ${trace.direction === 'encrypt' ? 'Encryption' : 'Decryption'}`)
  lines.push('')

  lines.push('## Input')
  lines.push('```text')
  lines.push(trace.input)
  lines.push('```')
  lines.push('')

  lines.push('## Parameters')
  lines.push(`**Key:** \`${trace.key}\``)

  const optionsEntries = Object.entries(trace.options)
  if (optionsEntries.length > 0) {
    lines.push('')
    lines.push('**Options:**')
    optionsEntries.forEach(([k, v]) => {
      lines.push(`- ${k}: \`${v}\``)
    })
  }
  lines.push('')

  lines.push('## Steps')
  lines.push('')

  if (trace.steps && trace.steps.length > 0) {
    trace.steps.forEach(step => {
      lines.push(`### Step ${step.index + 1}: ${step.label}`)
      if (step.note) {
        lines.push('')
        lines.push(step.note)
      }
      lines.push('')

      lines.push('#### State')
      lines.push('')

      // Output LaTeX representation
      const latex = stepToLatex(step, trace.cipherId)
      // Remove any surrounding text-mode from stepToLatex to make it clean math block if it's purely math,
      // but stepToLatex includes \text and \textbf which require a math environment to render properly in Markdown math blocks if they are not already.
      // Wait, stepToLatex outputs lines intended for a LaTeX math block or standard text?
      // Actually, stepToLatex uses \textbf and \text, which are valid inside a Math block (e.g. $$ ... $$) in KaTeX/MathJax.
      // So we wrap the entire output in $$ ... $$
      lines.push('$$')
      lines.push(latex)
      lines.push('$$')
      lines.push('')
    })
  } else {
    lines.push('_No steps recorded._')
    lines.push('')
  }

  lines.push('## Final Result')
  lines.push(`**Output Encoding:** ${trace.outputEncoding}`)
  lines.push('```text')
  lines.push(trace.output)
  lines.push('```')
  lines.push('')

  const bibtex = citationToBibtex(trace.cipherId, trace.metadata)
  if (bibtex) {
    lines.push('## References')
    lines.push('```bibtex')
    lines.push(bibtex)
    lines.push('```')
    lines.push('')
  }

  return lines.join('\n')
}
