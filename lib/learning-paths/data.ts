import { LearningPath, Lesson } from './types'

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'cryptography-fundamentals',
    title: 'Cryptography Fundamentals',
    shortDescription: 'Master the essential building blocks of encryption, encoding, and core security goals.',
    fullDescription: 'Explore the foundations of modern information security: confidentiality, integrity, authentication, and non-repudiation. Learn how plaintexts transform into ciphertexts and understand key principles like Kerckhoffs’s principle.',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    icon: 'Shield',
    color: 'from-cyan-500 to-blue-600',
    estimatedTime: '45 mins',
    badge: {
      name: 'Crypto Initiate',
      description: 'Mastered core cryptographic principles and security objectives.',
      icon: 'Award',
    },
    lessons: [
      {
        id: 'intro-security-goals',
        title: 'Introduction & Core Security Goals (CIA Triad)',
        duration: '10 mins',
        description: 'Understand Confidentiality, Integrity, Availability, and Authentication in modern security.',
        keyTakeaways: [
          'Confidentiality prevents unauthorized disclosure of sensitive information.',
          'Integrity guarantees that data has not been altered or tampered with.',
          'Authentication confirms the identity of communication parties.',
        ],
        content: `
### Fundamentals of Information Security

Cryptography is the mathematical science of securing communication against adversaries. Every cryptographic system strives to satisfy one or more key security objectives:

1. **Confidentiality**: Ensuring data remains readable only to authorized parties.
2. **Integrity**: Detecting unauthorized alterations to transmitted or stored data.
3. **Authentication**: Verifying the origin and true identity of entities or messages.
4. **Non-repudiation**: Preventing a sender from denying their prior action or signature.

#### Plaintext vs. Ciphertext
* **Plaintext ($M$)**: The original readable message or data.
* **Ciphertext ($C$)**: The obfuscated output resulting from applying an encryption algorithm $E$ with key $K$: $C = E(K, M)$.
* **Decryption ($D$)**: Reverting ciphertext back to plaintext using key $K$: $M = D(K, C)$.
        `,
        visualizers: [
          {
            title: 'Caesar Cipher Sandbox',
            href: '/visualizer/caesar/',
            description: 'Experiment with basic substitution and plaintext-to-ciphertext transformations.',
          },
          {
            title: 'Encoding Explorer',
            href: '/encoding',
            description: 'Compare binary, Hex, Base64, and ASCII representations.',
          },
        ],
        quiz: [
          {
            id: 'q1',
            question: 'Which cryptographic goal guarantees that data has not been modified in transit?',
            options: ['Confidentiality', 'Integrity', 'Availability', 'Non-repudiation'],
            correctAnswer: 1,
            explanation: 'Integrity ensures that any tampering or modification to data during transmission can be detected.',
          },
          {
            id: 'q2',
            question: 'According to Kerckhoffs’s principle, what part of a cryptosystem must remain secret?',
            options: ['The encryption algorithm', 'The plaintext length', 'The secret key', 'The hardware specifications'],
            correctAnswer: 2,
            explanation: 'Kerckhoffs’s principle states that a cryptosystem should remain secure even if everything about the system, except the key, is public knowledge.',
          },
        ],
      },
      {
        id: 'encoding-vs-encryption',
        title: 'Encoding vs. Encryption vs. Hashing',
        duration: '15 mins',
        description: 'Differentiate data representation (Encoding), secrecy (Encryption), and one-way verification (Hashing).',
        keyTakeaways: [
          'Encoding transforms data format for usability without secret keys.',
          'Encryption protects secrecy using secret keys.',
          'Hashing generates a deterministic, fixed-size representation that cannot be reversed.',
        ],
        content: `
### Clearing Common Confusions

Beginners often confuse **Encoding**, **Encryption**, and **Hashing**. Here is the distinction:

| Concept | Secret Key Needed? | Reversible? | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Encoding** (e.g., Base64) | No | Yes | Data compatibility & transfer |
| **Encryption** (e.g., AES) | Yes | Yes (with key) | Confidentiality |
| **Hashing** (e.g., SHA-256) | No | No (One-way) | Integrity verification |

Never use Base64 encoding as a security mechanism! Base64 carries zero confidentiality.
        `,
        visualizers: [
          {
            title: 'Encoding Errors Playground',
            href: '/encoding-errors',
            description: 'Learn how invalid encodings break applications and parse routines.',
          },
        ],
        quiz: [
          {
            id: 'q1',
            question: 'Is Base64 encoding an effective way to encrypt user passwords?',
            options: [
              'Yes, because it obscures human-readable text.',
              'No, because encoding is fully reversible without any secret key.',
              'Yes, if combined with ASCII conversion.',
              'No, because Base64 uses asymmetric keys.',
            ],
            correctAnswer: 1,
            explanation: 'Base64 is purely a format converter with zero secrecy or key protection.',
          },
        ],
      },
    ],
  },
  {
    id: 'classical-ciphers',
    title: 'Classical Ciphers',
    shortDescription: 'Explore historical substitution and transposition techniques and learn how frequency analysis broke them.',
    fullDescription: 'Journey through historical cryptography from the ancient Caesar cipher and Monoalphabetic substitution to Polyalphabetic ciphers like Vigenère and Transposition techniques. Discover frequency analysis techniques that rendered them obsolete.',
    category: 'Historical Cryptography',
    difficulty: 'Beginner',
    icon: 'BookOpen',
    color: 'from-amber-500 to-orange-600',
    estimatedTime: '60 mins',
    badge: {
      name: 'Master Cryptanalyst',
      description: 'Deciphered historical encryption methods and frequency analysis.',
      icon: 'Feather',
    },
    lessons: [
      {
        id: 'substitution-ciphers',
        title: 'Substitution Ciphers (Caesar & Monoalphabetic)',
        duration: '20 mins',
        description: 'Learn character shifts, substitution tables, and frequency distribution attacks.',
        keyTakeaways: [
          'Caesar cipher shifts letters by a fixed integer key value (modulo 26).',
          'Monoalphabetic substitution maps each alphabet letter to a fixed alternative letter.',
          'Frequency analysis easily breaks monoalphabetic ciphers because letter frequencies in language are preserved.',
        ],
        content: `
### Caesar & Monoalphabetic Substitution

The **Caesar Cipher** shifts every letter in the plaintext by $k$ positions modulo 26:
$$E(x) = (x + k) \\pmod{26}$$

#### Frequency Analysis Attack
In English, the letter **E** appears with a frequency of ~12.7%, followed by **T** (~9.1%) and **A** (~8.2%). Because substitution ciphers maintain a 1-to-1 mapping, letter frequency distributions remain unchanged, allowing cryptanalysts to break simple substitution ciphers effortlessly.
        `,
        visualizers: [
          {
            title: 'Caesar Cipher Visualizer',
            href: '/visualizer/caesar/',
            description: 'Interactive Caesar shift visualizer with letter frequency chart.',
          },
          {
            title: 'Brute Force Attack Visualizer',
            href: '/attacks',
            description: 'Simulate brute-forcing all 25 possible Caesar keys in real-time.',
          },
        ],
        quiz: [
          {
            id: 'q1',
            question: 'How many total non-trivial keys exist for a Caesar cipher on the 26-letter English alphabet?',
            options: ['25', '26', '256', '2^128'],
            correctAnswer: 0,
            explanation: 'Shift of 0 leaves text unchanged, so there are 25 effective shift keys.',
          },
          {
            id: 'q2',
            question: 'Why does frequency analysis easily break Monoalphabetic Substitution ciphers?',
            options: [
              'Because the key is transmitted in plaintext.',
              'Because letter frequency statistics of the language are preserved in ciphertext.',
              'Because Monoalphabetic ciphers use small 64-bit keys.',
              'Because letters are permuted instead of substituted.',
            ],
            correctAnswer: 1,
            explanation: 'The underlying statistical distribution of letters in a language remains identical under monoalphabetic substitution.',
          },
        ],
      },
      {
        id: 'polyalphabetic-vigenere',
        title: 'Polyalphabetic Ciphers & Vigenère',
        duration: '25 mins',
        description: 'Discover how repeating keyword shifts flattened single-letter frequency spikes.',
        keyTakeaways: [
          'Vigenère uses a repeating keyword to shift plaintext characters dynamically.',
          'Polyalphabetic mapping hides single-letter frequencies.',
          'Kasiski examination and Index of Coincidence break Vigenère when key length is revealed.',
        ],
        content: `
### The Vigenère Cipher

Once known as *le chiffre indéchiffrable* (the indecipherable cipher), Vigenère uses a repeated secret word as the key. Each letter of the key determines the Caesar shift for the corresponding letter of plaintext.

$$C_i = (P_i + K_{i \\bmod L}) \\pmod{26}$$

#### Breaking Vigenère
By identifying repeated n-grams in the ciphertext, cryptanalysts estimate the key length $L$. Once $L$ is known, the ciphertext is split into $L$ monoalphabetic Caesar streams, which are solved via standard frequency analysis!
        `,
        visualizers: [
          {
            title: 'Vigenère Cipher Visualizer',
            href: '/visualizer/vigenere/',
            description: 'Interactive grid table showing Vigenère encryption step-by-step.',
          },
        ],
        quiz: [
          {
            id: 'q1',
            question: 'What technique is used to deduce the key length of a Vigenère cipher?',
            options: ['Kasiski examination', 'Avalanche test', 'Birthday attack', 'Euclidean algorithm'],
            correctAnswer: 0,
            explanation: 'Kasiski examination looks for repeated patterns in ciphertext to find common factors of key length.',
          },
        ],
      },
    ],
  },
  {
    id: 'modern-symmetric-encryption',
    title: 'Modern Symmetric Encryption',
    shortDescription: 'Master Block Ciphers, AES, Stream Ciphers, and Cipher Modes of Operation.',
    fullDescription: 'Delve into industrial-grade symmetric encryption. Understand Substitution-Permutation Networks (SPN), Feistel structures, AES S-Box transformations, and modes of operation like CBC, CTR, and GCM.',
    category: 'Symmetric Cryptography',
    difficulty: 'Intermediate',
    icon: 'Lock',
    color: 'from-emerald-500 to-teal-600',
    estimatedTime: '75 mins',
    badge: {
      name: 'Symmetric Specialist',
      description: 'Understood AES block transformations and authenticated encryption modes.',
      icon: 'KeyRound',
    },
    lessons: [
      {
        id: 'block-ciphers-aes',
        title: 'Block Ciphers & Advanced Encryption Standard (AES)',
        duration: '30 mins',
        description: 'Explore SubBytes, ShiftRows, MixColumns, AddRoundKey, and S-Box non-linearity.',
        keyTakeaways: [
          'AES operates on 128-bit blocks using key sizes of 128, 192, or 256 bits.',
          'Each round consists of SubBytes, ShiftRows, MixColumns, and AddRoundKey.',
          'Confusion is provided by SubBytes (S-Box) and Diffusion by ShiftRows and MixColumns.',
        ],
        content: `
### AES & Substitution-Permutation Networks

The Advanced Encryption Standard (AES) is a symmetric block cipher operating on a 4x4 matrix of bytes called the **State**.

#### AES Round Transformations:
1. **SubBytes**: Non-linear byte substitution using S-Box tables (Confusion).
2. **ShiftRows**: Cyclically shifts the bytes in each row of the State (Diffusion).
3. **MixColumns**: Linear transformation mixing the bytes of each column.
4. **AddRoundKey**: XORs the State with the subkey derived from key expansion.
        `,
        visualizers: [
          {
            title: 'AES S-Box Explorer',
            href: '/sbox',
            description: 'Inspect non-linear substitution tables and algebraic properties.',
          },
          {
            title: 'Cipher Lifecycle Visualizer',
            href: '/cipher-lifecycle',
            description: 'Step through key expansion and AES round state changes.',
          },
        ],
        quiz: [
          {
            id: 'q1',
            question: 'Which AES transformation provides the mathematical property of Confusion?',
            options: ['ShiftRows', 'SubBytes', 'MixColumns', 'AddRoundKey'],
            correctAnswer: 1,
            explanation: 'SubBytes uses a non-linear S-Box lookup table to obscure the relationship between key and ciphertext (Confusion).',
          },
        ],
      },
      {
        id: 'cipher-modes-of-operation',
        title: 'Cipher Modes of Operation (ECB, CBC, CTR, GCM)',
        duration: '30 mins',
        description: 'Learn why ECB leaks patterns and why Authenticated Encryption (GCM) is essential.',
        keyTakeaways: [
          'ECB mode encrypts identical plaintext blocks to identical ciphertext blocks (insecure).',
          'CBC chains blocks using XOR and Initialization Vectors (IV).',
          'GCM provides AEAD (Authenticated Encryption with Associated Data).',
        ],
        content: `
### Why Modes Matter

Block ciphers encrypt fixed-size blocks (e.g. 128 bits). To encrypt variable-length data securely, we use **Modes of Operation**.

#### Electronic Codebook (ECB) - Insecure!
Encrypts each block independently. Identical plaintext blocks yield identical ciphertext blocks, revealing visual patterns (such as the famous ECB Tux penguin leakage).

#### Galois/Counter Mode (GCM) - Industrial Gold Standard
Combines CTR mode streaming with GHASH authentication tags to provide **Authenticated Encryption with Associated Data (AEAD)**.
        `,
        visualizers: [
          {
            title: 'Modes of Operation Visualizer',
            href: '/modes',
            description: 'Visualize ECB pattern leakage vs CBC and CTR mode behavior.',
          },
        ],
        quiz: [
          {
            id: 'q1',
            question: 'What is the primary danger of using ECB mode for image or structured data encryption?',
            options: [
              'It requires 512-bit keys.',
              'Identical plaintext blocks produce identical ciphertext blocks, leaking structural patterns.',
              'It does not support parallel encryption.',
              'It relies on RSA key pairs.',
            ],
            correctAnswer: 1,
            explanation: 'ECB is deterministic per block, preserving structural patterns across identical data blocks.',
          },
        ],
      },
    ],
  },
  {
    id: 'public-key-cryptography',
    title: 'Public-Key Cryptography',
    shortDescription: 'Understand Asymmetric Key Pairs, RSA, Diffie-Hellman, and Elliptic Curves.',
    fullDescription: 'Discover how asymmetric cryptography solves key distribution. Learn prime number factorisation in RSA, discrete logarithms in Diffie-Hellman, and scalar multiplication over Elliptic Curves (ECC).',
    category: 'Asymmetric Cryptography',
    difficulty: 'Intermediate',
    icon: 'Key',
    color: 'from-indigo-500 to-purple-600',
    estimatedTime: '80 mins',
    badge: {
      name: 'Asymmetric Architect',
      description: 'Mastered public key pairs, RSA trapdoor functions, and Elliptic Curves.',
      icon: 'ShieldCheck',
    },
    lessons: [
      {
        id: 'rsa-encryption',
        title: 'RSA Encryption & Mathematical Trapdoors',
        duration: '35 mins',
        description: 'Understand modular exponentiation, prime factorization, and public/private key pairs.',
        keyTakeaways: [
          'RSA relies on the hardness of factoring the product of two large prime numbers.',
          'Public key $(e, n)$ encrypts: $C = M^e \\pmod n$.',
          'Private key $(d, n)$ decrypts: $M = C^d \\pmod n$.',
        ],
        content: `
### Mathematics of RSA

RSA uses asymmetric key pairs derived from two large secret primes $p$ and $q$:
1. Compute modulus $n = p \\times q$.
2. Compute Euler totient $\\phi(n) = (p-1)(q-1)$.
3. Select public exponent $e$ coprime to $\\phi(n)$.
4. Compute private exponent $d \\equiv e^{-1} \\pmod{\\phi(n)}$.

#### Encryption & Decryption
* **Encrypt**: $C = M^e \\pmod n$
* **Decrypt**: $M = C^d \\pmod n$
        `,
        visualizers: [
          {
            title: 'RSA Key Pair Visualizer',
            href: '/visualizer/rsa/',
            description: 'Generate prime factors $p$ and $q$, compute totients, and encrypt step-by-step.',
          },
        ],
        quiz: [
          {
            id: 'q1',
            question: 'What mathematical problem underpins the security of RSA encryption?',
            options: ['Discrete Logarithm Problem', 'Integer Factorization Problem', 'Lattice Shortest Vector Problem', 'Knapsack Problem'],
            correctAnswer: 1,
            explanation: 'Factoring a large modulus $n$ into its constituent prime factors $p$ and $q$ is computationally infeasible for sufficiently large keys.',
          },
        ],
      },
      {
        id: 'ecc-and-diffie-hellman',
        title: 'Diffie-Hellman & Elliptic Curve Cryptography (ECC)',
        duration: '45 mins',
        description: 'Explore secure key exchange and high-performance Elliptic Curve point multiplication.',
        keyTakeaways: [
          'Diffie-Hellman allows two parties to establish a shared secret over an insecure channel.',
          'Elliptic Curve Cryptography (ECC) offers equivalent security to RSA with significantly smaller key sizes.',
          '256-bit ECC key offers comparable security to a 3072-bit RSA key.',
        ],
        content: `
### Elliptic Curve Cryptography (ECC)

ECC defined over finite fields utilizes points on curves satisfying equations of the form:
$$y^2 = x^3 + ax + b \\pmod p$$

#### Point Addition & Scalar Multiplication
Given a generator point $G$, multiplying by a scalar private key $k$ yields public key point $Q = k \\cdot G$. Computing $k$ from $Q$ and $G$ is the **Elliptic Curve Discrete Logarithm Problem (ECDLP)**.
        `,
        visualizers: [
          {
            title: 'Key Size Estimator',
            href: '/key-size',
            description: 'Compare security levels between RSA, ECC, and symmetric AES keys.',
          },
        ],
        quiz: [
          {
            id: 'q1',
            question: 'Approximately what ECC key size delivers security equivalent to a 3072-bit RSA key?',
            options: ['128 bits', '256 bits', '1024 bits', '3072 bits'],
            correctAnswer: 1,
            explanation: 'A 256-bit ECC key provides ~128 bits of security strength, matching a 3072-bit RSA key.',
          },
        ],
      },
    ],
  },
  {
    id: 'hash-functions',
    title: 'Hash Functions',
    shortDescription: 'Master One-Way Hash Algorithms, Collision Resistance, and SHA-2/SHA-3.',
    fullDescription: 'Study cryptographic hash functions and their core security invariants: Pre-image resistance, Second pre-image resistance, and Collision resistance. Explore Merkle-Damgård constructions and SHA-3 sponge functions.',
    category: 'Integrity & Hashing',
    difficulty: 'Intermediate',
    icon: 'Hash',
    color: 'from-violet-500 to-fuchsia-600',
    estimatedTime: '55 mins',
    badge: {
      name: 'Hash Specialist',
      description: 'Mastered collision resistance, pre-image security, and digest algorithms.',
      icon: 'CheckCircle2',
    },
    lessons: [
      {
        id: 'hash-properties-sha2',
        title: 'Cryptographic Hash Properties & SHA-256',
        duration: '25 mins',
        description: 'Explore the Avalanche effect, Pre-image resistance, and SHA-256 round operations.',
        keyTakeaways: [
          'Cryptographic hash functions map arbitrary inputs to fixed-size outputs.',
          'Pre-image resistance: Given $H(M)$, it is infeasible to find $M$.',
          'Collision resistance: It is infeasible to find any $M_1 \\neq M_2$ such that $H(M_1) = H(M_2)$.',
          'Avalanche effect: Changing 1 input bit alters approximately 50% of output bits.',
        ],
        content: `
### Core Properties of Hash Functions

A cryptographic hash function $H$ must fulfill three strict properties:

1. **Pre-image Resistance (One-Way)**: Given $h$, finding $x$ such that $H(x) = h$ is hard.
2. **Second Pre-image Resistance**: Given $x_1$, finding $x_2 \\neq x_1$ such that $H(x_1) = H(x_2)$ is hard.
3. **Collision Resistance**: Finding *any* pair $x_1 \\neq x_2$ where $H(x_1) = H(x_2)$ is hard.
        `,
        visualizers: [
          {
            title: 'SHA-256 Compression Visualizer',
            href: '/visualizer/sha256/',
            description: 'Step through SHA-256 schedule expansion and compression rounds.',
          },
          {
            title: 'Avalanche Effect Visualizer',
            href: '/avalanche',
            description: 'Flip single bits in input text and measure bit flip percentages in the digest.',
          },
        ],
        quiz: [
          {
            id: 'q1',
            question: 'What property is violated if an attacker finds two different messages that produce the exact same hash output?',
            options: ['Pre-image resistance', 'Collision resistance', 'Confidentiality', 'Key expansion'],
            correctAnswer: 1,
            explanation: 'Collision resistance requires that finding any two distinct inputs yielding identical hash outputs is computationally infeasible.',
          },
        ],
      },
    ],
  },
  {
    id: 'digital-signatures',
    title: 'Digital Signatures',
    shortDescription: 'Explore ECDSA, Ed25519, non-repudiation, and Public Key Infrastructure (PKI).',
    fullDescription: 'Learn how Digital Signatures combine asymmetric keys and hash functions to provide authentication, integrity, and non-repudiation. Understand ECDSA, Ed25519, and certificate chains.',
    category: 'Authentication',
    difficulty: 'Advanced',
    icon: 'FileCheck',
    color: 'from-pink-500 to-rose-600',
    estimatedTime: '60 mins',
    badge: {
      name: 'Signature Guardian',
      description: 'Mastered digital signature verification, non-repudiation, and PKI certificates.',
      icon: 'Award',
    },
    lessons: [
      {
        id: 'digital-signatures-ecdsa',
        title: 'Digital Signature Principles & ECDSA',
        duration: '30 mins',
        description: 'Understand signing digests, verification algorithms, and why nonce reuse destroys private keys.',
        keyTakeaways: [
          'Digital Signatures sign the hash of a message rather than the full raw message.',
          'A signature is verified using the sender’s public key.',
          'Reusing a random nonce ($k$) in ECDSA leaks the private key completely!',
        ],
        content: `
### Signing and Verification Process

1. **Sign**:
   * Compute message hash: $h = H(M)$
   * Produce signature: $\\sigma = \\text{Sign}(K_{\\text{private}}, h)$
2. **Verify**:
   * Compute message hash: $h = H(M)$
   * Verify: $\\text{Verify}(K_{\\text{public}}, h, \\sigma) \\in \\{\\text{true}, \\text{false}\\}$

#### Catastrophic Nonce Reuse
In ECDSA, reusing the random integer $k$ across two different signatures allows an observer to compute the private key instantly!
        `,
        visualizers: [
          {
            title: 'OpenPGP Explorer',
            href: '/openpgp',
            description: 'Inspect OpenPGP signed keys, packets, and signature verification.',
          },
        ],
        quiz: [
          {
            id: 'q1',
            question: 'What fatal flaw occurs if an ECDSA signer reuses the same random nonce $k$ for two distinct messages?',
            options: [
              'The signature grows in size.',
              'The signer’s private key can be algebraically extracted by anyone.',
              'The hash function reverts to MD5.',
              'Nothing happens.',
            ],
            correctAnswer: 1,
            explanation: 'Reusing $k$ creates a system of two linear equations with two unknowns, exposing the private key.',
          },
        ],
      },
    ],
  },
]

export function getLearningPaths(): LearningPath[] {
  return LEARNING_PATHS
}

export function getLearningPathById(id: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.id === id)
}

export function getLessonById(
  pathId: string,
  lessonId: string,
): { path: LearningPath; lesson: Lesson; lessonIndex: number } | undefined {
  const path = getLearningPathById(pathId)
  if (!path) return undefined

  const lessonIndex = path.lessons.findIndex((l) => l.id === lessonId)
  if (lessonIndex === -1) return undefined

  return {
    path,
    lesson: path.lessons[lessonIndex],
    lessonIndex,
  }
}
