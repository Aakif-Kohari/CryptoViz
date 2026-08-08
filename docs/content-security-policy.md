# Content Security Policy Hardening

Issue #724 reports that the current deployment still permits `unsafe-inline` CSP
directives. This update adds a nonce-based CSP helper and Next.js middleware that
sets stricter security headers on application routes.

## What changed

- Added `lib/security/contentSecurityPolicy.ts`.
- Added a nonce-based CSP builder.
- Added strict CSP validation helpers.
- Added companion security headers.
- Added middleware that injects a per-request `x-nonce` header and CSP header.
- Added focused CSP unit tests.
- Added manual verification checklist.

## Policy goals

The generated CSP avoids `unsafe-inline` and uses:

```text
script-src 'self' 'nonce-<nonce>' 'strict-dynamic'
style-src 'self' 'nonce-<nonce>'
object-src 'none'
frame-ancestors 'none'
base-uri 'self'
script-src-attr 'none'
style-src-attr 'none'
```

## Local development

Next.js development can require `unsafe-eval`. The middleware only allows
`unsafe-eval` when `NODE_ENV !== "production"`. It does not allow
`unsafe-inline` in either development or production.

## Rollout controls

Set these optional environment variables if needed:

```text
CSP_REPORT_ONLY=true
CSP_REPORT_URI=https://your-report-endpoint.example/csp
```

Use report-only mode for an initial deployment check, then switch to enforced
mode once reports are clean.

## Manual verification

1. Start the app.
2. Open the browser developer tools Network tab.
3. Reload an application page.
4. Inspect response headers.
5. Confirm `Content-Security-Policy` is present.
6. Confirm the header does not contain `unsafe-inline`.
7. Confirm `script-src` includes a nonce.
8. Confirm `style-src` includes a nonce.
9. Confirm `object-src 'none'`.
10. Confirm `frame-ancestors 'none'`.

## Commands

```powershell
npx vitest run tests/unit/security/contentSecurityPolicy.test.ts
npm run lint
npm run build
```
