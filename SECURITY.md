# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.


## Cryptographic Code Audit Sandbox

CryptoViz includes an interactive security lab for learning about common
cryptographic implementation mistakes.

Open:

`/audit-sandbox`

The sandbox currently covers:

- Predictable cryptographic randomness
- Static IV reuse
- Non-constant-time MAC comparison
- Unpadded RSA encryption
- Unauthenticated encryption

The sandbox uses deterministic security-property checks rather than executing
user-provided JavaScript.

This feature is intended for education and secure-development training. It is
not a replacement for a professional security audit or penetration test.