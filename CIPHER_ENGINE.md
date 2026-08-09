# CIPHER_ENGINE.md — Core Computation Logic Plan

> This document defines the exact mathematical operations, step data, and
> implementation contracts for every cipher and algorithm in CryptoViz.
> It is the authoritative reference for `lib/cipher/` development.
> Read this before writing a single line of cipher code.

---

## How to read this document

Each cipher section contains:
- **Mathematical foundation** — the actual operations, not hand-waving
- **Step schema** — what `CipherStep[]` must contain for the visualizer
- **Edge cases** — inputs that must be handled without crashing
- **Test vectors** — exact input/output pairs from published standards
- **Implementation notes** — browser/Worker-specific gotchas

---

## Shared types (lib/cipher/types.ts)

```typescript
export type Encoding = 'utf8' | 'hex' | 'base64' | 'binary'
export type CipherDirection = 'encrypt' | 'decrypt'

export interface CipherStep {
  index: number
  label: string              // e.g. "Round 3 - SubBytes"
  sublabel?: string          // e.g. "Applying S-Box to each byte"
  inputState: string         // snapshot before this step (hex)
  outputState: string        // snapshot after this step (hex)
  highlight?: number[]       // byte/char indices changed in this step
  matrix?: string[][]        // for AES state, Playfair grid, etc.
  table?: { key: string; value: string }[]  // for key schedule display
  note: string               // human-readable explanation of what happened
  isMilestone?: boolean      // true for major steps (show in summary mode)
}

export interface CipherResult {
  output: string
  outputEncoding: Encoding
  steps: CipherStep[]
  metadata: CipherMetadata
  durationMs: number
}

export interface CipherMetadata {
  name: string
  keySize?: number           // bits
  blockSize?: number         // bits
  rounds?: number
  securityStatus: 'secure' | 'legacy' | 'deprecated' | 'broken'
  breakingComplexity?: string  // e.g. "2^128 operations"
  yearDesigned?: number
  standardBody?: string        // e.g. "NIST FIPS 197"
}

export class CipherError extends Error {
  constructor(public code: CipherErrorCode, message: string) {
    super(message)
    this.name = 'CipherError'
  }
}

export type CipherErrorCode =
  | 'INPUT_REQUIRED'
  | 'INPUT_TOO_LONG'       // > 4096 bytes
  | 'INVALID_KEY'
  | 'INVALID_KEY_LENGTH'
  | 'INVALID_PADDING'
  | 'INVALID_IV'
  | 'WEAK_KEY'             // DES weak keys
  | 'KEY_PARITY_ERROR'     // DES key parity
  | 'ALGORITHM_UNSUPPORTED'
  | 'WEBCRYPTO_UNAVAILABLE'
  | 'WORKER_TIMEOUT'
```

---

## Part 1 - Classical Ciphers

### 1.1 Caesar Cipher

**Mathematical foundation**

```
Encrypt: C(i) = (P(i) + k) mod 26
Decrypt: P(i) = (C(i) - k + 26) mod 26

Where:
  P(i) = plaintext character index (A=0, B=1, ... Z=25)
  C(i) = ciphertext character index
  k    = shift key (integer 1-25)

Non-alphabetic characters are passed through unchanged.
```

**Step schema** - one step per character:
```typescript
// Step 0: "Key setup"
{
  label: "Key setup",
  inputState: "KEY: 3",
  outputState: "SHIFT: +3",
  note: "Each letter will be shifted 3 positions forward in the alphabet.",
  isMilestone: true
}

// Steps 1..n: one per character
{
  label: `Character ${i+1} - '${char}'`,
  inputState: charToHex(plaintextChar),
  outputState: charToHex(cipherChar),
  highlight: [i],
  note: `'${char}' (index ${p}) + shift ${k} = ${(p+k)%26} = '${result}' (mod 26)`
}
```

**Edge cases:**
- `k = 0`: identity transformation - still produce steps
- `k = 13`: ROT13 special case - note it in metadata
- Input with only non-alpha characters: steps pass through, output = input
- Unicode: only transform ASCII A-Z and a-z, leave everything else untouched
- Negative shift on decrypt: use `(index - k + 26) % 26`, not `(index - k) % 26`

**Test vectors:**
```
"HELLO WORLD" + k=3  -> "KHOOR ZRUOG"
"ATTACK AT DAWN" + k=13 -> "NGGNPX NG QNJA"
"xyz" + k=3          -> "abc"
"" + k=5             -> ""
"Hello, World!" + k=1 -> "Ifmmp, Xpsme!"
```

---

### 1.2 ROT13

ROT13 is Caesar with `k=13`. Implement as a thin wrapper:

```typescript
export function rot13(input: string): CipherResult {
  const result = caesar.encrypt(input, '13')
  return {
    ...result,
    metadata: { ...result.metadata, name: 'ROT13', note: 'Self-inverse: ROT13(ROT13(x)) = x' }
  }
}
```

ROT13 has no separate decrypt - it is its own inverse. The UI shows a single "Transform" button.

---

### 1.3 Vigenere Cipher

**Mathematical foundation**

```
Key is repeated to match plaintext length (key stream).

Encrypt: C(i) = (P(i) + K(i mod |key|)) mod 26
Decrypt: P(i) = (C(i) - K(i mod |key|) + 26) mod 26

Where K(j) = key character at position j (A=0, B=1, ... Z=25)
```

**Steps:**
1. Step 0: Key setup - show full key and extended key stream
2. Steps 1..n: Per character - show `P(i) + K(i)` arithmetic
3. Final step: Full alignment table (plaintext row, key row, ciphertext row) as `matrix`

**Full alignment table in step metadata:**
```typescript
{
  label: "Vigenere table alignment",
  matrix: [
    ["P:", ...plaintext.split('')],
    ["K:", ...keystream.split('')],
    ["C:", ...ciphertext.split('')]
  ],
  note: "Each column shows the letter-to-letter transformation."
}
```

**Test vectors:**
```
"ATTACKATDAWN" + key="LEMON" -> "LXFOPVEFRNHR"
"HELLO" + key="KEY"          -> "RIJVS"
```

---

### 1.4 Playfair Cipher

**Mathematical foundation**

**Key square construction:**
```
1. Remove duplicate letters from key, append remaining alphabet (omit J, merge I/J)
2. Fill 5x5 grid left-to-right, top-to-bottom

Example key "MONARCHY":
  M O N A R
  C H Y B D
  E F G I K
  L P Q S T
  U V W X Z
```

**Digraph rules (encrypt):**
```
Prepare plaintext:
  - Remove non-alpha, uppercase all
  - Split into pairs (bigrams)
  - If pair has same letters, insert 'X' between them
  - If odd length, append 'X'

For each bigram (L1, L2):
  Case 1 - Same row:    replace each with letter to its RIGHT (wrap around row)
  Case 2 - Same column: replace each with letter BELOW it (wrap around column)
  Case 3 - Rectangle:   L1 -> same row, column of L2
                        L2 -> same row, column of L1
```

**Steps:**
```typescript
// Step 0: Grid construction
{
  label: "Key square construction",
  matrix: grid5x5,   // string[][]
  note: "5x5 grid built from key 'MONARCHY' with duplicates removed."
}

// Step per bigram:
{
  label: `Bigram ${i+1} - '${l1}${l2}'`,
  matrix: grid5x5,
  highlight: [row1*5+col1, row2*5+col2],  // positions in grid
  note: `Rectangle rule: ${l1}(${row1},${col1}) and ${l2}(${row2},${col2}) -> swap columns`
}
```

**Test vectors:**
```
"HIDE THE GOLD IN THE TREE STUMP" + key="PLAYFAIR EXAMPLE"
  -> "BMODZBXDNABEKUDMUIXMMOUVIF"
```

---

### 1.5 Rail Fence Cipher

**Mathematical foundation**

```
Write plaintext in a zigzag pattern across N rails, then read off each rail.

Example: "WEAREDISCOVEREDFLEEAATONCE" with 3 rails:

Rail 0: W . . . E . . . I . . . V . . . D . . . E . . . E
Rail 1: . E . A . E . S . O . E . E . F . E . A . O . C .
Rail 2: . . R . . . D . . . C . . . R . . . L . . . N . .

Ciphertext: read rail 0, then rail 1, then rail 2
```

**Algorithm:**

```typescript
// Compute which rail each character belongs to
function getRailPattern(length: number, rails: number): number[] {
  const pattern: number[] = []
  let rail = 0
  let direction = 1
  for (let i = 0; i < length; i++) {
    pattern.push(rail)
    if (rail === 0) direction = 1
    if (rail === rails - 1) direction = -1
    rail += direction
  }
  return pattern
}
// Encrypt: group characters by rail, then concatenate
// Decrypt: compute which positions belong to each rail, read in order
```

**Steps:**
```typescript
// Step 0: Rail layout visualization
{
  label: "Rail layout",
  matrix: railGrid,   // N rows, each row is array of chars (dots for empty)
  note: `Plaintext written in zigzag across ${rails} rails.`
}

// Steps 1..N: one per rail being read
{
  label: `Reading rail ${r}`,
  highlight: indicesOnRail,
  note: `Rail ${r} contains: "${railContent}"`
}
```

---

### 1.6 Atbash Cipher

```
Map: A<->Z, B<->Y, C<->X, ...
C(i) = 25 - P(i)
```

Single step cipher - show full alphabet mirror table as the one step.

---

## Part 2 - Symmetric Ciphers

### 2.1 XOR Cipher

**Mathematical foundation**

```
Encrypt: C(i) = P(i) XOR K(i mod |key|)
Decrypt: P(i) = C(i) XOR K(i mod |key|)  // XOR is self-inverse
```

**Steps:** One per byte - show binary representation of P, K, and C with XOR truth table.

```typescript
{
  label: `Byte ${i} XOR`,
  inputState: toBinary8(plainByte),    // "01101000"
  outputState: toBinary8(cipherByte),  // "00101010"
  table: [
    { key: "Plaintext byte", value: `${toBinary8(p)} (0x${hex(p)})` },
    { key: "Key byte",       value: `${toBinary8(k)} (0x${hex(k)})` },
    { key: "XOR result",     value: `${toBinary8(p^k)} (0x${hex(p^k)})` }
  ],
  note: `${hex(p)} XOR ${hex(k)} = ${hex(p^k)}`
}
```

Always include a final `isMilestone` step explaining why repeating-key XOR is broken (frequency analysis, crib-dragging).

---

### 2.2 One-Time Pad (OTP)

XOR where key is:
1. Truly random
2. At least as long as plaintext
3. Never reused

**Implementation:**
- Key input: user-provided hex string (same length as input) or browser-generated via `crypto.getRandomValues()`
- Key length validation: `key.length !== plaintext.length -> CipherError('INVALID_KEY_LENGTH')`
- Generate button: fills key field with `crypto.getRandomValues(new Uint8Array(n))`

Steps: same as XOR, but add a step 0 showing key randomness analysis (entropy check).

---

### 2.3 DES (Data Encryption Standard)

> Security status: **broken** - 56-bit key exhausted by brute force (1999, EFF Deep Crack). Educational only.

**Mathematical foundation - complete DES algorithm:**

```
Key: 64 bits (8 bytes), 56 effective bits (every 8th bit is parity)
Block: 64 bits
Rounds: 16 Feistel rounds
```

**Step 1: Key schedule (16 subkeys)**
```
1. Apply PC-1 permutation to 64-bit key -> 56-bit key
   PC-1 table (drop parity bits):
   [57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,
    60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,
    29,21,13,5,28,20,12,4]

2. Split into C0 (28 bits left) and D0 (28 bits right)

3. For each round i = 1..16:
   a. Left-rotate C(i-1) and D(i-1) by SHIFTS[i] positions
      SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1]
   b. Concatenate C(i) + D(i) -> 56 bits
   c. Apply PC-2 permutation -> 48-bit subkey K(i)
      PC-2 table:
      [14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,
       16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,
       44,49,39,56,34,53,46,42,50,36,29,32]
```

**Step 2: Initial permutation (IP)**
```
IP table (64 entries):
[58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,
 64,56,48,40,32,24,16,8,57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,
 61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7]
```

**Step 3: 16 Feistel rounds**
```
Split IP result into L0 (32 bits) and R0 (32 bits)

For round i = 1..16:
  L(i) = R(i-1)
  R(i) = L(i-1) XOR F(R(i-1), K(i))

The F function (Feistel function):
  a. Expansion E: R(i-1) 32 bits -> 48 bits
     E table (48 entries):
     [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,
      16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1]

  b. XOR with subkey: E(R) XOR K(i) -> 48 bits

  c. S-Box substitution: Split 48 bits into 8 groups of 6 bits
     For each group j (6 bits: b1 b2 b3 b4 b5 b6):
       row    = (b1 << 1) | b6         (outer bits -> 0-3)
       column = b2 b3 b4 b5            (inner bits -> 0-15)
       output = S(j)[row][column]      -> 4 bits

     8 S-Boxes (each is 4x16 table, values 0-15):
     S1: [[14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],
          [0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],
          [4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],
          [15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]]
     S2: [[15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],
          [3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],
          [0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],
          [13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]]
     S3: [[10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],
          [13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],
          [13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],
          [1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]]
     S4: [[7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],
          [13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],
          [10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],
          [3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]]
     S5: [[2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],
          [14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],
          [4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],
          [11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]]
     S6: [[12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],
          [10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],
          [9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],
          [4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]]
     S7: [[4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],
          [13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],
          [1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],
          [6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]]
     S8: [[13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],
          [1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],
          [7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],
          [2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]]

  d. P permutation: 32-bit S-Box output -> 32 bits
     P table: [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,
               2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25]
```

**Step 4: Final permutation (IP-inverse)**
```
Concatenate R16 + L16 (note the SWAP - R before L)
IP-inverse table:
[40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,
 37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,
 34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25]
```

**Weak keys - must detect and warn:**
```typescript
const DES_WEAK_KEYS = [
  '0101010101010101', 'FEFEFEFEFEFEFEFE',
  'E0E0E0E0F1F1F1F1', '1F1F1F1F0E0E0E0E',
  '011F011F010E010E', '1F011F010E010E01',
  'E0FEE0FEF1FEF1FE', 'FEE0FEE0FEF1FEF1',
  '01E001E001F101F1', 'E001E001F101F101',
  '1FE01FE00EF10EF1', 'E01FE01FF10EF10E',
  '01FE01FE01FE01FE', 'FE01FE01FE01FE01',
  '1FFE1FFE0EFE0EFE', 'FE1FFE1FFE0EFE0E'
]
// If key matches, throw CipherError('WEAK_KEY') with full explanation shown in UI
```

**Test vectors (NIST FIPS 81):**
```
Key:       0133457799BBCDFF
Plaintext: 0123456789ABCDEF
Ciphertext: 85E813540F0AB405
```

**Implementation approach:**
- Implement DES entirely in pure TypeScript bit manipulation
- Do NOT use WebCrypto for DES (removed from modern browsers intentionally)
- Use `Uint8Array` with bitwise ops - avoid BigInt for DES (32-bit words fit in number)
- Noble/ciphers does not support DES - this is a full custom implementation

---

### 2.4 Triple DES (3DES)

```
3DES-EDE with 168-bit key (three 56-bit DES keys K1, K2, K3):
  Encrypt: C = DES_K3(DES_K2_DECRYPT(DES_K1(P)))
  Decrypt: P = DES_K1_DECRYPT(DES_K2(DES_K3_DECRYPT(C)))

2-key variant (K1 = K3, 112-bit effective):
  Also implement for completeness.
```

Implementation: wrap the DES implementation three times. Steps show which DES stage is active (1st encrypt, middle decrypt, final encrypt).

Security status: deprecated (NIST deprecated 3DES in 2017, disallowed after 2023).

---

### 2.5 AES (Advanced Encryption Standard)

> AES is the most critical cipher to implement richly and correctly.

**Mathematical foundation**

```
Block size: 128 bits (always)
Key sizes:  128, 192, or 256 bits -> 10, 12, or 14 rounds

State: 4x4 matrix of bytes arranged column-major:
  [s00 s10 s20 s30]
  [s01 s11 s21 s31]
  [s02 s12 s22 s32]
  [s03 s13 s23 s33]
```

**Key expansion (Key Schedule)**

```typescript
const RCON = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36]

// AES-128: expand 16-byte key into 11 round keys (10 rounds + initial)
// Nk = 4 words in key, Nr = 10, total words needed = 44
// W[0..3] = initial key words
// For i = 4..43:
//   temp = W[i-1]
//   if i mod 4 === 0:
//     temp = SubWord(RotWord(temp)) XOR RCON[i/4 - 1]
//   W[i] = W[i-4] XOR temp

// SubWord: apply S-Box to each byte of a 32-bit word
// RotWord: cyclic left shift [a0,a1,a2,a3] -> [a1,a2,a3,a0]
```

**S-Box (forward):**
```typescript
const SBOX: Uint8Array = new Uint8Array([
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
])
// Inverse SBOX derived by inverting the above mapping
```

**Four round transformations:**

```
1. SubBytes
   Apply SBOX to each of the 16 state bytes independently.

2. ShiftRows
   Row 0: no shift
   Row 1: cyclic left shift by 1
   Row 2: cyclic left shift by 2
   Row 3: cyclic left shift by 3

3. MixColumns
   Each column treated as a polynomial over GF(2^8).
   Multiply by the matrix:
     [2 3 1 1]
     [1 2 3 1]
     [1 1 2 3]
     [3 1 1 2]

   GF(2^8) multiplication (irreducible polynomial: x^8 + x^4 + x^3 + x + 1):
     gmul(a, 2): xtime(a) = (a << 1) ^ (a & 0x80 ? 0x1b : 0)
     gmul(a, 3): xtime(a) ^ a
     gmul(a, 1): a

4. AddRoundKey
   XOR state with 128-bit round key for this round.
```

**Round structure:**
```
Initial:           AddRoundKey(state, roundKey[0])

Rounds 1..Nr-1:    SubBytes -> ShiftRows -> MixColumns -> AddRoundKey

Final round:       SubBytes -> ShiftRows -> AddRoundKey  (no MixColumns)
```

**Step schema for AES (AES-128 = ~44 steps):**
```typescript
[
  { label: "Initial AddRoundKey", sublabel: "XOR plaintext with K0", matrix: state4x4, isMilestone: true },
  // Round 1-9:
  { label: "Round 1 - SubBytes",    matrix: stateAfterSubBytes, highlight: changedCells },
  { label: "Round 1 - ShiftRows",   matrix: stateAfterShiftRows },
  { label: "Round 1 - MixColumns",  matrix: stateAfterMixCols },
  { label: "Round 1 - AddRoundKey", matrix: stateAfterARK, isMilestone: true },
  // ... repeated for rounds 2-9
  // Final round (no MixColumns):
  { label: "Round 10 - SubBytes",   matrix: ... },
  { label: "Round 10 - ShiftRows",  matrix: ... },
  { label: "Round 10 - AddRoundKey (final)", matrix: ..., isMilestone: true },
]
```

**The `matrix` field for AES is always a 4x4 array of hex byte strings:**
```typescript
[["63","7c","77","7b"],
 ["f2","6b","6f","c5"],
 ["30","01","67","2b"],
 ["fe","d7","ab","76"]]
```

**Modes of operation:**
```
ECB - encrypt each block independently (never use in practice; visualize penguin problem)
CBC - C(i) = E(P(i) XOR C(i-1)), C(0) = IV
CTR - keystream: E(nonce || counter), then XOR with plaintext (stream cipher mode)
GCM - CTR + GHASH authentication tag (show auth tag generation as separate steps)
```

**Implementation strategy:**
- Use `@noble/ciphers` for correct AES output (audited, zero-deps)
- Build a parallel instrumented AES in pure TypeScript that captures state after each sub-step
- Instrumented version is visualization-only - never used for sensitive data
- Real output uses WebCrypto: `crypto.subtle.encrypt({name:'AES-CBC',iv},key,data)`

**Test vectors (NIST FIPS 197 Appendix B):**
```
Key:       2b7e151628aed2a6abf7158809cf4f3c
Plaintext: 3243f6a8885a308d313198a2e0370734
Expected:  3925841d02dc09fbdc118597196a0b32

After initial AddRoundKey: 193de3bea0f4e22b9ac68d2ae9f84808
After SubBytes R1:         d42711aee0bf98f1b8b45de51e415230
After ShiftRows R1:        d4bf5d30e0b452aeb84111f11e2798e5
After MixColumns R1:       046681e5e0cb199a48f8d37a2806264c
After AddRoundKey R1:      a49c7ff2689f352b6b5bea43026a5049
```

**Additional NIST vectors (AESAVS):**
```
128-bit ECB:
  Key:       00000000000000000000000000000000
  Plaintext: f34481ec3cc627bacd5dc3fb08f273e6
  Cipher:    0336763e966d92595a567cc9ce537f5e

256-bit CBC:
  Key: 0000000000000000000000000000000000000000000000000000000000000000
  IV:  00000000000000000000000000000000
  PT:  014730f80ac625fe84f026c60bfd547d
  CT:  5c9d844ed46f9885085e5d6a4f94c7d7
```

---

## Part 3 - Asymmetric Cryptography

### 3.1 RSA (Rivest-Shamir-Adleman)

**Mathematical foundation**

```
Key generation:
  1. Choose two large primes p and q
  2. n = p * q  (modulus)
  3. lambda(n) = lcm(p-1, q-1)  (Carmichael's totient)
  4. Choose e: 1 < e < lambda(n), gcd(e, lambda(n)) = 1  (commonly e = 65537 = 0x10001)
  5. d = e^-1 mod lambda(n)  (modular inverse via Extended Euclidean Algorithm)

Public key:  (n, e)
Private key: (n, d)

Encrypt: C = M^e mod n
Decrypt: M = C^d mod n
```

**Two modes in visualizer:**
- Demo mode: small primes (p=61, q=53, n=3233, e=17, d=2753) - shows full arithmetic
- Real mode: WebCrypto RSA-OAEP 2048-bit - shows output only, explains why math is hidden

**Extended Euclidean Algorithm (for computing d):**
```typescript
function extendedGCD(a: bigint, b: bigint): { gcd: bigint; x: bigint; y: bigint } {
  if (a === 0n) return { gcd: b, x: 0n, y: 1n }
  const { gcd, x, y } = extendedGCD(b % a, a)
  return { gcd, x: y - (b / a) * x, y: x }
}

function modInverse(e: bigint, lambda: bigint): bigint {
  const { gcd, x } = extendedGCD(e, lambda)
  if (gcd !== 1n) throw new CipherError('INVALID_KEY', 'e and lambda(n) are not coprime')
  return ((x % lambda) + lambda) % lambda
}
```

**Fast modular exponentiation (square-and-multiply):**
```typescript
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n
  base = base % mod
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod
    exp = exp / 2n
    base = (base * base) % mod
  }
  return result
}
// Each iteration of modPow is one visualization step
```

**Steps (demo mode):**
```typescript
[
  { label: "Choose primes",          note: "p=61, q=53 (demo - real RSA uses 1024+ bit primes)", isMilestone: true },
  { label: "Compute modulus n",      note: "n = 61 * 53 = 3233" },
  { label: "Compute Carmichael lambda(n)", note: "lambda(3233) = lcm(60, 52) = 780" },
  { label: "Choose public exponent", note: "e=17, verify gcd(17, 780) = 1" },
  { label: "Compute private exponent via Extended Euclidean",
    note: "d = 17^-1 mod 780 = 413", table: euclideanSteps },
  { label: "Key pair ready", isMilestone: true,
    table: [{ key:"Public (n,e)", value:"(3233, 17)" }, { key:"Private (n,d)", value:"(3233, 413)" }] },
  // Encrypt M=65:
  { label: "Square-and-multiply: 65^17 mod 3233", table: modPowSteps },
  { label: "Ciphertext", note: "C = 2790", isMilestone: true },
  // Decrypt:
  { label: "Square-and-multiply: 2790^413 mod 3233", table: modPowSteps },
  { label: "Decrypted", note: "M = 65 - matches original", isMilestone: true },
]
```

**Real RSA via WebCrypto:**
```typescript
const keyPair = await crypto.subtle.generateKey(
  { name: 'RSA-OAEP', modulusLength: 2048,
    publicExponent: new Uint8Array([1,0,1]), hash: 'SHA-256' },
  true, ['encrypt', 'decrypt']
)
const ciphertext = await crypto.subtle.encrypt(
  { name: 'RSA-OAEP' }, keyPair.publicKey, plaintextBuffer
)
```

**Test vectors (demo small primes):**
```
n=3233, e=17, d=2753
M=65  -> C = 65^17 mod 3233 = 2790
C=2790 -> M = 2790^2753 mod 3233 = 65 (verified)
```

---

### 3.2 Diffie-Hellman Key Exchange

**Mathematical foundation**

```
Public parameters (shared openly):
  p = large safe prime (p = 2q+1 where q is also prime)
  g = generator (primitive root modulo p)

Key exchange protocol:
  Alice selects secret a  (2 <= a <= p-2)
  Bob   selects secret b  (2 <= b <= p-2)

  Alice computes and sends: A = g^a mod p
  Bob   computes and sends: B = g^b mod p

  Alice computes shared secret: K = B^a mod p = g^(ab) mod p
  Bob   computes shared secret: K = A^b mod p = g^(ab) mod p

  Both arrive at identical K without ever transmitting a or b.

Security assumption: Computational Diffie-Hellman problem (CDH)
  Given (g, p, g^a mod p, g^b mod p), computing g^(ab) mod p is hard.
  Equivalent to discrete log: given g, p, A - finding a is infeasible for large p.
```

**Visualization parameters:**
```typescript
// Demo (small, NOT secure - for step visualization only)
const DEMO_PARAMS = { p: 23n, g: 5n }
// Example: a=6, b=15, A=8, B=19, K=2

// Real: RFC 7919 FFDHE-2048 group
// Or ECDH P-256 via WebCrypto (preferred for new systems)
```

**Steps:**
```typescript
[
  { label: "Public parameters agreed", note: "p=23 (prime), g=5 (generator - primitive root of 23)", isMilestone: true },
  { label: "Alice chooses secret a=6",  note: "Never transmitted. Known only to Alice." },
  { label: "Alice computes A = 5^6 mod 23", note: "A = 15625 mod 23 = 8. Sent to Bob." },
  { label: "Bob chooses secret b=15",   note: "Never transmitted. Known only to Bob." },
  { label: "Bob computes B = 5^15 mod 23", note: "B = 30517578125 mod 23 = 19. Sent to Alice." },
  { label: "Public exchange",           note: "Alice sends 8. Bob sends 19. Eve sees only 8, 19, 5, 23.", isMilestone: true },
  { label: "Alice computes K = B^a mod p", note: "K = 19^6 mod 23 = 2" },
  { label: "Bob computes K = A^b mod p",   note: "K = 8^15 mod 23 = 2" },
  { label: "Shared secret K=2 established", note: "Eve cannot compute 2 from (8, 19, 5, 23) without solving discrete log.", isMilestone: true },
]
```

**ECDH via WebCrypto (real implementation):**
```typescript
const aliceKey = await crypto.subtle.generateKey(
  { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']
)
const sharedKey = await crypto.subtle.deriveKey(
  { name: 'ECDH', public: bobKey.publicKey },
  aliceKey.privateKey,
  { name: 'AES-GCM', length: 256 },
  false, ['encrypt', 'decrypt']
)
```

Include the color-mixing analogy as a visual metaphor step alongside the math steps.

---

### 3.3 Elliptic Curve Cryptography (ECC)

**Mathematical foundation**

```
Curve equation (short Weierstrass form):
  y^2 = x^3 + ax + b  (over finite field GF(p))

Constraint: 4a^3 + 27b^2 != 0 mod p  (non-singular curve)

Point addition (P + Q = R):
  If P != Q:
    lambda = (Qy - Py) / (Qx - Px) mod p
    Rx = lambda^2 - Px - Qx mod p
    Ry = lambda * (Px - Rx) - Py mod p

  If P = Q (point doubling, 2P):
    lambda = (3*Px^2 + a) / (2*Py) mod p
    Rx = lambda^2 - 2*Px mod p
    Ry = lambda * (Px - Rx) - Py mod p

  If P = -Q: result is point at infinity (identity element)

Scalar multiplication k*P (double-and-add):
  k*P = P + P + P + ... (k times)
  Implemented efficiently with the same structure as modPow:
    result = point_at_infinity
    for each bit of k from MSB to LSB:
      result = double(result)
      if bit is 1: result = add(result, P)

Security: ECDLP - given P and k*P, finding k is computationally infeasible
```

**NIST P-256 curve parameters:**
```
p  = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff
a  = -3 mod p  (= p - 3)
b  = 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b
Gx = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296
Gy = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5
n  = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551
```

**Implementation - use @noble/curves:**
```typescript
import { p256 } from '@noble/curves/p256'
import { secp256k1 } from '@noble/curves/secp256k1'

// ECDSA Sign
const privKey = p256.utils.randomPrivateKey()
const pubKey = p256.getPublicKey(privKey)
const sig = p256.sign(msgHash, privKey)

// ECDSA Verify
const valid = p256.verify(sig, msgHash, pubKey)

// Raw point multiplication (for visualization)
const point = p256.ProjectivePoint.BASE.multiply(BigInt('0x' + privKeyHex))
```

**Steps:**
```typescript
[
  { label: "Curve definition",       note: "y^2 = x^3 - 3x + b over GF(p)", isMilestone: true },
  { label: "Generator point G",      note: `Gx = ${Gx.slice(0,16)}...\nGy = ${Gy.slice(0,16)}...` },
  { label: "Choose private key k",   note: "k = cryptographically random integer in [1, n-1]" },
  { label: "2G = G + G (doubling)",  note: "Tangent to curve at G, reflect over x-axis" },
  { label: "4G = 2G + 2G",          note: "Second doubling" },
  { label: "... double-and-add ...", note: `After ${keyBits} steps: k*G computed` },
  { label: "Public key Q = k*G",     note: `Q = (${Qx.slice(0,12)}..., ${Qy.slice(0,12)}...)`, isMilestone: true },
  // ECDSA signature:
  { label: "Sign: choose nonce k_n", note: "Random k_n in [1, n-1]. Critical: never reuse." },
  { label: "Sign: R = k_n * G",      note: `r = Rx mod n = ${r.slice(0,12)}...` },
  { label: "Sign: compute s",        note: "s = k_n^-1 * (hash + r * privKey) mod n" },
  { label: "Signature (r, s)",       isMilestone: true,
    table: [{ key:"r", value: rHex }, { key:"s", value: sHex }] },
  // Verify:
  { label: "Verify: w = s^-1 mod n" },
  { label: "Verify: u1 = hash*w, u2 = r*w mod n" },
  { label: "Verify: point = u1*G + u2*Q" },
  { label: "Verify: check point.x mod n == r", note: "Signature valid", isMilestone: true },
]
```

**Interactive element:** For small fields (e.g., y^2 = x^3 - x + 1 over GF(17)), render a 2D plot showing all curve points as dots on a grid. Clicking two points shows their sum visually.

---

## Part 4 - Hash Functions

### 4.1 SHA-256

**Mathematical foundation**

```
Input:  any length message
Output: 256 bits (32 bytes)

Initial hash values (H0..H7) - first 32 bits of fractional parts of sqrt of first 8 primes:
  H0=0x6a09e667  H1=0xbb67ae85  H2=0x3c6ef372  H3=0xa54ff53a
  H4=0x510e527f  H5=0x9b05688c  H6=0x1f83d9ab  H7=0x5be0cd19

Round constants K[0..63] - first 32 bits of fractional parts of cbrt of first 64 primes:
  K[0]=0x428a2f98  K[1]=0x71374491  K[2]=0xb5c0fbcf  K[3]=0xe9b5dba5
  K[4]=0x3956c25b  K[5]=0x59f111f1  K[6]=0x923f82a4  K[7]=0xab1c5ed5
  K[8]=0x923f82a4  ... (64 constants total, look up FIPS 180-4 Sec 4.2.2)

Preprocessing:
  1. Append bit '1' (= byte 0x80) to message
  2. Append 0x00 bytes until length in bits = 448 mod 512
  3. Append original length as 64-bit big-endian integer
  Result: multiple of 512 bits (multiple 64-byte blocks)

Per 512-bit block compression:
  1. Message schedule W[0..63]:
     W[i] = block_word[i]                                    for i = 0..15
     W[i] = sigma1(W[i-2]) + W[i-7] + sigma0(W[i-15]) + W[i-16]  for i = 16..63
     (all additions mod 2^32)

     sigma0(x) = ROTR^2(x)  XOR ROTR^18(x) XOR SHR^3(x)
     sigma1(x) = ROTR^17(x) XOR ROTR^19(x) XOR SHR^10(x)
     ROTR^n(x) = (x >>> n) | (x << (32-n))
     SHR^n(x)  = x >>> n

  2. Initialize working vars: a=H0, b=H1, c=H2, d=H3, e=H4, f=H5, g=H6, h=H7

  3. 64 compression rounds:
     T1 = h + SIGMA1(e) + Ch(e,f,g) + K[i] + W[i]
     T2 = SIGMA0(a) + Maj(a,b,c)
     h=g; g=f; f=e; e=d+T1; d=c; c=b; b=a; a=T1+T2

     SIGMA0(x) = ROTR^2(x)  XOR ROTR^13(x) XOR ROTR^22(x)
     SIGMA1(x) = ROTR^6(x)  XOR ROTR^11(x) XOR ROTR^25(x)
     Ch(e,f,g)  = (e AND f) XOR (NOT_e AND g)
     Maj(a,b,c) = (a AND b) XOR (a AND c) XOR (b AND c)

  4. Update: H0+=a, H1+=b, H2+=c, H3+=d, H4+=e, H5+=f, H6+=g, H7+=h
             (all additions mod 2^32)

Output: H0 || H1 || H2 || H3 || H4 || H5 || H6 || H7 (concatenated hex)
```

**Step schema:**
```typescript
[
  { label: "Preprocessing - padding", note: "Append 0x80, zero-pad, append 64-bit length", isMilestone: true,
    table: [{ key:"Original length", value:`${byteLen} bytes` }, { key:"Padded length", value:`${paddedLen} bytes`}] },
  { label: "Message schedule W[0..15]",  note: "First 16 words directly from block", matrix: wRows4x4 },
  { label: "Message schedule W[16..31]", note: "Expanded using sigma functions" },
  { label: "Message schedule W[32..47]" },
  { label: "Message schedule W[48..63]" },
  { label: "Initialize working variables", isMilestone: true,
    table: abcdefghTable },
  // 64 rounds:
  { label: "Round 0", table: [
    {key:"W[0]", value:hex(W[0])}, {key:"K[0]", value:"0x428a2f98"},
    {key:"T1",   value:hex(T1)},   {key:"T2",   value:hex(T2)},
    {key:"new a",value:hex(a)},    {key:"new e",value:hex(e)}
  ]},
  // ... 64 round steps
  { label: "Add to hash state", note: "H0+=a, H1+=b, ... H7+=h (mod 2^32)", isMilestone: true },
  { label: "Final hash output", outputState: finalHex, isMilestone: true },
]
```

**Test vectors (NIST FIPS 180-4):**
```
SHA-256("abc") =
  ba7816bf8f01cfea414140de5dae2ec73b00361bbef0469121e4364702f79d7b

SHA-256("") =
  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

SHA-256("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq") =
  248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1

SHA-256(one million 'a') =
  cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0
```

**Edge case tests:**
```
55-byte input: fits in one block with padding (no second block needed)
56-byte input: requires two blocks (padding crosses block boundary)  <- critical to test
64-byte input: single block, padding exactly fills second block
```

---

### 4.2 MD5

> Security status: **broken** - practical collisions in seconds. Visualized for historical understanding only.

**Mathematical foundation**

```
Output: 128 bits (16 bytes)
Block: 512 bits. Rounds: 4 x 16 = 64 operations.

Initial state: A=0x67452301, B=0xefcdab89, C=0x98badcfe, D=0x10325476

Four auxiliary functions:
  F(B,C,D) = (B AND C) OR (NOT B AND D)   rounds  1-16
  G(B,C,D) = (B AND D) OR (C AND NOT D)   rounds 17-32
  H(B,C,D) = B XOR C XOR D               rounds 33-48
  I(B,C,D) = C XOR (B OR NOT D)           rounds 49-64

Round constants T[i] = floor(2^32 * |sin(i)|) for i=1..64

Message word order per round group:
  Round 1: M[0],M[1],...,M[15]          stride=1
  Round 2: M[1],M[6],M[11],M[0],...    stride=5
  Round 3: M[5],M[8],M[11],M[14],...   stride=3
  Round 4: M[0],M[7],M[14],M[5],...    stride=7

Left rotation amounts s per round group:
  Round 1: [7,12,17,22] repeated 4x
  Round 2: [5,9,14,20] repeated 4x
  Round 3: [4,11,16,23] repeated 4x
  Round 4: [6,10,15,21] repeated 4x

Round operation:
  dTemp = D
  D = C; C = B
  B = B + ROTL^s(A + F_func(B,C,D) + M[g] + T[i])
  A = dTemp
```

Always display a red "BROKEN" badge. Show a known MD5 collision pair as a milestone step.

**Test vectors (RFC 1321):**
```
MD5("")               = d41d8cd98f00b204e9800998ecf8427e
MD5("abc")            = 900150983cd24fb0d6963f7d28e17f72
MD5("message digest") = f96b697d7cb7938d525a2f31aaf161d0
MD5("a" x 1000000)   = 7707d6ae4e027c70eea2a935c2296f21
```

---

### 4.3 SHA-512

Same structure as SHA-256 with:
- 1024-bit (128-byte) block size
- 512-bit output
- 80 rounds (not 64)
- 64-bit words - must use BigInt in TypeScript
- Different initial hash values and round constants
- Different rotation amounts in sigma/SIGMA functions

Implement via a generic `shaFamily(config)` function parameterized by word size, block size, round count, and constants. SHA-256 and SHA-512 are both instances.

---

### 4.4 bcrypt

```
bcrypt output format: $2b$[cost]$[22 chars base64 salt][31 chars base64 hash]

Algorithm overview:
  1. Generate 16-byte random salt (or use provided)
  2. Derive Blowfish P-array and S-boxes via EksBlowfishSetup(cost, salt, password)
     - Run key setup 2^cost times (cost factor controls time)
  3. Encrypt magic string "OrpheanBeholderScryDoubt" 64 times with derived Blowfish
  4. Encode: $2b$ + cost_str + $ + base64url(salt + hash)

UI focus:
  - Interactive cost slider (4-14) with live timing display
  - Same password + different salt = different hash (show side by side)
  - Hash format decoder: parse and label each $-separated section
  - Comparison to MD5/SHA-256: show timing difference
```

**Implementation:** Use `bcryptjs` (pure JS, no native module):
```typescript
import { hash, compare, getRounds, getSalt } from 'bcryptjs'
const hashed = await hash(password, costFactor)
const valid  = await compare(password, hashed)
const rounds = getRounds(hashed)   // read cost from hash string
const salt   = getSalt(hashed)     // extract salt from hash string
```

---

### 4.5 HMAC-SHA256

```
HMAC(K, m) = H((K' XOR opad) || H((K' XOR ipad) || m))

Where:
  K'   = K zero-padded to block size (64 bytes for SHA-256)
  ipad = 0x36 repeated 64 times
  opad = 0x5c repeated 64 times
  H    = SHA-256

Steps:
  1. Pad/truncate key to block size K'
  2. Inner key: K' XOR ipad
  3. Inner hash input: (inner_key || message)
  4. Inner hash: SHA-256(inner_key || message) = inner_result
  5. Outer key: K' XOR opad
  6. Final HMAC: SHA-256(outer_key || inner_result)
```

**Test vectors (RFC 4231):**
```
K = 0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b (20 bytes)
m = "Hi There"
HMAC-SHA256 = b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7

K = "Jefe"
m = "what do ya want for nothing?"
HMAC-SHA256 = 5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964a72820
```

---

## Part 5 - Implementation Plan & Order

### 5.1 Strict build sequence

```
Week 2, Days 1-2:   lib/cipher/types.ts + lib/utils/errors.ts
                    Establishes all interfaces - nothing else can be built without this.

Week 2, Days 2-3:   caesar.ts + rot13.ts + tests/unit/classical/caesar.test.ts
                    Simplest implementation, establishes the step-generation pattern.

Week 2, Days 4-5:   vigenere.ts + atbash.ts + tests

Week 2, Days 6-7:   xor.ts + otp.ts + tests

Week 3, Days 1-2:   playfair.ts + tests
                    Hardest classical cipher. Block on this until tests pass.

Week 3, Day 3:      railfence.ts + tests

Week 3, Days 4-5:   des.ts (pure TS - all S-boxes, key schedule, IP, FP hardcoded)
                    PC-1, PC-2, E, P tables must be exact (copy from FIPS 46-3, verify against test vector)

Week 3, Days 6-7:   3des.ts + des.test.ts (must pass FIPS 81 vector before proceeding)

Week 4, Day 1:      aes/sbox.ts + aes/keyschedule.ts
Week 4, Day 2:      aes/subbytes.ts + aes/shiftrows.ts
Week 4, Day 3:      aes/mixcolumns.ts (GF arithmetic - most subtle part)
Week 4, Day 4:      aes/addroundkey.ts + aes/index.ts (full round loop)
Week 4, Day 5:      aes-cbc.ts + aes-ctr.ts mode wrappers
Week 4, Day 6-7:    aes.test.ts (must pass FIPS 197 Appendix B intermediate vectors)

Week 5, Days 1-2:   sha256.ts (instrumented 64-round implementation)
Week 5, Day 3:      md5.ts
Week 5, Day 4:      sha512.ts (reuse sha family structure)
Week 5, Day 5:      hmac.ts + bcrypt wrapper
Week 5, Days 6-7:   hash tests against NIST CAVP vectors

Week 6, Days 1-2:   rsa.ts (BigInt, modPow, extGCD, demo mode + WebCrypto real mode)
Week 6, Days 3-4:   dh.ts (finite field demo + ECDH WebCrypto)
Week 6, Days 5-7:   ecc.ts (@noble/curves ECDSA, point visualization data)

Week 7:             cipher.worker.ts + useCipherWorker.ts hook
                    Worker must handle ALL ciphers before visualizer UI begins.
```

### 5.2 Per-module test requirements

| Module | Must-have test cases |
|---|---|
| caesar | Shift 0, 13, 25; lowercase; non-alpha passthrough; unicode |
| vigenere | Key longer than input; single-char key; full alphabet key; round-trip |
| playfair | Repeated chars in key; I/J substitution; odd-length input; double-letter bigram |
| railfence | 2 rails; 3 rails; rails = input length; 1 character |
| des | FIPS 81 vector; all 16 weak key variants; wrong parity bits |
| aes | FIPS 197 Appendix B full intermediate states; all three key sizes; all modes |
| sha256 | Empty string; 55-byte; 56-byte (critical); 64-byte; 1MB; NIST CAVP vectors |
| md5 | RFC 1321 all 7 vectors; known collision pair |
| rsa | Small prime round-trip; modPow correctness; WebCrypto 2048-bit round-trip |
| dh | Demo params exchange correctness; ECDH round-trip |
| hmac | RFC 4231 test cases 1-5 |

### 5.3 Property-based fuzz tests (fast-check)

```typescript
// Required for every symmetric cipher:
it('encrypt then decrypt returns original', () =>
  fc.assert(fc.property(
    fc.uint8Array({ minLength: 1, maxLength: 64 }),
    fc.uint8Array({ minLength: 16, maxLength: 16 }),
    (input, key) => {
      const enc = aes.encrypt(toHex(input), toHex(key), { mode:'ECB' })
      const dec = aes.decrypt(enc.output, toHex(key), { mode:'ECB' })
      expect(dec.output).toBe(toHex(input))
    }
  ), { numRuns: 500 })
)

// Required for every classical cipher:
it('never throws unhandled errors on arbitrary ASCII', () =>
  fc.assert(fc.property(
    fc.string({ maxLength: 4096 }),
    fc.string({ minLength: 1, maxLength: 26 }).filter(s => /^[a-zA-Z]+$/.test(s)),
    (input, key) => {
      expect(() => vigenere.encrypt(input, key)).not.toThrow(TypeError)
      // Only CipherError is acceptable
    }
  ), { numRuns: 1000 })
)
```

### 5.4 Step count budgets

| Cipher | Full mode max | Summary mode max |
|---|---|---|
| Caesar | 1 per char + 1 setup | 3 |
| Vigenere | 1 per char + 3 | 5 |
| Playfair | 2 per bigram + 4 | 6 |
| Rail Fence | N_rails + 2 | 4 |
| DES | 70 (key sched + 16 rounds x 4 + IP + FP) | 20 |
| AES-128 | 44 | 14 |
| AES-256 | 60 | 18 |
| SHA-256 | 71 (pad + sched + 64 rounds + final) | 10 |
| MD5 | 70 (pad + 64 rounds + final) | 10 |
| RSA (demo) | 14 | 5 |
| DH (demo) | 10 | 4 |
| ECC | 20 | 6 |

Multi-block inputs: show all steps for block 1, collapse remaining blocks into:
```typescript
{ label: `Block ${n}/${total} - output: ${outputHex.slice(0,16)}...`, isMilestone: false }
```

### 5.5 Performance targets (measured in Web Worker)

| Cipher | Input size | Target | Hard limit |
|---|---|---|---|
| Classical ciphers | 4 KB | < 5ms | 20ms |
| XOR / OTP | 4 KB | < 2ms | 10ms |
| DES | 4 KB | < 50ms | 200ms |
| AES (instrumented) | 4 KB | < 30ms | 100ms |
| SHA-256 (instrumented) | 4 KB | < 15ms | 60ms |
| RSA keygen (WebCrypto) | n/a | < 500ms | 2000ms |
| ECDH (WebCrypto) | n/a | < 50ms | 200ms |

### 5.6 Instrumented vs. fast code paths

```typescript
export function encrypt(
  input: string,
  key: string,
  options: CipherOptions & { instrument?: boolean } = {}
): CipherResult {
  // Instrument mode: capture state after every sub-step (for visualizer)
  if (options.instrument) return encryptInstrumented(input, key, options)
  // Fast mode: no step capture, used for testing, bulk ops, real encryption
  return encryptFast(input, key, options)
}
```

The Worker passes `instrument: true` only when the visualizer panel is open. Default is fast mode.

---

## Part 6 - Visualizer State Machine

```
IDLE -> COMPUTING -> READY -> PLAYING -> PAUSED -> READY
                          ^_______________________________| (loop)
                                   DONE -> IDLE
```

```typescript
type AnimatorState = 'idle' | 'computing' | 'ready' | 'playing' | 'paused' | 'done'

interface AnimatorStore {
  state: AnimatorState
  steps: CipherStep[]
  currentStep: number
  totalSteps: number
  speed: 0.5 | 1 | 2 | 4
  summaryMode: boolean       // show isMilestone steps only

  run:             (input: string, key: string, options: CipherOptions) => Promise<void>
  play:            () => void
  pause:           () => void
  stepForward:     () => void
  stepBack:        () => void
  jumpTo:          (index: number) => void
  reset:           () => void
  setSpeed:        (speed: number) => void
  toggleSummary:   () => void
}
```

Auto-advance uses `requestAnimationFrame` with elapsed-time tracking (not `setInterval`):

```typescript
function startPlayback(store: AnimatorStore) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) { store.jumpTo(store.steps.length - 1); return }

  const msPerStep = 1000 / store.speed
  let lastTime = performance.now()
  let accumulated = 0

  function frame(now: number) {
    if (store.state !== 'playing') return
    accumulated += now - lastTime
    lastTime = now
    if (accumulated >= msPerStep) {
      accumulated -= msPerStep
      if (store.currentStep < store.totalSteps - 1) {
        store.stepForward()
        requestAnimationFrame(frame)
      } else {
        store.state = 'done'
      }
    } else {
      requestAnimationFrame(frame)
    }
  }

  requestAnimationFrame(frame)
}
```
### Shared Validation Utilities

Cipher implementations should reuse the shared validation helpers from
`lib/utils/errors.ts` instead of duplicating validation logic.

Available helpers include:

- `validateInput()` – validates required input and maximum size.
- `validateKey()` – validates required encryption keys.
- `validateHexString()` – validates hexadecimal strings.
- `validateMaxInputBytes()` – validates maximum byte length.

Using these helpers keeps validation behavior consistent across all cipher implementations.

---

## FrodoKEM (Post-Quantum Key Encapsulation)

### Mathematical Foundation

FrodoKEM operates on the unstructured **Learning With Errors (LWE)** problem over standard matrices modulo $q$:
- **Key Generation**:
  $$B = A \cdot S + E \pmod q$$
  Where $A \in \mathbb{Z}_q^{n \times n}$ generated from seed, $S \in \mathbb{Z}_q^{n \times \bar{n}}$ sampled from noise distribution, $E \in \mathbb{Z}_q^{n \times \bar{n}}$ sampled from noise distribution.
- **Encapsulation**:
  $$B' = S' \cdot A + E' \pmod q, \quad V = S' \cdot B + E'' + \text{Encode}(\mu) \pmod q$$
- **Decapsulation**:
  $$M' = V - S^T \cdot B' \pmod q = \text{Encode}(\mu) + \text{residual noise}$$

---

*Last updated: 2026-08-07 — FrodoKEM specification added. All S-boxes and permutation tables must be verified against published FIPS/RFC standards before merging.*
