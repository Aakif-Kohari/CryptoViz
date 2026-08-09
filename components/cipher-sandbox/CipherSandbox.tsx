'use client'
import { useEffect, useState } from 'react'
import type { CipherDefinition } from '../../lib/cipher/registry'
import type { WorkspacePreset } from '../../lib/utils/workspacePresets'
import WorkspacePresetManager from '../cipher/WorkspacePresetManager'
import ConversionHistory from '../cipher/ConversionHistory'
import WhereIsThisUsed from "../cipher/WhereIsThisUsed";
import {
  loadStepAnnotationStore,
  clearScopeAnnotations,
  toggleStepBookmark,
  updateStepNote,
  removeStepNote,
  type StepAnnotationStore,
} from '../../lib/utils/stepAnnotations'
import {
  buildVisualizerPermalink,
} from '../../lib/utils/visualizerPermalink'
import CipherLifecycleBadge from '../cipher/CipherLifecycleBadge'
import SandboxToolbar from './SandboxToolbar'
import SandboxVisualizer from './SandboxVisualizer'
import StageList from './StageList'
import SandboxTrace from './SandboxTrace'
import SandboxMetrics from './SandboxMetrics'
import SandboxExport from './SandboxExport'
import SandboxAnnotations from './SandboxAnnotations'
import { useSandboxState } from './useSandboxState'
import { useSandboxAnnotations } from './useSandboxAnnotations'

interface CipherSandboxProps {
  cipher: CipherDefinition;
}

export default function CipherSandbox({ cipher }: CipherSandboxProps) {
  const sandboxState = useSandboxState({ cipher });
  
  const [annotationStore, setAnnotationStore] = useState<StepAnnotationStore>(() => ({
    version: 1,
    scopes: {},
  }));

  useEffect(() => {
    setAnnotationStore(() => loadStepAnnotationStore()) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  const annotationScope = {
    cipherId: cipher.id,
    direction: cipher.id === 'dh' ? ('encrypt' as const) : sandboxState.action,
  }

  const annotationData = useSandboxAnnotations(
    annotationStore,
    annotationScope,
    sandboxState.result?.steps?.[sandboxState.currentStep],
    sandboxState.result?.steps,
    sandboxState.currentStep,
  )

  const handlePresetLoad = (preset: WorkspacePreset) => {
    if (preset.cipherId !== cipher.id) {
      sandboxState.setError("This preset belongs to a different cipher.");
      return;
    }
    sandboxState.setAutoCompute(false);
    sandboxState.setAction(cipher.id === "dh" ? "encrypt" : preset.direction);
    sandboxState.setInput(preset.input);
    if (preset.key !== undefined) {
      sandboxState.setKey(preset.key);
    }
    if (typeof preset.options.hexInput === "boolean") {
      sandboxState.setHexInput(preset.options.hexInput);
    }
    if (typeof preset.options.rounds === "number") {
      sandboxState.setRounds(preset.options.rounds);
    }
    if (typeof preset.options.demoMode === "boolean") {
      sandboxState.setDemoMode(preset.options.demoMode);
    }
    if (typeof preset.options.bobSecret === "string") {
      sandboxState.setBobSecret(preset.options.bobSecret);
    }
    if (typeof preset.options.padding === "boolean") {
      sandboxState.setPadding(preset.options.padding);
    }
    sandboxState.setAnimationSpeed(preset.animationSpeed);
    sandboxState.setResult(null);
    sandboxState.setCurrentStep(0);
    sandboxState.setActiveTab("result");
    sandboxState.setError(null);
  };

  const handleToggleStepBookmark = () => {
    if (!sandboxState.result?.steps?.[sandboxState.currentStep] || !annotationData.activeStepId) return
    setAnnotationStore(
      toggleStepBookmark(
        annotationStore,
        annotationScope,
        annotationData.activeStepId,
        sandboxState.result.steps[sandboxState.currentStep].label,
      ),
    )
  }

  const handleSaveStepNote = (note: string) => {
    if (!sandboxState.result?.steps?.[sandboxState.currentStep] || !annotationData.activeStepId) return
    setAnnotationStore(
      updateStepNote(
        annotationStore,
        annotationScope,
        annotationData.activeStepId,
        sandboxState.result.steps[sandboxState.currentStep].label,
        note,
      ),
    )
  }

  const handleDeleteStepNote = () => {
    if (!annotationData.activeStepId) return
    setAnnotationStore(
      removeStepNote(annotationStore, annotationScope, annotationData.activeStepId),
    )
  }

  const handleClearStepAnnotations = async () => {
    if (
      !window.confirm(
        'Clear all notes and bookmarks for this cipher and direction?',
      )
    ) {
      return
    }
    setAnnotationStore(
      clearScopeAnnotations(annotationStore, annotationScope),
    )
    const permalink = buildVisualizerPermalink(window.location.href, {
      input: sandboxState.input,
      key: sandboxState.key,
      direction: cipher.id === 'dh' ? 'encrypt' : sandboxState.action,
      step: sandboxState.currentStep,
      options: {
        hexInput: sandboxState.hexInput,
        rounds: sandboxState.rounds,
        demoMode: sandboxState.demoMode,
        bobSecret: sandboxState.bobSecret,
      },
    })
    await navigator.clipboard.writeText(permalink)
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8 lg:px-8">
      {/* Title & Metadata Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
            {cipher.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
            {cipher.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CipherLifecycleBadge status={cipher.securityStatus} size="sm" />
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            {cipher.category}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Controls Column (Left) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <SandboxToolbar
            cipher={cipher}
            input={sandboxState.input}
            setInput={sandboxState.setInput}
            key={sandboxState.key}
            setKey={sandboxState.setKey}
            action={sandboxState.action}
            setAction={sandboxState.setAction}
            hexInput={sandboxState.hexInput}
            setHexInput={sandboxState.setHexInput}
            rounds={sandboxState.rounds}
            setRounds={sandboxState.setRounds}
            demoMode={sandboxState.demoMode}
            setDemoMode={sandboxState.setDemoMode}
            bobSecret={sandboxState.bobSecret}
            setBobSecret={sandboxState.setBobSecret}
            aesMode={sandboxState.aesMode}
            setAesMode={sandboxState.setAesMode}
            padding={sandboxState.padding}
            setPadding={sandboxState.setPadding}
            autoCompute={sandboxState.autoCompute}
            setAutoCompute={sandboxState.setAutoCompute}
            loading={sandboxState.loading}
            onRun={sandboxState.handleRun}
            error={sandboxState.error}
            workerError={sandboxState.workerError}
          />

          <WorkspacePresetManager
            cipherId={cipher.id}
            workspace={{
              cipherId: cipher.id,
              direction: cipher.id === "dh" ? "encrypt" : sandboxState.action,
              input: sandboxState.input,
              key: sandboxState.key,
              options: sandboxState.workspaceOptions,
              animationSpeed: sandboxState.animationSpeed,
            }}
            onLoad={handlePresetLoad}
          />
        </div>

        {/* Output & Trace Column (Right) */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <SandboxTrace
            activeTab={sandboxState.activeTab}
            setActiveTab={sandboxState.setActiveTab}
            cipher={cipher}
            result={sandboxState.result}
            loading={sandboxState.loading}
          />

          {sandboxState.activeTab === "result" ? (
            <>
              <SandboxVisualizer
                cipher={cipher}
                result={sandboxState.result}
                currentStep={sandboxState.currentStep}
              />

              <StageList
                result={sandboxState.result}
                currentStep={sandboxState.currentStep}
                animationSpeed={sandboxState.animationSpeed}
                setAnimationSpeed={sandboxState.setAnimationSpeed}
                onStepChange={sandboxState.handleStepChange}
                onCopyStepLink={sandboxState.handleCopyStepLink}
              />

              <SandboxMetrics
                result={sandboxState.result}
              />

              <SandboxExport
                cipherId={cipher.id}
                direction={cipher.id === "dh" ? "encrypt" : sandboxState.action}
                input={sandboxState.input}
                cipherKey={sandboxState.key}
                options={sandboxState.traceOptions}
                result={sandboxState.result}
                onImport={sandboxState.handleTraceImport}
              />

              <SandboxAnnotations
                activeStep={sandboxState.result?.steps?.[sandboxState.currentStep]}
                activeAnnotation={annotationData.activeAnnotation}
                bookmarkedSteps={annotationData.bookmarkedSteps}
                currentStep={sandboxState.currentStep}
                onStepSelect={sandboxState.handleStepChange}
                onSave={handleSaveStepNote}
                onDelete={handleDeleteStepNote}
                onClear={handleClearStepAnnotations}
                onToggleBookmark={handleToggleStepBookmark}
              />
            </>
          ) : (
            <ConversionHistory
              cipherId={cipher.id}
              history={sandboxState.history}
              onHistoryChange={sandboxState.setHistory}
            />
          )}
        </div>
      </div>

      <WhereIsThisUsed cipherId={cipher.id} />
    </div>
  );
}
