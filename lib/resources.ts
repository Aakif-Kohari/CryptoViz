export type ResourceCategory =
  | "Book"
  | "Research Paper"
  | "RFC"
  | "NIST"
  | "Repository"
  | "Learning Site"
  | "Video"
  | "Website";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface LearningResource {
  id: number;
  title: string;
  description: string;
  category: ResourceCategory;
  difficulty: Difficulty;
  tags: string[];
  author: string;
  url: string;
}

export const resources: LearningResource[] = [
  // --- Books ---
  {
    id: 1,
    title: "Serious Cryptography",
    description:
      "Modern practical cryptography explained with real-world examples, mathematical intuition, and common implementation pitfalls.",
    category: "Book",
    difficulty: "Intermediate",
    tags: ["AES", "RSA", "ECC", "Hashing", "PRNG"],
    author: "Jean-Philippe Aumasson",
    url: "https://nostarch.com/seriouscrypto"
  },
  {
    id: 2,
    title: "Understanding Cryptography",
    description:
      "Excellent beginner-friendly textbook covering stream ciphers, block ciphers, public-key crypto, and key establishment.",
    category: "Book",
    difficulty: "Beginner",
    tags: ["Block Cipher", "DES", "AES", "RSA"],
    author: "Christof Paar & Jan Pelzl",
    url: "https://link.springer.com/book/10.1007/978-3-642-04101-3"
  },
  {
    id: 3,
    title: "Applied Cryptography",
    description:
      "Classic comprehensive reference book covering cryptographic algorithms, protocols, and real-world source code examples.",
    category: "Book",
    difficulty: "Advanced",
    tags: ["Protocols", "Algorithms", "Feistel", "Ciphers"],
    author: "Bruce Schneier",
    url: "https://www.schneier.com/books/applied_cryptography/"
  },
  {
    id: 4,
    title: "Real-World Cryptography",
    description:
      "Practical guide to cryptographic primitives, TLS 1.3, Noise protocol framework, post-quantum crypto, and hardware security.",
    category: "Book",
    difficulty: "Intermediate",
    tags: ["TLS", "HTTPS", "Noise", "PostQuantum"],
    author: "David Wong",
    url: "https://www.manning.com/books/real-world-cryptography"
  },
  {
    id: 5,
    title: "Introduction to Modern Cryptography",
    description:
      "Rigorous academic introduction to formal security definitions, provable security, semantic security, and zero-knowledge proofs.",
    category: "Book",
    difficulty: "Advanced",
    tags: ["Provable Security", "Zero Knowledge", "Formal Proofs"],
    author: "Jonathan Katz & Yehuda Lindell",
    url: "https://www.cs.umd.edu/~jkatz/imc.html"
  },
  {
    id: 6,
    title: "The Code Book",
    description:
      "Engaging historical account of secret codes, cipher machines (Enigma, Lorenz), codebreaking, and quantum cryptography.",
    category: "Book",
    difficulty: "Beginner",
    tags: ["History", "Enigma", "Substitution", "Quantum"],
    author: "Simon Singh",
    url: "https://simonsingh.net/books/the-code-book/"
  },
  {
    id: 7,
    title: "Handbook of Applied Cryptography",
    description:
      "Authoritative mathematical reference covering finite fields, elliptic curves, primality testing, and key management.",
    category: "Book",
    difficulty: "Advanced",
    tags: ["Mathematics", "Elliptic Curves", "Primality", "RSA"],
    author: "Alfred J. Menezes, Paul C. van Oorschot, Scott A. Vanstone",
    url: "https://cacr.uwaterloo.ca/hac/"
  },

  // --- Research Papers ---
  {
    id: 8,
    title: "The RSA Algorithm (1978)",
    description:
      "Original landmark research paper introducing public-key encryption and digital signatures based on prime factorization.",
    category: "Research Paper",
    difficulty: "Advanced",
    tags: ["RSA", "Public Key", "Factoring", "Signatures"],
    author: "Rivest, Shamir, Adleman",
    url: "https://people.csail.mit.edu/rivest/Rsapaper.pdf"
  },
  {
    id: 9,
    title: "New Directions in Cryptography (1976)",
    description:
      "Foundational paper introducing public-key cryptography and the Diffie-Hellman key exchange algorithm.",
    category: "Research Paper",
    difficulty: "Advanced",
    tags: ["Diffie-Hellman", "Key Exchange", "Discrete Log"],
    author: "Whitfield Diffie & Martin E. Hellman",
    url: "https://ee.stanford.edu/~hellman/publications/24.pdf"
  },
  {
    id: 10,
    title: "How to Share a Secret (1979)",
    description:
      "Introduces Shamir's Secret Sharing threshold scheme utilizing polynomial interpolation over finite fields.",
    category: "Research Paper",
    difficulty: "Intermediate",
    tags: ["Shamir", "Secret Sharing", "Polynomials", "Threshold"],
    author: "Adi Shamir",
    url: "https://dl.acm.org/doi/10.1145/359168.359176"
  },
  {
    id: 11,
    title: "Communication Theory of Secrecy Systems (1949)",
    description:
      "Claude Shannon's foundational paper establishing information theory, confusion/diffusion, and perfect secrecy of the One-Time Pad.",
    category: "Research Paper",
    difficulty: "Advanced",
    tags: ["Entropy", "One-Time Pad", "Information Theory"],
    author: "Claude Shannon",
    url: "https://www.bell-labs.com/usr/dmr/www/shannon1949.pdf"
  },
  {
    id: 12,
    title: "The Keccak SHA-3 Submission (2011)",
    description:
      "Official specification of the sponge construction underlying SHA-3 and extendable-output functions (SHAKE128/SHAKE256).",
    category: "Research Paper",
    difficulty: "Advanced",
    tags: ["SHA-3", "Keccak", "Sponge Construction", "XOF"],
    author: "Guido Bertoni, Joan Daemen, Michaël Peeters, Gilles Van Assche",
    url: "https://keccak.team/files/Keccak-reference-3.0.pdf"
  },

  // --- RFCs ---
  {
    id: 13,
    title: "RFC 8017 - PKCS #1 v2.2",
    description:
      "Official IETF specification for RSA Cryptography Standard, RSA-OAEP encryption, and RSA-PSS digital signatures.",
    category: "RFC",
    difficulty: "Advanced",
    tags: ["RSA", "PKCS", "OAEP", "PSS"],
    author: "IETF",
    url: "https://datatracker.ietf.org/doc/html/rfc8017"
  },
  {
    id: 14,
    title: "RFC 8446 - The TLS 1.3 Protocol",
    description:
      "Official IETF standard for Transport Layer Security (TLS) 1.3, providing authenticated encryption and 1-RTT key exchange.",
    category: "RFC",
    difficulty: "Advanced",
    tags: ["TLS", "HTTPS", "AEAD", "Handshake"],
    author: "IETF",
    url: "https://datatracker.ietf.org/doc/html/rfc8446"
  },
  {
    id: 15,
    title: "RFC 7748 - Elliptic Curves for Security",
    description:
      "Specifies Curve25519, Curve448, X25519 key agreement, and X448 for modern high-speed Diffie-Hellman protocols.",
    category: "RFC",
    difficulty: "Intermediate",
    tags: ["Curve25519", "X25519", "X448", "ECC"],
    author: "IETF",
    url: "https://datatracker.ietf.org/doc/html/rfc7748"
  },
  {
    id: 16,
    title: "RFC 8439 - ChaCha20 and Poly1305",
    description:
      "Official specification of ChaCha20 stream cipher and Poly1305 MAC AEAD construction used in TLS 1.3 and WireGuard.",
    category: "RFC",
    difficulty: "Intermediate",
    tags: ["ChaCha20", "Poly1305", "AEAD", "Stream Cipher"],
    author: "IETF",
    url: "https://datatracker.ietf.org/doc/html/rfc8439"
  },
  {
    id: 17,
    title: "RFC 5869 - HKDF Key Derivation Function",
    description:
      "Specifies the HMAC-based Extract-and-Expand Key Derivation Function (HKDF) for deriving cryptographically strong keys.",
    category: "RFC",
    difficulty: "Intermediate",
    tags: ["HKDF", "HMAC", "KDF", "Key Derivation"],
    author: "IETF",
    url: "https://datatracker.ietf.org/doc/html/rfc5869"
  },
  {
    id: 18,
    title: "RFC 7914 - The scrypt Password-Based KDF",
    description:
      "Official specification of the scrypt memory-hard key derivation function designed to resist hardware ASIC brute-force attacks.",
    category: "RFC",
    difficulty: "Advanced",
    tags: ["scrypt", "KDF", "Memory Hard", "Passwords"],
    author: "IETF",
    url: "https://datatracker.ietf.org/doc/html/rfc7914"
  },

  // --- NIST Standards & Publications ---
  {
    id: 19,
    title: "NIST FIPS 197 - Advanced Encryption Standard",
    description:
      "Official NIST publication specifying the AES block cipher algorithm (128, 192, and 256-bit key sizes).",
    category: "NIST",
    difficulty: "Intermediate",
    tags: ["AES", "Rijndael", "Block Cipher", "FIPS"],
    author: "NIST",
    url: "https://csrc.nist.gov/publications/detail/fips/197/final"
  },
  {
    id: 20,
    title: "NIST FIPS 180-4 - Secure Hash Standard",
    description:
      "Official NIST specification for SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA-512/224, and SHA-512/256.",
    category: "NIST",
    difficulty: "Intermediate",
    tags: ["SHA-2", "SHA-256", "SHA-512", "Hash"],
    author: "NIST",
    url: "https://csrc.nist.gov/publications/detail/fips/180/4/final"
  },
  {
    id: 21,
    title: "NIST FIPS 203 - ML-KEM Standard (Kyber)",
    description:
      "Official NIST Post-Quantum Cryptography standard specifying Module-Lattice-Based Key-Encapsulation Mechanism.",
    category: "NIST",
    difficulty: "Advanced",
    tags: ["PostQuantum", "ML-KEM", "Kyber", "Lattice"],
    author: "NIST",
    url: "https://csrc.nist.gov/pubs/fips/203/final"
  },
  {
    id: 22,
    title: "NIST FIPS 204 - ML-DSA Standard (Dilithium)",
    description:
      "Official NIST Post-Quantum Cryptography standard specifying Module-Lattice-Based Digital Signature Algorithm.",
    category: "NIST",
    difficulty: "Advanced",
    tags: ["PostQuantum", "ML-DSA", "Dilithium", "Signatures"],
    author: "NIST",
    url: "https://csrc.nist.gov/pubs/fips/204/final"
  },
  {
    id: 23,
    title: "NIST SP 800-38A - Block Cipher Modes of Operation",
    description:
      "Recommendation for block cipher modes: ECB, CBC, OFB, CFB, and CTR, detailing initialization vectors and padding.",
    category: "NIST",
    difficulty: "Intermediate",
    tags: ["Modes", "ECB", "CBC", "CTR", "IV"],
    author: "NIST",
    url: "https://csrc.nist.gov/publications/detail/sp/800-38a/final"
  },

  // --- Open Source Repositories ---
  {
    id: 24,
    title: "OpenSSL Repository",
    description:
      "The ubiquitous open-source C cryptography toolkit implementing SSL/TLS protocols and core cryptographic primitives.",
    category: "Repository",
    difficulty: "Advanced",
    tags: ["OpenSSL", "C", "TLS", "Security"],
    author: "OpenSSL Project",
    url: "https://github.com/openssl/openssl"
  },
  {
    id: 25,
    title: "paulmillr / noble-curves & noble-hashes",
    description:
      "Audited, zero-dependency, high-performance JS/TS cryptographic libraries for elliptic curves and hashing.",
    category: "Repository",
    difficulty: "Intermediate",
    tags: ["JavaScript", "TypeScript", "ECC", "Hashes"],
    author: "Paul Miller",
    url: "https://github.com/paulmillr/noble-curves"
  },
  {
    id: 26,
    title: "libsodium Repository",
    description:
      "Modern, easy-to-use, high-speed crypto library (NaCl fork) providing high-level APIs for encryption and signing.",
    category: "Repository",
    difficulty: "Beginner",
    tags: ["libsodium", "NaCl", "Ed25519", "ChaCha20"],
    author: "Frank Denis",
    url: "https://github.com/jedisct1/libsodium"
  },
  {
    id: 27,
    title: "pyca / cryptography Repository",
    description:
      "Python's standard cryptographic library offering both low-level primitives and high-level recipes.",
    category: "Repository",
    difficulty: "Intermediate",
    tags: ["Python", "Cryptography", "Recipes", "Fernet"],
    author: "PyCA",
    url: "https://github.com/pyca/cryptography"
  },

  // --- Learning Sites & Interactive Sandboxes ---
  {
    id: 28,
    title: "CryptoHack",
    description:
      "Interactive gamified platform for learning modern cryptography through fun hands-on CTF challenges and code exercises.",
    category: "Learning Site",
    difficulty: "Beginner",
    tags: ["Practice", "CTF", "Gamified", "Python"],
    author: "CryptoHack Team",
    url: "https://cryptohack.org"
  },
  {
    id: 29,
    title: "Cryptopals Crypto Challenges",
    description:
      "Set of 48 hands-on exercises guiding engineers through building and breaking real-world ciphers, ECB leaks, and padding oracles.",
    category: "Learning Site",
    difficulty: "Intermediate",
    tags: ["Challenges", "Attacks", "Padding Oracle", "ECB"],
    author: "NCC Group / Maciej Cegłowski",
    url: "https://cryptopals.com"
  },
  {
    id: 30,
    title: "OWASP Cryptographic Storage Cheat Sheet",
    description:
      "Developer cheat sheet detailing best practices for password hashing, key management, salt generation, and cipher selection.",
    category: "Learning Site",
    difficulty: "Beginner",
    tags: ["OWASP", "Security", "Best Practices", "Storage"],
    author: "OWASP Foundation",
    url: "https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html"
  },
  {
    id: 31,
    title: "A Graduate Course in Applied Cryptography",
    description:
      "Free comprehensive textbook by Dan Boneh & Victor Shoup detailing mathematical foundations and modern protocol design.",
    category: "Learning Site",
    difficulty: "Advanced",
    tags: ["Textbook", "Stanford", "Protocols", "Proof"],
    author: "Dan Boneh & Victor Shoup",
    url: "https://toc.cryptobook.us/"
  },

  // --- Video & Course Resources ---
  {
    id: 32,
    title: "Computerphile Cryptography Playlist",
    description:
      "Accessible video series hosted by Dr. Mike Pound breaking down RSA, AES, Diffie-Hellman, and hashing algorithms.",
    category: "Video",
    difficulty: "Beginner",
    tags: ["Computerphile", "YouTube", "AES", "RSA"],
    author: "Computerphile",
    url: "https://www.youtube.com/@Computerphile"
  },
  {
    id: 33,
    title: "Stanford Cryptography I (Coursera)",
    description:
      "Stanford University's world-famous online cryptography course covering symmetric ciphers, MACs, and public-key encryption.",
    category: "Video",
    difficulty: "Intermediate",
    tags: ["Stanford", "Coursera", "Dan Boneh", "Lecture"],
    author: "Prof. Dan Boneh",
    url: "https://www.coursera.org/learn/crypto"
  },
  {
    id: 34,
    title: "MIT 6.857: Computer & Network Security",
    description:
      "MIT open courseware lectures on cryptographic protocols, zero-knowledge proofs, and real-world system security.",
    category: "Video",
    difficulty: "Advanced",
    tags: ["MIT", "Lectures", "Protocols", "ZKP"],
    author: "MIT OpenCourseWare",
    url: "https://ocw.mit.edu/courses/6-857-network-and-computer-security-spring-2014/"
  }
];

export const categories: ResourceCategory[] = [
  "Book",
  "Research Paper",
  "RFC",
  "NIST",
  "Repository",
  "Learning Site",
  "Video",
  "Website"
];

export const difficulties: Difficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced"
];