'use client'

import { Suspense, useMemo, useState } from 'react'
import PracticePageTemplate from "@/components/layout/PracticePageTemplate";
import { useSearchParams } from 'next/navigation'
import WorkspaceLayout from '../../components/layout/WorkspaceLayout'
import CipherComparisonPanel from '../../components/compare/CipherComparisonPanel'
import ComparisonControls from '../../components/compare/ComparisonControls'
import { CIPHER_REGISTRY } from '../../lib/cipher/registry'
import { swapComparisonSelection } from '../../lib/utils/cipherComparison'

const DEFAULT_LEFT_CIPHER = 'caesar'
const DEFAULT_RIGHT_CIPHER = 'vigenere'

function CompareContent() {
  const searchParams = useSearchParams()
  const urlLeft = searchParams.get('left')
  
  const [leftCipherId, setLeftCipherId] = useState(urlLeft || DEFAULT_LEFT_CIPHER)
  const [rightCipherId, setRightCipherId] = useState(DEFAULT_RIGHT_CIPHER)
  const [sharedInput, setSharedInput] = useState('ATTACKATDAWN')
  const [resetToken, setResetToken] = useState(0)

  const leftCipher = useMemo(
    () =>
      CIPHER_REGISTRY.find((cipher) => cipher.id === leftCipherId) ??
      CIPHER_REGISTRY[0],
    [leftCipherId],
  )

  const rightCipher = useMemo(
    () =>
      CIPHER_REGISTRY.find((cipher) => cipher.id === rightCipherId) ??
      CIPHER_REGISTRY[1],
    [rightCipherId],
  )

  const handleSwap = () => {
    const next = swapComparisonSelection({
      leftCipherId,
      rightCipherId,
    })
    setLeftCipherId(next.leftCipherId)
    setRightCipherId(next.rightCipherId)
  }

  const handleReset = () => {
    setLeftCipherId(DEFAULT_LEFT_CIPHER)
    setRightCipherId(DEFAULT_RIGHT_CIPHER)
    setSharedInput('ATTACKATDAWN')
    setResetToken((current) => current + 1)
  }

  return (
    <WorkspaceLayout activeCipherId={leftCipherId}>
<PracticePageTemplate
    title="Compare two ciphers side by side"
    description="Run the same input through two algorithms while keeping separate keys, directions, options, results, loading states, and errors."
    eyebrow="Comparison workspace"
    breadcrumbs={[
      { label: "Practice" },
      { label: "Compare Ciphers" },
    ]}
  >

        <ComparisonControls
          ciphers={CIPHER_REGISTRY}
          leftCipherId={leftCipher.id}
          rightCipherId={rightCipher.id}
          sharedInput={sharedInput}
          onLeftCipherChange={setLeftCipherId}
          onRightCipherChange={setRightCipherId}
          onSharedInputChange={setSharedInput}
          onSwap={handleSwap}
          onReset={handleReset}
        />

        <section
          aria-label="Cipher comparison results"
          className="grid gap-6 lg:grid-cols-2"
        >
          <CipherComparisonPanel
            key={`left-${leftCipher.id}`}
            cipher={leftCipher}
            sharedInput={sharedInput}
            panelLabel="Cipher A"
            resetToken={resetToken}
          />
          <CipherComparisonPanel
            key={`right-${rightCipher.id}`}
            cipher={rightCipher}
            sharedInput={sharedInput}
            panelLabel="Cipher B"
            resetToken={resetToken}
          />
        </section>
      </PracticePageTemplate>
    </WorkspaceLayout>
  )
}


export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8">Loading compare workspace...</div>}>
      <CompareContent />
    </Suspense>
  )
}