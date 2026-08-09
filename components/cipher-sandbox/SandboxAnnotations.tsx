import StepNotes from '../cipher/StepNotes'
import BookmarkedSteps from '../cipher/BookmarkedSteps'
import type { CipherStep } from '../../lib/cipher/types'
import type { StepAnnotation } from '../../lib/utils/stepAnnotations'

interface BookmarkedStepItem extends StepAnnotation {
  stepIndex: number
}

interface SandboxAnnotationsProps {
  activeStep: CipherStep | undefined
  activeAnnotation: StepAnnotation | undefined
  bookmarkedSteps: BookmarkedStepItem[]
  currentStep: number
  onStepSelect: (step: number) => void
  onSave: (note: string) => void
  onDelete: () => void
  onClear: () => void
  onToggleBookmark: () => void
}

export default function SandboxAnnotations({
  activeStep,
  activeAnnotation,
  bookmarkedSteps,
  currentStep,
  onStepSelect,
  onSave,
  onDelete,
  onClear,
  onToggleBookmark,
}: SandboxAnnotationsProps) {
  return (
    <>
      <StepNotes
        stepLabel={activeStep?.label ?? ''}
        annotation={activeAnnotation}
        onToggleBookmark={onToggleBookmark}
        onSaveNote={onSave}
        onDeleteNote={onDelete}
      />

      <BookmarkedSteps
        steps={bookmarkedSteps}
        currentStep={currentStep}
        onOpenStep={onStepSelect}
        onClearAll={onClear}
      />
    </>
  )
}
