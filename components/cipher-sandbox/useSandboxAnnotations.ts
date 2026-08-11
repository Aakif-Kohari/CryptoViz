import { useMemo } from 'react'
import {
  createStableStepId,
  getScopeAnnotations,
  type StepAnnotationStore,
  type StepAnnotation,
} from '../../lib/utils/stepAnnotations'
import type { CipherStep } from '../../lib/cipher/types'

interface AnnotationScope {
  cipherId: string
  direction: "encrypt" | "decrypt"
}

interface BookmarkedStepItem extends StepAnnotation {
  stepIndex: number
}

interface UseSandboxAnnotationsResult {
  activeStepId: string | null
  activeAnnotation: StepAnnotation | undefined
  bookmarkedSteps: BookmarkedStepItem[]
}

export function useSandboxAnnotations(
  annotationStore: StepAnnotationStore,
  annotationScope: AnnotationScope,
  activeStep: CipherStep | undefined,
  resultSteps: CipherStep[] | undefined,
  currentStep: number,
): UseSandboxAnnotationsResult {
  const activeStepId = useMemo(() => {
    if (!activeStep) return null
    return createStableStepId(activeStep.label, currentStep)
  }, [activeStep, currentStep])

  const scopeAnnotations = useMemo(() => {
    return getScopeAnnotations(annotationStore, annotationScope)
  }, [annotationStore, annotationScope])

  const activeAnnotation = useMemo(() => {
    if (!activeStepId) return undefined
    return scopeAnnotations.find((item) => item.stepId === activeStepId)
  }, [activeStepId, scopeAnnotations])

  const bookmarkedSteps = useMemo(() => {
    if (!resultSteps) return []
    return resultSteps
      .map((step, index) => {
        const stepId = createStableStepId(step.label, index)
        const annotation = scopeAnnotations.find(
          (item) => item.stepId === stepId && item.bookmarked,
        )
        return annotation
          ? { ...annotation, stepIndex: index }
          : null
      })
      .filter(
        (item): item is NonNullable<typeof item> => item !== null,
      )
  }, [resultSteps, scopeAnnotations])

  return {
    activeStepId,
    activeAnnotation,
    bookmarkedSteps,
  }
}
