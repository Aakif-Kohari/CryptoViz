# Cipher Recommendation Assistant

An intelligent recommendation assistant engineered to help developers, security engineers, and students choose the optimal cryptographic algorithms based on specific operational use cases, hardware platform constraints, and compliance standards.

## Supported Use Cases & Scenarios

- **Web & API Security**: AES-256-GCM, ChaCha20-Poly1305 (HTTPS, REST APIs, TLS 1.3).
- **Password Hashing & Storage**: Argon2id, bcrypt, PBKDF2 (salted, memory-hard hashing).
- **IoT & Embedded Systems**: ChaCha20-Poly1305, XOR, Light-weight ciphers (low-power software execution without AES-NI).
- **File & Database Storage**: AES-256-XTS, AES-GCM (BitLocker, FileVault, column-level DB encryption).
- **Digital Signatures & Identity**: Ed25519, ECDSA (P-256), RSA-PSS (JWTs, TLS certificates, software signing).
- **Post-Quantum Cryptography**: ML-KEM (Kyber), ML-DSA (Dilithium) (NIST FIPS 203/204 quantum-resistant algorithms).

## Recommendation Logic & Scoring

Algorithms are evaluated from `CIPHER_REGISTRY` against:
1. **Security Goal**: Confidentiality, Authentication/Integrity, Password Hashing, Signature, Key Exchange, or Post-Quantum.
2. **Environment Constraints**: Web Server, Mobile Device, IoT/Microcontroller (no AES-NI hardware instructions), Database Storage, Quantum-Safe Target.
3. **Security Status Filter**: Filter between industry recommended standards, secure choices, legacy usage, or educational demonstration ciphers.

Each match produces:
- **Suitability Match Score %** (0–100%).
- **Security Status Badge** (`recommended`, `secure`, `legacy`, `broken`).
- **Rationale & Security Analysis**: Explanation of why the algorithm is optimal for the chosen scenario.
- **Trade-offs & Considerations**: Hardware requirements, key sizes, nonce handling warnings.
- **Implementation Code Snippets**: Production-ready code examples in JavaScript (Web Crypto / Node.js crypto) and Python (`cryptography` library).

## Verification & Manual Testing

1. Navigate to `/advisor`.
2. Confirm the top header reads **Cipher Recommendation Assistant**.
3. Click the **"Password Hashing & Storage"** scenario preset card. Confirm that **Argon2id** and **bcrypt** rank highest with top match scores.
4. Click **"View Code"** on Argon2id; verify JavaScript and Python implementation snippets display correctly.
5. Click **"IoT & Embedded Microcontrollers"** preset; confirm **ChaCha20-Poly1305** ranks at top due to pure software speed without requiring AES hardware instructions.
6. Toggle the mode tab to **"Decision Tree Wizard"** and verify step-by-step interactive navigation operates seamlessly.
