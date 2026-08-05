# Technical Specification: AEAD Nonce & Payload Standardization

## Overview
This document specifies standard payload, padding, and nonce conventions for Authenticated Encryption with Associated Data (AEAD) ciphers in CryptoViz, aligning with **NIST SP 800-38D**, **NIST SP 800-232** (ASCON-128), and **IETF RFC 8439** (ChaCha20-Poly1305 / XChaCha20).

---

## AEAD Schemes Covered

### 1. ASCON-128
- **NIST SP 800-232** lightweight authenticated cipher.
- Accepts empty plaintexts (`pt.length === 0`) to support header-only authentication tags.
- Nonce size: 128 bits (16 bytes).

### 2. ChaCha20-Poly1305 (RFC 8439)
- Combines ChaCha20 stream cipher (counter=0 for Poly1305 key derivation, counter=1..N for payload encryption) with Poly1305 MAC over `AAD || pad16(AAD) || Ciphertext || pad16(Ciphertext) || len64(AAD) || len64(Ciphertext)`.
- Nonce size: 96 bits (12 bytes).

### 3. XChaCha20 (Extended Nonce)
- Uses HChaCha20 subkey derivation over 192-bit (24-byte) nonces before initializing standard ChaCha20 block functions.
