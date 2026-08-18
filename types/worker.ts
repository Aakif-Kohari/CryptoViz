
import type { CipherResult, CipherOptions } from '@/lib/cipher/types'

export type WorkerRequestType = 'encrypt' | 'decrypt'
export type WorkerPriority = 'INTERACTIVE' | 'NORMAL' | 'BACKGROUND'

export interface WorkerRequestPayload {
  cipherId: string
  input: string
  key: string
  options?: CipherOptions
  priority?: WorkerPriority
  jobId?: string
}

export interface WorkerRequest {
  type: WorkerRequestType
  requestId: string
  payload: WorkerRequestPayload
  jobId?: string
  priority?: WorkerPriority
}

export interface WorkerProgressMessage {
  type: 'PROGRESS'
  jobId: string
  percent: number
  currentMilestone: string
}

export interface WorkerResponsePayload {
  result?: CipherResult
  error?: string
  errorCode?: import('@/lib/utils/errors').CipherErrorCode
  errorMessage?: string
}

export interface WorkerResponseTimings {
  durationMs: number
}

export interface WorkerResponse {
  requestId: string
  success: boolean
  payload: WorkerResponsePayload
  timings?: WorkerResponseTimings
}
