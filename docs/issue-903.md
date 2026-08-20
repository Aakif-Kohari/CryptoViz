# Issue #903

Added dedicated security suites for XSS sanitization, CSP correctness,
permalink URL injection, and browser-storage injection.

The repository already exposes `npm run test:security` as `vitest run tests/security`,
so the new suites are automatically discovered. The existing CI also runs
`npm test`; the supplied CI patch adds an explicit security gate for clearer
failure reporting.
