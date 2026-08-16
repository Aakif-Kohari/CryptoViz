# Cryptographic Code Misuse Guide

## Overview

The CryptoViz Audit Sandbox teaches implementation security through realistic cryptographic coding mistakes.

The exercises focus on a simple principle:

> Correct cryptographic primitives can still become insecure when developers use them incorrectly.

The sandbox provides five challenges:

1. Predictable key generation
2. Static IV reuse
3. Non-constant-time MAC comparison
4. Unpadded RSA encryption
5. Unauthenticated encryption

Each challenge provides:

- vulnerable source code
- an editable code environment
- an attacker-oriented verification test
- remediation guidance
- security references
- a secure implementation example

---

## 1. Predictable Key Generation

### Vulnerable pattern

```ts
key[i] = Math.floor(Math.random() * 256)