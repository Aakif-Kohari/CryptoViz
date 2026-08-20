# Interactive Learning Paths Architecture & Guide

## Overview

The **Interactive Learning Paths** feature provides structured, step-by-step cryptographic curricula for CryptoViz users. It bridges foundational cryptographic concepts with CryptoViz's interactive visualizers, attack simulators, and knowledge-check quizzes.

---

## Core Learning Paths

1. **Cryptography Fundamentals**: Security goals (CIA triad), Plaintext vs Ciphertext, and Encoding vs Encryption vs Hashing.
2. **Classical Ciphers**: Substitution ciphers (Caesar, Monoalphabetic), Vigenère polyalphabetic ciphers, and frequency analysis techniques.
3. **Modern Symmetric Encryption**: Block ciphers (AES), round transformations (SubBytes, ShiftRows, MixColumns, AddRoundKey), and Cipher Modes of Operation (ECB, CBC, CTR, GCM).
4. **Public-Key Cryptography**: Asymmetric key pairs, RSA modular exponentiation, Diffie-Hellman key exchange, and Elliptic Curve Cryptography (ECC).
5. **Hash Functions**: Cryptographic hash properties (One-way pre-image resistance, collision resistance, Avalanche effect), SHA-256 compression, and sponge constructions.
6. **Digital Signatures**: ECDSA, Ed25519, message hashing, signature verification, and Public Key Infrastructure (PKI).

---

## Key Technical Features

### 1. Progress Persistence (`hooks/useLearningPath.ts`)
- Uses `safeGetItemJson` and `safeSetItemJson` from `lib/utils/storage.ts` to save user progress in `localStorage` under key `cryptoviz_learning_path_progress_v1`.
- Tracks completed lessons, quiz scores, path completion percentages, and last active timestamp.

### 2. Resume Learning & Smart Recommendation Engine
- **Resume Learning**: Prominently highlights the last accessed path and lesson on the Learning Paths dashboard so users can resume immediately.
- **Recommended Next Lesson**: Dynamically calculates the next uncompleted lesson in the user's active path or next uncompleted topic.

### 3. Interactive Knowledge Check Quizzes
- Each lesson includes interactive multi-choice quiz questions.
- Gives immediate explanation feedback upon submission and awards milestone completion scores.

---

## Testing & Verification

Run the test suite:
```bash
npm run test tests/unit/learning
npm run test tests/unit/hooks/useLearningPath.test.ts
```
