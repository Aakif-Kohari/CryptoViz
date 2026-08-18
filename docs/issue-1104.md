
# CryptoViz #1104 — Dynamic Parameter & Domain Key Validation Assistant

## Implemented

- `AsymmetricParameterAssistant` is mounted for every `category === "asymmetric"` cipher.
- Discrete-log helper: p/g inputs, deterministic Miller-Rabin prime check and primitive-root verification.
- Factoring helper: p/q prime validation, n and φ(n) derivation, and Rabin Blum-prime enforcement.
- ECC helper: P-256, secp256k1 and Edwards25519 presets; generator coordinates/order are displayed; custom points are checked against the selected curve equation.
- PQC helper: ML-KEM-512/768/1024 and FrodoKEM-640/976/1344 parameter-set inspection and one-click templates.
- Presets populate the existing `key` state, preserving the cipher engine's existing key formats.
- Mathematical helpers are pure functions so they can run in tests and can later be moved into a Worker without changing UI contracts.

## Important compatibility note

The repository's current registry exposes several asymmetric IDs beyond the four families
called out in the issue. For asymmetric schemes whose engines do not expose structured
domain parameters (for example generic public/private-key strings), the assistant renders
a non-destructive explanation rather than inventing a key format.

The PQC templates intentionally describe parameter sets and dimensions; they do not
pretend to generate production ML-KEM/Frodo private/public keys.

## Verification

```bash
npx vitest run tests/unit/components/AsymmetricParameterAssistant.test.tsx
npm run lint
npm run typecheck
npm test
npm run build
```
