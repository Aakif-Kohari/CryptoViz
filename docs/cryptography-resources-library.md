# Cryptography Resources Library

## Overview

The **Cryptography Resources Library** (`/resources`) provides a comprehensive, curated collection of learning materials, specifications, research papers, books, open-source repositories, interactive platforms, and video lectures.

It is designed to give students, security researchers, and software engineers direct access to authoritative cryptography literature and practical tools.

---

## Category Classifications

| Category | Description | Examples |
| --- | --- | --- |
| **Book** | Core textbooks & practical guides | *Serious Cryptography*, *Understanding Cryptography*, *Applied Cryptography*, *Real-World Cryptography* |
| **Research Paper** | Landmark academic papers & proofs | *RSA Algorithm (1978)*, *Diffie-Hellman (1976)*, *Shamir Secret Sharing (1979)*, *Shannon Secrecy (1949)* |
| **RFC** | Official IETF internet standards | *RFC 8017 (PKCS #1)*, *RFC 8446 (TLS 1.3)*, *RFC 7748 (Curve25519)*, *RFC 8439 (ChaCha20-Poly1305)* |
| **NIST** | U.S. Federal Standards & Guidelines | *FIPS 197 (AES)*, *FIPS 180-4 (SHA-2)*, *FIPS 203 (ML-KEM)*, *FIPS 204 (ML-DSA)* |
| **Repository** | Open-source crypto libraries & tools | *OpenSSL*, *paulmillr/noble-curves*, *libsodium*, *pyca/cryptography* |
| **Learning Site** | Interactive platforms & challenge suites | *CryptoHack*, *Cryptopals Challenges*, *OWASP Storage Cheat Sheet* |
| **Video** | Video lectures & courses | *Computerphile*, *Stanford Cryptography I (Dan Boneh)*, *MIT 6.857* |
| **Website** | Educational security reference sites | *OWASP*, *NIST CSRC* |

---

## Interactive Sub-Modules

The library integrates two dedicated sub-explorers:
1. **Standards & RFC Explorer** (`/resources/standards-rfc`): Dedicated interface for browsing cryptographic standards, FIPS publications, and IETF RFCs with search and tag filters.
2. **Cryptography Video Library** (`/resources/video-library`): Dedicated interface for video lectures, Computerphile tutorials, and Stanford course previews.

---

## Testing & Verification

Unit test coverage for the Resources module is located in `tests/unit/resources/cryptographyResourcesLibrary.test.ts`.
