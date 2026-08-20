# CryptoViz #1101 — Stream Cipher State Evolution Visualizer

This implementation adds a dedicated stream-cipher visualization layer to
`CipherLayout`.

## Modes

- **RC4:** 16×16 permutation grid, active `i`/`j` pointers, swap state and
  emitted keystream byte.
- **ChaCha20 / Salsa20:** 4×4 32-bit state matrix with active quarter-round
  words and column/diagonal/row/final phases.
- **Trivium / A5/1 / Grain-128:** register chains showing bits, clock
  positions, feedback taps, majority voting and output/feedback bits.

The visualizer is driven by the actual instrumented cipher trace rather than
recomputing cryptographic state inside React.

## Motion

Animations are CSS-only and the RC4 grid explicitly checks
`prefers-reduced-motion`. The state remains fully inspectable with motion
disabled.

## Stepping

`CipherLayout` passes the existing `currentStep` and `result.steps` into the
visualizer, so the existing StepAnimator's previous/next controls naturally
move the visual state backward and forward.

## Performance

Only the existing instrumented trace is visualized. RC4 is capped by its
existing trace budget, and register ciphers snapshot bounded trace points
instead of rendering thousands of initialization clocks.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Focused test:

```bash
npx vitest run tests/unit/components/StreamCipherVisualizer.test.tsx
```
