
import type { CryptoWorkerRequest, CryptoWorkerResponse } from './crypto.worker'
import type { WorkerPriority } from './pool'

export interface CryptoWorkerProgress {
  percent: number
  currentMilestone: string
  jobId: string
}
export interface CryptoWorkerRunOptions {
  priority?: WorkerPriority
  signal?: AbortSignal
  onProgress?: (percent: number, message: string) => void
}

type Resolvers = {
  resolve: (value: any) => void
  reject: (reason?: any) => void
  onProgress?: (percent: number, message: string) => void
  signal?: AbortSignal
  onAbort?: () => void
}

class CryptoWorkerClient {
  private worker: Worker | null = null
  private pendingRequests = new Map<string, Resolvers>()

  private initWorker() {
    if (!this.worker && typeof window !== 'undefined') {
      this.worker = new Worker(new URL('./crypto.worker.ts', import.meta.url), { type: 'module' })
      this.worker.onmessage = (event: MessageEvent<CryptoWorkerResponse | CryptoWorkerProgress>) => {
        const data = event.data as any
        if (data?.type === 'PROGRESS') {
          const request = this.pendingRequests.get(data.jobId)
          request?.onProgress?.(
            Math.max(0, Math.min(100, Number(data.percent))),
            String(data.currentMilestone ?? ''),
          )
          return
        }
        const id = data.id
        const resolvers = this.pendingRequests.get(id)
        if (!resolvers) return
        this.pendingRequests.delete(id)
        if (resolvers.signal && resolvers.onAbort) {
          resolvers.signal.removeEventListener('abort', resolvers.onAbort)
        }
        if (data.success) resolvers.resolve(data.result)
        else resolvers.reject(new Error(data.error))
      }
    }
  }

  public async runCryptoOperation<T>(
    operation: CryptoWorkerRequest['operation'],
    payload: unknown,
    options?: CryptoWorkerRunOptions,
  ): Promise<T> {
    this.initWorker()
    return new Promise<T>((resolve, reject) => {
      const id = crypto.randomUUID()
      const priority = options?.priority ?? 'NORMAL'
      const onAbort = () => {
        this.worker?.postMessage({ type: 'CANCEL', jobId: id })
        this.pendingRequests.delete(id)
        reject(new DOMException('The user aborted the request.', 'AbortError'))
      }
      this.pendingRequests.set(id, {
        resolve, reject, onProgress: options?.onProgress,
        signal: options?.signal, onAbort,
      })
      if (options?.signal?.aborted) {
        onAbort()
        return
      }
      options?.signal?.addEventListener('abort', onAbort, { once: true })
      if (this.worker) {
        this.worker.postMessage({ id, operation, payload, jobId: id, priority })
      } else {
        onAbort()
      }
    })
  }

  public terminate() {
    this.worker?.terminate()
    this.worker = null
    for (const { reject, signal, onAbort } of this.pendingRequests.values()) {
      if (signal && onAbort) signal.removeEventListener('abort', onAbort)
      reject(new Error('Worker terminated'))
    }
    this.pendingRequests.clear()
  }
}
export const cryptoWorkerClient = new CryptoWorkerClient()
