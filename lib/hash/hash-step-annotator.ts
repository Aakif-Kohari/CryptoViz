/**
 * Uniform Hash Compression Trace Annotator
 * Used by SM3 and Whirlpool visualizers to produce milestone traces.
 */

import type { CipherStep } from '../cipher/types';

export interface HashStepAnnotationOptions {
  stepIndex: number;
  label: string;
  sublabel?: string;
  inputState: string;
  outputState: string;
  note?: string;
  isMilestone?: boolean;
}

export function createHashStep(options: HashStepAnnotationOptions): CipherStep {
  return {
    index: options.stepIndex,
    label: options.label,
    inputState: options.inputState,
    outputState: options.outputState,
    note: options.note,
    isMilestone: options.isMilestone ?? false,
  };
}
