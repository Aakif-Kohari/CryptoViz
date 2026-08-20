
# CryptoViz #1108 — Unified Web Worker Priority Queue with Chunked Progress Streaming

Implemented against the current repository worker architecture.

## Included

- Three scheduling priorities: `INTERACTIVE`, `NORMAL`, `BACKGROUND`.
- Stable FIFO ordering within each priority.
- A dedicated interactive worker lane so visualizer work does not wait behind occupied background workers.
- Abort-aware queued task cancellation.
- Typed `PROGRESS` messages with `jobId`, `percent`, and `currentMilestone`.
- 50ms worker-side progress throttling.
- `useCipherWorker` progress state and callback support.
- `cryptoWorkerClient` progress callback and cancellation protocol.
- Chunked `batchModesLab` execution with an event-loop yield between modes.
- Cipher-worker progress milestones based on execution/trace stages.
- A reusable `WorkerProgressBar` UI component.
- Priority-pool tests.

## Compatibility

Existing `WorkerPool.execute(message, transfer, onProgress)` calls remain valid.
The third argument can additionally be an options object:

```ts
pool.execute(message, transfer, {
  priority: 'INTERACTIVE',
  signal,
  onProgress: ({ percent, currentMilestone }) => {},
})
```

`useCipherWorker.runCipher` accepts:

```ts
runCipher(action, cipherId, input, key, {
  priority: 'INTERACTIVE',
  signal,
  onProgress: (percent, message) => {},
})
```

## Important limitation handled explicitly

A JavaScript Web Worker cannot safely interrupt arbitrary synchronous cryptographic code
in the middle of a single function call. Interactive work therefore gets its own worker
lane rather than forcibly terminating the worker running a background calculation.
Chunked operations such as the AES mode lab yield between chunks and observe cancellation.
This preserves worker state while allowing immediate interactive scheduling.
