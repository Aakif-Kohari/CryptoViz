import dynamic from 'next/dynamic'
import type { AnimationSpeed } from '../cipher/StepAnimator'
import type { CipherResult } from '../../lib/cipher/types'

const StepAnimator = dynamic(() => import('../cipher/StepAnimator'), { ssr: false })

interface StageListProps {
  result: CipherResult | null
  currentStep: number
  animationSpeed: AnimationSpeed
  setAnimationSpeed: (speed: AnimationSpeed) => void
  onStepChange: (step: number) => void
  onCopyStepLink: () => void
}

export default function StageList({
  result,
  currentStep,
  animationSpeed,
  setAnimationSpeed,
  onStepChange,
  onCopyStepLink,
}: StageListProps) {
  if (!result || !result.steps || result.steps.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
        Step-by-Step Mathematical Trace
      </span>
      <StepAnimator
        steps={result.steps}
        currentStep={currentStep}
        onStepChange={onStepChange}
        speed={animationSpeed}
        onSpeedChange={setAnimationSpeed}
        onCopyStepLink={onCopyStepLink}
      />
    </div>
  )
}
