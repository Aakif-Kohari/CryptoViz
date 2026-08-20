
# Issue #1106 — Full Registry Integration and Type-Safe Pipeline Execution

Implemented against the current CryptoViz architecture.

## Key decisions

- The palette is derived directly from `CIPHER_REGISTRY`; there is no second
  hard-coded algorithm list.
- Pipeline execution uses the repository's registry-backed `cipher.worker.ts`
  and `cipherDispatchRegistry.ts` rather than `pipelineEngine.ts` toy switch cases.
- The repository's current worker client is `cryptoWorkerClient.ts` for a
  separate `crypto.worker.ts` protocol. For cipher execution, the correct
  existing worker is `cipher.worker.ts`; the pipeline client uses that same
  typed worker protocol.
- Each stage stores explicit input/output representation types.
- Compatibility warnings are emitted between adjacent stages and a Base64/Hex
  adapter can be inserted from the warning.
- Every successful stage retains its worker `CipherResult.steps`.
- AbortController cancellation terminates the active pipeline worker, ensuring
  an earlier-stage edit cannot leave later stages running.

## Validation

```bash
npx vitest run tests/unit/pipeline/PipelineEngineWorker.test.ts
npm run lint
npm run typecheck
npm test
npm run build
```
