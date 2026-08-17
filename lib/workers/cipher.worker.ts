
/**
 * Registry-driven cipher worker with priority metadata and throttled progress streaming.
 * The cipher implementations remain unchanged; this file adds protocol-level scheduling
 * and progress reporting around their execution.
 */
import { CipherError } from '../utils/errors'
import type { WorkerRequest, WorkerResponse } from '../../types/worker'
import { getDispatcher } from './cipherDispatchRegistry'

const workerScope = self as unknown as Worker & typeof globalThis
const cancelledJobs = new Set<string>()
const lastProgressAt = new Map<string, number>()

function postProgress(jobId: string, percent: number, currentMilestone: string, force = false) {
  const now = performance.now()
  const last = lastProgressAt.get(jobId) ?? -Infinity
  if (!force && now - last < 50) return
  lastProgressAt.set(jobId, now)
  workerScope.postMessage({
    type: 'PROGRESS',
    jobId,
    percent: Math.max(0, Math.min(100, Math.round(percent))),
    currentMilestone,
  })
}

workerScope.addEventListener('message', async (event: MessageEvent<WorkerRequest | Uint8Array | any>) => {
  if (event.data?.type === 'CANCEL') {
    const id = event.data.jobId ?? event.data.requestId
    if (id) cancelledJobs.add(id)
    return
  }

  const startTime = performance.now()
  let requestData: any = event.data
  try {
    if (requestData instanceof Uint8Array) {
      requestData = JSON.parse(new TextDecoder().decode(requestData))
    }
    const { type, requestId, payload, jobId = requestId } = requestData as WorkerRequest
    if (cancelledJobs.has(jobId)) throw new DOMException('The user aborted the request.', 'AbortError')
    const { cipherId, input, key, options } = payload
    const safeOptions = options || {}
    postProgress(jobId, 0, 'Starting cipher', true)

    const dispatcher = await getDispatcher(cipherId)
    postProgress(jobId, 10, 'Loading cipher implementation', true)
    if (cancelledJobs.has(jobId)) throw new DOMException('The user aborted the request.', 'AbortError')

    const handler = type === 'encrypt' ? dispatcher.encrypt : dispatcher.decrypt
    postProgress(jobId, 20, 'Executing cryptographic operation', true)
    const result = await handler(input, key, safeOptions) as import('../cipher/types').CipherResult

    // Trace-aware progress gives the UI useful milestones without flooding postMessage.
    const steps = result.steps ?? []
    if (steps.length) {
      const total = steps.length
      for (let index = 0; index < total; index++) {
        if (cancelledJobs.has(jobId)) throw new DOMException('The user aborted the request.', 'AbortError')
        const step = steps[index]
        postProgress(jobId, 20 + ((index + 1) / total) * 70, step.label || `Trace step ${index + 1}`)
      }
    } else {
      postProgress(jobId, 90, 'Finalizing result', true)
    }
    postProgress(jobId, 100, 'Complete', true)

    const response: WorkerResponse = {
      requestId,
      success: true,
      payload: { result },
      timings: { durationMs: performance.now() - startTime },
    }
    workerScope.postMessage(response)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCode = error instanceof CipherError ? error.code : undefined
    const requestId = typeof requestData === 'object' && requestData ? requestData.requestId : 'unknown'
    workerScope.postMessage({
      requestId,
      success: false,
      payload: { error: errorMessage, errorCode, errorMessage },
      timings: { durationMs: performance.now() - startTime },
    } satisfies WorkerResponse)
  } finally {
    const id = requestData?.jobId ?? requestData?.requestId
    if (id) {
      cancelledJobs.delete(id)
      lastProgressAt.delete(id)
    }
  }
})
