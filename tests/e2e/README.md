# CryptoViz browser test suite

Issue #882 introduces Playwright-based browser coverage.

## Test groups

- `smoke.spec.ts` — five critical smoke/user-flow checks.
- `navigation.spec.ts` — internal link health.
- `theme.spec.ts` — dark-mode behavior when the application exposes an accessible theme hook.
- `responsive.spec.ts` — mobile layout and horizontal-overflow check.
- `visual.spec.ts` — screenshot baselines for key pages.
- `accessibility.spec.ts` — axe accessibility audits.

## Install

```powershell
npm install -D @playwright/test @axe-core/playwright
npx playwright install --with-deps
```

## Run

```powershell
npm run test:e2e
npm run test:e2e:ui
npm run test:a11y
npm run test:visual
```

## Establish visual baselines

Run this once on the canonical CI browser environment:

```powershell
npx playwright test tests/e2e/visual.spec.ts --project=chromium --update-snapshots
```

Commit the generated files under:

```text
tests/e2e/visual.spec.ts-snapshots/
```

Do not regenerate snapshots merely to hide an unexpected UI change. A visual diff should be reviewed first.

## Vercel preview

Set `BASE_URL` to the Vercel preview URL:

```powershell
$env:BASE_URL="https://your-preview-url.vercel.app"
npm run test:e2e
```

The CI workflow also accepts a `base_url` workflow-dispatch input.
