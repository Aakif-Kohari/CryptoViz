# CryptoViz #900 — Cipher Sandbox Missing ARIA Labels

Issue #900 identifies `components/cipher-sandbox/CipherSandbox.tsx` as having
interactive controls that rely on Lucide icons without explicit accessible
names.

## Implemented

Accessible names were added to:

- Move stage up
- Move stage down
- Remove stage
- Copy output
- Add stage
- Number of rounds
- Enable stage checkbox
- Encryption/decryption mode
- Step Trace tab
- Security Metrics tab
- Export / Import tab
- Copy Pipeline JSON

Existing visible text and `title` attributes are retained. The `aria-label`
values provide the explicit accessible name expected by screen readers.

## Apply

From the CryptoViz repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\apply-issue-900.ps1
```

The script is intentionally fail-fast: if the expected source has changed, it
stops instead of applying a partial edit.

## Verify

```powershell
npm run lint
npm run typecheck
npm run test
npm run test:a11y
npm run build
npx vitest run tests/unit/a11y/cipher-sandbox-900.test.ts
```

Then manually open the Cipher Sandbox and use only `Tab`, `Shift+Tab`,
`Enter`, and `Space` to navigate the controls.

The acceptance target is zero critical/serious axe findings on the Sandbox
page and a meaningful accessible name for every interactive control.
