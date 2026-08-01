# Cryptographic Case Studies

## Overview

The **Cryptographic Case Studies** module (`/case-studies`) presents technical breakdowns of famous real-world cryptographic failures, historical cryptanalysis, implementation bugs, PRNG collapses, PKI compromises, and security breaches.

---

## Included Case Studies

| Case Study | Category | Affected Primitives | Key Root Cause |
| --- | --- | --- | --- |
| **Enigma Machine Cryptanalysis** | Cryptanalysis | Enigma Rotor Cipher | Self-inverse reflector invariant ($E(x) \neq x$) and operator habit patterns |
| **Heartbleed OpenSSL Vulnerability** | Implementation Bug | TLS Heartbeat Extension | Missing buffer bounds check in `memcpy()` reading 64KB heap memory |
| **WannaCry Ransomware** | Ransomware | AES-128 / RSA-2048 | Exploited SMBv1 EternalBlue vulnerability; encrypted files with AES-128 |
| **Debian OpenSSL PRNG Flaw** | RNG Flaw | RSA / DSA / SSH Keys | Removal of entropy update lines reduced PRNG seed to 32,768 process IDs |
| **Stuxnet Digital Signature Breach** | CA / PKI Compromise | VeriSign Code Signing | Stolen private signing keys of semiconductor vendors to bypass Windows DSE |
| **DigiNotar CA Compromise** | CA / PKI Compromise | X.509 Wildcard Certs | Rogue `*.google.com` certificates issued via breached Dutch CA root key |
| **Sony PS3 ECDSA Nonce Reuse** | Nonce Reuse | ECDSA Signatures | Constant ECDSA random nonce $k$ allowed derivation of master private key |
| **SHAttered SHA-1 Collision** | Cryptanalysis | SHA-1 Hash Function | First practical SHA-1 collision generating two distinct PDF documents |
| **Dual_EC_DRBG Backdoor** | RNG Flaw | Dual_EC_DRBG PRNG | Kleptographic relationship $P = d \cdot Q$ embedded in NIST standard |

---

## Routes & Pages

- `/case-studies`: Interactive hub featuring search bar, category tabs, severity filters, and summary metrics.
- `/case-studies/[id]`: SSG prerendered detail page for each case study with timeline, root cause breakdown, code/math snippets, and defensive recommendations.
