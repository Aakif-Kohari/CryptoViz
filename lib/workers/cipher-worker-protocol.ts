/**
 * Typed Web Worker Message Protocol & Payload Normalization Utility
 */

export interface CipherWorkerRequestPayload {
  action: 'encrypt' | 'decrypt';
  cipherId: string;
  input: string;
  key: string;
  id: string;
  options?: Record<string, unknown>;
}

export interface CipherWorkerResponsePayload {
  id: string;
  success: boolean;
  data?: {
    output: string;
    ciphertext?: string;
    steps?: Array<Record<string, unknown>>;
    executionTimeMs?: number;
  };
  error?: string;
}

export function normalizeWorkerResponseData(result: Record<string, unknown>): {
  output: string;
  ciphertext: string;
  steps: Array<Record<string, unknown>>;
  executionTimeMs: number;
} {
  const outputStr = String(result.output || result.ciphertext || '');
  return {
    output: outputStr,
    ciphertext: String(result.ciphertext || outputStr),
    steps: Array.isArray(result.steps) ? (result.steps as Array<Record<string, unknown>>) : [],
    executionTimeMs: typeof result.durationMs === 'number' ? result.durationMs : 0,
  };
}

export function validateWorkerPayload(payload: unknown): asserts payload is CipherWorkerRequestPayload {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Worker request payload must be a non-null object.');
  }
  const req = payload as Record<string, unknown>;
  if (req.action !== 'encrypt' && req.action !== 'decrypt') {
    throw new Error('Worker action must be "encrypt" or "decrypt".');
  }
  if (typeof req.cipherId !== 'string' || !req.cipherId) {
    throw new Error('Worker cipherId must be a valid non-empty string.');
  }
  if (typeof req.id !== 'string' || !req.id) {
    throw new Error('Worker request id must be a non-empty string.');
  }
}
