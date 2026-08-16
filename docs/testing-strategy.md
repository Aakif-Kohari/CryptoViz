# CryptoViz Browser Testing Strategy

## Why browser tests exist

CryptoViz is visualization-heavy. Unit tests are appropriate for cipher correctness and
small utilities, but they cannot prove that routes, responsive layouts, theme controls,
keyboard interaction, or rendered visual states work together in a real browser.

Issue #882 therefore adds four browser-quality layers:

1. Playwright E2E smoke tests
2. Playwright visual regression
3. axe accessibility audits
4. Cross-browser projects for Chromium, Firefox, WebKit, plus mobile Chromium

## Coverage map

| Risk | Test |
| --- | --- |
| Home page broken | `smoke.spec.ts` |
| Visualizer index broken | `smoke.spec.ts` |
| Cipher route broken | `smoke.spec.ts` |
| Encrypt/execute flow broken | `smoke.spec.ts` |
| Internal link returns 404 | `smoke.spec.ts`, `navigation.spec.ts` |
| Theme toggle regression | `theme.spec.ts` |
| Mobile overflow | `responsive.spec.ts` |
| Visual UI regression | `visual.spec.ts` |
| WCAG regressions | `accessibility.spec.ts` |
| Browser-specific rendering | Playwright browser projects |

## Local workflow

```powershell
npm run lint
npm run typecheck
npm test
npm run test:a11y
npm run test:e2e
npm run test:visual
npm run build
```

## Visual baseline policy

Baselines are committed artifacts. They should be generated in the same browser/OS
environment used by the protected visual-regression job. Review screenshot diffs in every PR.

A changed screenshot is expected only when the UI change is intentional and the reviewer
has inspected the new baseline.

## CI

The normal CI workflow runs lint, typecheck, unit/integration tests, build, and accessibility.

The browser workflow runs the E2E suite against a Vercel preview URL when `BASE_URL` is
provided. It can also be run manually against any deployment URL.

## Vercel preview

The workflow does not guess a deployment URL. For automatic Vercel integration, configure
a repository secret named `VERCEL_TOKEN` and provide `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`.
For existing Vercel GitHub integrations, the workflow can instead receive the preview URL
through the `base_url` dispatch input.
