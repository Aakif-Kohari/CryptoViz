'use client'

import { useEffect, useMemo, useRef } from 'react'
import {
  narrateCipherStep,
  type NarrationContext,
} from '@/lib/accessibility/narrator'
import type { CipherStep } from '@/lib/cipher/types'

interface A11yStepNarratorProps {
  step: CipherStep | undefined
  stepIndex: number
  totalSteps: number
  context?: Omit<NarrationContext, 'stepNumber' | 'totalSteps'>
  enabled?: boolean
}

/**
 * Accessible live-region narration for interactive visualizers.
 *
 * The visualizer remains unchanged. This component provides an equivalent
 * textual stream for screen-reader users whenever the active step changes.
 */
export default function A11yStepNarrator({
  step,
  stepIndex,
  totalSteps,
  context,
  enabled = true,
}: A11yStepNarratorProps) {
  const announcementRef = useRef<HTMLDivElement>(null)

  const message = useMemo(() => {
    if (!step || !enabled) return ''

    return narrateCipherStep(step, {
      ...context,
      stepNumber: stepIndex + 1,
      totalSteps,
    })
  }, [context, enabled, step, stepIndex, totalSteps])

  useEffect(() => {
    if (!enabled || !announcementRef.current) return

    // Reset before assigning the next message so identical consecutive
    // announcements are still exposed to assistive technology.
    announcementRef.current.textContent = ''

    const frame = window.requestAnimationFrame(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [enabled, message])

  if (!enabled) return null

  return (
    <div
      ref={announcementRef}
      aria-live="polite"
      aria-atomic="true"
      role="status"
      className="sr-only"
    />
  )
}