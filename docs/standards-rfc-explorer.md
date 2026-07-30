# Standards & RFC Explorer

The Standards & RFC Explorer indexes important cryptography RFCs, FIPS standards,
and NIST publications in one responsive learning page.

## Route

```text
/resources/standards-rfc
```

## What the explorer includes

- RFC entries
- FIPS entries
- NIST SP entries
- NIST IR entries
- keyword search
- publication type filter
- topic filter
- status filter
- featured reference card
- source document links
- responsive cards
- manual testing checklist

## Indexed examples

- RFC 8446 — TLS 1.3
- RFC 5869 — HKDF
- RFC 8439 — ChaCha20-Poly1305
- FIPS 197 — AES
- FIPS 180-4 — Secure Hash Standard
- FIPS 202 — SHA-3
- NIST SP 800-38D — GCM and GMAC
- NIST SP 800-56A — Key establishment
- NIST SP 800-90A — DRBGs
- NIST SP 800-185 — SHA-3 derived functions
- NIST IR 8413 — Post-quantum standardization status report

## Manual testing

1. Open `/resources/standards-rfc`.
2. Confirm RFC, FIPS, and NIST summary counts render.
3. Search for `TLS` and confirm RFC 8446 appears.
4. Filter by `FIPS` and confirm only FIPS publications remain.
5. Filter by `Hashing` and confirm hash-related publications remain.
6. Open a source link in a new tab.
7. Reset filters and confirm the full index returns.
8. Resize to mobile width and confirm the page remains usable.
