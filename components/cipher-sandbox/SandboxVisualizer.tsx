import dynamic from 'next/dynamic'
import type { CipherDefinition } from '../../lib/cipher/registry'
import type { CipherResult } from '../../lib/cipher/types'

const PlayfairGrid = dynamic(() => import('../cipher/PlayfairGrid'), { ssr: false })
const RailFenceViz = dynamic(() => import('../cipher/RailFenceViz'), { ssr: false })
const DHVisualizer = dynamic(() => import('../cipher/DHVisualizer'), { ssr: false })
const HmacVisualizer = dynamic(() => import('../cipher/HmacVisualizer'), { ssr: false })
const Sm3Visualizer = dynamic(() => import('../cipher/Sm3Visualizer'), { ssr: false })

interface SandboxVisualizerProps {
  cipher: CipherDefinition
  result: CipherResult | null
  currentStep: number
}

export default function SandboxVisualizer({ cipher, result, currentStep }: SandboxVisualizerProps) {
  if (!result || result.steps.length === 0) return null;
  const step = result.steps[currentStep];
  
  if (cipher.id === "playfair" && step.matrix) {
    return <PlayfairGrid matrix={step.matrix} highlights={step.highlight} />;
  }
  if (cipher.id === "railfence" && step.matrix) {
    return <RailFenceViz matrix={step.matrix} highlight={step.highlight} />;
  }
  if (cipher.id === "dh") {
    return <DHVisualizer currentStep={currentStep} />;
  }
  if (cipher.id === "hmac") {
    return <HmacVisualizer currentStep={currentStep} result={result} />;
  }
  if (cipher.id === "sm3") {
    return <Sm3Visualizer currentStep={currentStep} result={result} />;
  }
  return null;
}
