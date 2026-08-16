# Visualizer Development Guide

This guide provides standardized patterns and best practices for building visualizer components in CryptoViz. Visualizers are React components that display step-by-step cryptographic operations in an educational, accessible, and visually consistent manner.

## Table of Contents

- [Component Contract](#component-contract)
- [Data Structures](#data-structures)
- [Rendering Conventions](#rendering-conventions)
- [Styling Guidelines](#styling-guidelines)
- [Accessibility Requirements](#accessibility-requirements)
- [Responsive Design](#responsive-design)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Template Component](#template-component)

---

## Component Contract

### Standard Props Interface

All visualizer components should accept the following standardized props:

```typescript
import type { CipherResult, CipherStep } from '@/lib/cipher/types'

interface VisualizerComponentProps {
  /** Current step index (0-based) */
  currentStep: number
  /** Complete cipher execution result with all steps */
  result: CipherResult | null
  /** Optional: Custom step filter/mask function */
  stepFilter?: (step: CipherStep, index: number) => boolean
  /** Optional: Additional UI configuration */
  config?: {
    showStepLabels?: boolean
    showNotes?: boolean
    compactMode?: boolean
  }
}
```

### Basic Component Structure

```typescript
'use client'

import type { CipherResult } from '@/lib/cipher/types'

interface YourVisualizerProps {
  currentStep: number
  result: CipherResult | null
}

export default function YourVisualizer({ currentStep, result }: YourVisualizerProps) {
  // Guard against missing data
  if (!result || result.steps.length === 0) {
    return <EmptyState />
  }

  const activeStep = result.steps[currentStep] || result.steps[0]
  
  // Render your visualization
  return (
    <div className="your-container">
      {/* Your visualization code */}
    </div>
  )
}
```

---

## Data Structures

### CipherStep Properties

The `CipherStep` interface provides all data needed for visualization:

```typescript
interface CipherStep {
  index: number              // Step index (0-based)
  label: string              // Primary label (e.g., "Round 3 — SubBytes")
  sublabel?: string          // Secondary label (e.g., "Applying S-Box")
  inputState: string         // State before this step (hex)
  outputState: string        // State after this step (hex)
  highlight?: number[]       // Changed byte/char indices
  matrix?: string[][]        // 2D array for state matrices
  table?: {key: string; value: string}[]  // Key-value data
  note?: string              // Human-readable explanation
  isMilestone?: boolean      // Major step marker
  sboxInspection?: {         // S-box metadata for inspection
    family: 'aes' | 'des' | 'camellia' | 'serpent' | 'sm4'
    desIndex?: number
    serpentIndex?: number
    inputValue?: string
  }
}
```

### Consuming Matrix Data

Matrix data represents 2D state (e.g., AES state matrix, Playfair grid):

```typescript
// Safe matrix rendering with null checks
function renderMatrix(matrix?: string[][]) {
  if (!matrix || matrix.length === 0) {
    return <div className="text-zinc-400">No matrix data available</div>
  }

  return (
    <div role="grid" aria-label="State matrix">
      {matrix.map((row, rowIndex) => (
        <div key={rowIndex} role="row" className="flex gap-2">
          {row.map((cell, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} role="gridcell">
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
```

### Consuming Highlight Data

Highlight arrays indicate which indices changed in the current step:

```typescript
function renderHighlightedBytes(highlight?: number[], totalBytes: number) {
  if (!highlight || highlight.length === 0) {
    return null
  }

  return (
    <div className="flex gap-1">
      {Array.from({ length: totalBytes }).map((_, index) => (
        <div
          key={index}
          className={`w-8 h-8 flex items-center justify-center rounded ${
            highlight.includes(index)
              ? 'bg-teal-500 text-white'  // Highlighted style
              : 'bg-zinc-100 text-zinc-600'  // Normal style
          }`}
        >
          {index.toString(16).padStart(2, '0')}
        </div>
      ))}
    </div>
  )
}
```

### Consuming Table Data

Table data provides key-value pairs for structured display:

```typescript
function renderTable(table?: {key: string; value: string}[]) {
  if (!table || table.length === 0) {
    return null
  }

  return (
    <table className="w-full text-sm">
      <tbody>
        {table.map((row, index) => (
          <tr key={index}>
            <td className="font-medium text-zinc-700 dark:text-zinc-300 pr-4">
              {row.key}
            </td>
            <td className="font-mono text-zinc-900 dark:text-zinc-100">
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### Consuming Notes

Notes provide human-readable explanations:

```typescript
function renderNote(note?: string) {
  if (!note) return null

  return (
    <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <p className="text-sm text-zinc-700 dark:text-zinc-300">{note}</p>
    </div>
  )
}
```

---

## Rendering Conventions

### Step/State Display

Always show the current step context:

```typescript
<div className="flex items-center gap-2 mb-4">
  <span className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-xs font-bold text-zinc-700 dark:text-zinc-300">
    Step {currentStep + 1} of {result.steps.length}
  </span>
  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
    {activeStep.label}
  </h3>
</div>
```

### Milestone Indicators

Use visual emphasis for major steps:

```typescript
{activeStep.isMilestone && (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-2 h-2 rounded-full bg-teal-500" />
    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
      Milestone Step
    </span>
  </div>
)}
```

### Matrix Highlighting Conventions

- **Highlight Color**: Use `bg-teal-500` for highlights in light mode, `bg-teal-400` for dark mode
- **Normal State**: Use neutral grays (`bg-zinc-100` / `bg-zinc-800`)
- **Transition**: Add `transition-all duration-300` for smooth animations
- **Accessibility**: Always include `aria-selected` for highlighted cells

```typescript
<div
  className={`rounded border p-2 transition-all duration-300 ${
    isHighlighted
      ? 'border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-950/50 dark:text-teal-400'
      : 'border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
  }`}
  aria-selected={isHighlighted}
>
  {cellContent}
</div>
```

---

## Styling Guidelines

### Recommended Tailwind v4 Tokens

Use these semantic tokens for consistent theming:

```typescript
// Backgrounds
bg-card              // Card backgrounds
bg-white             // Primary white background
bg-zinc-50           // Light gray backgrounds
bg-zinc-900/40       // Dark mode card backgrounds

// Text
text-foreground       // Primary text color
text-zinc-900         // Dark text in light mode
text-zinc-100         // Light text in dark mode
text-teal-600         // Primary accent color (light)
text-teal-400         // Primary accent color (dark)

// Borders
border-border         // Semantic border color
border-zinc-200       // Light borders
border-zinc-800       // Dark borders

// Interactive elements
hover:bg-teal-50      // Hover states (light)
hover:bg-teal-900/20  // Hover states (dark)
focus:ring-teal-500   // Focus rings
```

### Dark/Light Theme Support

Always provide dark mode variants:

```typescript
<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
  <p className="text-zinc-900 dark:text-zinc-100">
    Your content
  </p>
</div>
```

### Typography Conventions

```typescript
// Headers
<h1 className="text-2xl font-bold text-zinc-900 dark:text-white">

// Labels
<label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">

// Body text
<p className="text-sm text-zinc-700 dark:text-zinc-300">

// Code/monospace
<code className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
```

---

## Accessibility Requirements

### ARIA Attributes for State Matrices

```typescript
<div
  role="grid"
  aria-label="AES state matrix"
  aria-rowcount={matrix.length}
  aria-colcount={matrix[0]?.length || 0}
>
  {matrix.map((row, rowIndex) => (
    <div key={rowIndex} role="row">
      {row.map((cell, colIndex) => (
        <div
          key={colIndex}
          role="gridcell"
          aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}: ${cell}`}
          aria-selected={isHighlighted}
          tabIndex={0}
        >
          {cell}
        </div>
      ))}
    </div>
  ))}
</div>
```

### Keyboard Interaction Conventions

- **Grid Navigation**: Support arrow keys for matrix navigation
- **Focus Management**: Provide visible focus indicators
- **Skip Links**: Allow keyboard users to skip visualizer controls

```typescript
const handleKeyDown = (event: KeyboardEvent, row: number, col: number) => {
  switch (event.key) {
    case 'ArrowRight':
      // Move focus right
      break
    case 'ArrowLeft':
      // Move focus left
      break
    case 'ArrowUp':
      // Move focus up
      break
    case 'ArrowDown':
      // Move focus down
      break
    default:
      return
  }
  event.preventDefault()
}
```

### Screen Reader Support

```typescript
// Provide descriptive labels
<button
  aria-label="Previous step"
  aria-current={currentStep === 0 ? 'false' : 'true'}
>
  Previous
</button>

// Announce step changes
<div aria-live="polite" aria-atomic="true">
  Step {currentStep + 1}: {activeStep.label}
</div>
```

---

## Responsive Design

### Layout Patterns

Use responsive grid layouts that adapt to screen size:

```typescript
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
  {/* Left column - Visualization */}
  <div className="lg:col-span-1">
    <Visualization />
  </div>
  
  {/* Right column - Details */}
  <div className="lg:col-span-1">
    <StepDetails />
  </div>
</div>
```

### Mobile Considerations

- **Stack Vertically**: On mobile, stack visualizer and details vertically
- **Touch Targets**: Ensure buttons are at least 44px tall for touch
- **Simplified Views**: Hide complex controls on small screens

```typescript
<div className="flex flex-col gap-4 md:flex-row md:gap-6">
  {/* Content */}
</div>

<button className="min-h-[44px] px-4 py-3">
  Button
</button>
```

---

## Error Handling

### Empty State Handling

Always handle missing or empty data gracefully:

```typescript
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        <span className="text-2xl">📊</span>
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
        No visualization data
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Run the cipher to see step-by-step visualization.
      </p>
    </div>
  )
}

// Usage in component
if (!result || result.steps.length === 0) {
  return <EmptyState />
}
```

### Error Boundaries

Wrap visualizers in error boundaries for graceful failure:

```typescript
'use client'

import { Component, ReactNode } from 'react'

interface VisualizerErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export class VisualizerErrorBoundary extends Component<
  VisualizerErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: VisualizerErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-400">
            Visualization failed to load. Please try again.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## Testing

### Unit Testing Pattern

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import YourVisualizer from './YourVisualizer'

describe('YourVisualizer', () => {
  it('renders empty state when no result provided', () => {
    render(<YourVisualizer currentStep={0} result={null} />)
    expect(screen.getByText(/no visualization data/i)).toBeInTheDocument()
  })

  it('renders current step information', () => {
    const mockResult = {
      output: 'test',
      outputEncoding: 'hex' as const,
      steps: [
        {
          index: 0,
          label: 'Step 1',
          inputState: '00',
          outputState: 'FF',
        }
      ],
      metadata: { name: 'Test', securityStatus: 'secure' as const },
      durationMs: 100,
    }

    render(<YourVisualizer currentStep={0} result={mockResult} />)
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('handles missing matrix data gracefully', () => {
    const mockResult = {
      output: 'test',
      outputEncoding: 'hex' as const,
      steps: [
        {
          index: 0,
          label: 'Step 1',
          inputState: '00',
          outputState: 'FF',
          matrix: undefined, // Missing matrix
        }
      ],
      metadata: { name: 'Test', securityStatus: 'secure' as const },
      durationMs: 100,
    }

    render(<YourVisualizer currentStep={0} result={mockResult} />)
    expect(screen.queryByText(/matrix/i)).not.toBeInTheDocument()
  })
})
```

---

## Template Component

A complete, copy-pasteable starter component is available at `components/visualizers/TemplateVisualizer.tsx`. This template demonstrates:

- Proper TypeScript typing
- Safe data consumption
- Responsive layout
- Dark/light theme support
- Accessibility features
- Error handling
- Empty state management

See the template file for a complete working example that you can extend for your specific visualization needs.

---

## Best Practices Summary

1. **Always guard against null/undefined data** - CryptoViz steps may be partial
2. **Use semantic Tailwind tokens** - Maintain design consistency
3. **Provide dark mode variants** - Ensure accessibility in all themes
4. **Include ARIA attributes** - Make visualizers screen-reader friendly
5. **Support keyboard navigation** - Enable keyboard-only users
6. **Handle empty states gracefully** - Provide helpful feedback
7. **Follow responsive patterns** - Ensure mobile compatibility
8. **Test missing data scenarios** - Verify robustness
9. **Use existing types** - Import from `@/lib/cipher/types`
10. **Maintain performance** - Avoid expensive computations in render

---

## Additional Resources

- [Cipher Engine Documentation](./CIPHER_ENGINE.md)
- [Architecture Guidelines](./GUIDELINES.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Component Examples](../components/cipher/)
