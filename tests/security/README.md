# Security tests

`sanitization.security.test.ts`: OWASP-style XSS vectors and sanitization.
`csp.security.test.ts`: production `vercel.json` CSP.
`permalink.security.test.ts`: dangerous URL schemes and URL injection.
`storage.security.test.ts`: hostile storage data and prototype-pollution-shaped payloads.

Run `npm run test:security`.
