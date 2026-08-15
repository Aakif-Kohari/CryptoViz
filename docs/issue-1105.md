
# CryptoViz #1105 — Interactive Bit-Level Diff Heatmap & Hamming Distance Analyzer

## Implemented

1. `ComparisonDiffAnalyzer` is mounted below the two comparison panels.
2. Hamming distance is calculated at the bit level from decoded output bytes.
3. Bit difference percentage is calculated against the comparable prefix bits.
4. Unequal output lengths are preserved as explicit `missing-a` / `missing-b` heatmap cells.
5. Interactive byte heatmap provides per-byte A/B values, XOR status and differing-bit count.
6. Shannon entropy is calculated for both outputs in bits per byte.
7. A synchronized trace slider advances both cipher panels on one shared timeline.
8. Different trace lengths are handled by clamping the shorter cipher to its final step.
9. Existing `computeHexDiff`, `flipBitInHex` and `flipBitInString` APIs remain available.
10. Tests cover identical, inverted, unequal-length and UTF-8 outputs.

## Correctness note

For unequal lengths, the displayed percentage is based on the comparable prefix
(`min(lengthA, lengthB) * 8`) rather than treating absent bytes as zero bits.
Length deltas remain visible in the heatmap. This avoids silently biasing the
Hamming percentage when comparing different digest sizes such as MD5 and SHA-256.

## Verification

```bash
npx vitest run tests/unit/components/ComparisonDiffAnalyzer.test.tsx
npm run lint
npm run typecheck
npm test
npm run build
```
