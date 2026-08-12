# Dedicated Cipher Visualizers Hub

## Overview

The **Cipher Visualizers Hub** (`/visualizer`) is the central interactive directory for all cryptographic algorithm visualizers, step-by-step state sandboxes, and specialized demonstration tools in CryptoViz.

It enables users to search, filter by mathematical category or NIST security status, sort algorithms, and quickly launch interactive visualizers, documentation guides, and playgrounds.

---

## Key Features

### 1. Unified Algorithm & Specialized Visualizer Directory
- Displays all algorithms registered in `lib/cipher/registry.ts` (Classical, Symmetric, Asymmetric, Hash).
- Displays specialized multi-step visualizers (e.g. AES Key Expansion, Argon2id Memory-Hard KDF, DES Key Schedule, ECB Pattern Leakage, Hash Collision Birthday Attacks, RSA Key Generation, Merkle Tree Proofs).

### 2. Real-Time Search & Filtering
- **Keyword Search**: Instant search matching cipher titles, descriptions, categories, or security statuses.
- **Category Tabs**: Filter by `All`, `Classical`, `Symmetric`, `Asymmetric`, `Hashing`, or `Specialized Demos`.
- **Security Status Filter**: Filter by NIST / lifecycle security status (`Recommended`, `Secure`, `Legacy`, `Deprecated`, `Broken`, `Experimental`).
- **Sorting**: Sort by Name (A-Z), Category, or Security Status.

### 3. Direct Action Navigation & Links
Every card on the hub provides direct navigation to:
- **Open Visualizer**: `/visualizer/[cipher]` or specialized visualizer route.
- **Interactive Playground**: Dedicated interactive sandbox.
- **Documentation & Theory**: Detailed mathematical background and worked examples (`/docs`).

### 4. Pinned & Recently Viewed Favorites
- Integrated with local storage pinned algorithms (`<PinnedCiphers />`) and recent history (`<RecentlyViewedCiphers />`).

---

## Route Structure

| Route | Description |
| --- | --- |
| `/visualizer` | Dedicated Cipher Visualizers Hub |
| `/visualizer/[cipher]` | Dynamic visualizer page for any algorithm in `CIPHER_REGISTRY` |
| `/visualizer/aes-key-expansion` | AES Key Expansion & Schedule Visualizer |
| `/visualizer/argon2id` | Argon2id KDF Memory Matrix Visualizer |
| `/visualizer/des-key-schedule` | DES 16-Round Key Schedule Visualizer |
| `/visualizer/ecb-pattern` | ECB Mode Bitmap Pattern Leakage Visualizer |
| `/visualizer/hash-collision` | Birthday Attack Hash Collision Simulator |
| `/visualizer/rsa-keygen` | RSA Prime Selection & Key Generation Step Visualizer |
| `/visualizer/sha256-compression` | SHA-256 64-Round Compression Function Visualizer |
| `/visualizer/merkle-proof` | Merkle Tree Proof Audit Path Visualizer |
| `/visualizer/crc32` | CRC32 Checksum LFSR Polynomial Visualizer |
| `/visualizer/idea` | IDEA 8.5-Round Cipher Visualizer |

---

## Testing & Verification

Comprehensive unit tests are located in `tests/unit/components/CipherVisualizersHub.test.tsx`.
