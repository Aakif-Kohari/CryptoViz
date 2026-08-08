# Reliability Baseline

Issue #728 asks CryptoViz to prioritize bug fixes over feature additions and
establish release quality criteria.

## Route

```text
/quality/reliability
```

## Added files

- `app/quality/reliability/page.tsx`
- `components/quality/ReliabilityBaselineDashboard.tsx`
- `lib/quality/reliabilityBaseline.ts`
- `tests/unit/quality/reliabilityBaseline.test.ts`
- `scripts/check-reliability-baseline.mjs`
- `.github/workflows/reliability-baseline.yml`

## Baseline areas

- correctness
- tests
- accessibility
- security
- performance
- documentation
- release

## Required release checks

A PR should not be considered release-ready when any of these fail:

1. published-vector or round-trip correctness checks for touched primitives
2. focused tests for changed behavior
3. full suite or documented unrelated failures
4. production build
5. lint and formatting

## Optional but expected checks

These are not always applicable, but should be checked whenever a PR touches the
relevant area:

- keyboard and focus behavior
- input validation/sanitization
- bounded work and UI responsiveness
- docs, PR notes, and verification evidence

## Local command

```powershell
node scripts/check-reliability-baseline.mjs
```

## Manual verification

1. Open `/quality/reliability`.
2. Confirm the criteria are grouped clearly by quality area.
3. Confirm required criteria are marked.
4. Confirm the release checklist is visible.
5. Run `npx vitest run tests/unit/quality/reliabilityBaseline.test.ts`.
6. Run `npm run lint`.
7. Run `npm run build`.
8. Confirm CI has the `Reliability Baseline` workflow.
