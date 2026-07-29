import { MythItem, QuizQuestion } from './types';

export const CRYPTO_MYTHS: MythItem[] = [
  {
    id: 'base64-is-encryption',
    mythTitle: 'Base64 is a Form of Encryption',
    statement: 'Base64 encoding encrypts sensitive data and keeps it safe from unauthorized readers.',
    status: 'BUSTED',
    category: 'Encoding vs Encryption',
    realitySummary: 'Base64 is a binary-to-text encoding format with zero key secrecy. Anyone can decode it instantly without a key.',
    detailedExplanation: 'Base64 translates raw binary bytes into 64 ASCII printable characters (A-Z, a-z, 0-9, +, /). It does not use any secret key or initialization vector. Passing sensitive text through Base64 provides zero confidentiality. Cryptographic encryption requires a secret key and a mathematical algorithm (such as AES or RSA) where ciphertext cannot be reversed without the key.',
    keyTakeaway: 'Never rely on Base64, URL-encoding, or Hex for secrecy. Encoding changes data representation; encryption protects secrecy with keys.',
    relatedCipherId: 'caesar',
    relatedDocSlug: 'getting-started',
    tags: ['Encoding', 'Base64', 'Security Fallacy']
  },
  {
    id: 'key-size-comparison',
    mythTitle: 'A 2048-bit RSA Key is 8x Stronger than a 256-bit AES Key',
    statement: 'Because 2048 is larger than 256, an RSA-2048 key provides 8 times more cryptographic security than AES-256.',
    status: 'BUSTED',
    category: 'Key Management & Sizes',
    realitySummary: 'Key size bits cannot be compared 1:1 across asymmetric and symmetric ciphers. AES-256 is exponentially stronger.',
    detailedExplanation: 'Symmetric ciphers like AES rely on brute-force key search over 2^256 combinations. Asymmetric ciphers like RSA rely on integer factorization (General Number Field Sieve), which breaks RSA sub-exponentially. An RSA-2048 key offers roughly 112 bits of security strength, whereas AES-256 offers a full 256 bits of security strength.',
    keyTakeaway: 'Symmetric and asymmetric key bit-lengths represent vastly different mathematical complexity spaces.',
    relatedCipherId: 'rsa',
    relatedDocSlug: 'rsa-cryptosystem',
    tags: ['RSA', 'AES', 'Key Strength', 'Security Estimator']
  },
  {
    id: 'hashing-equals-encryption',
    mythTitle: 'Cryptographic Hashing and Encryption are the Same Thing',
    statement: 'Hashing a password encrypts it so it can be decrypted later when the user logs in.',
    status: 'BUSTED',
    category: 'Hashing vs Encryption',
    realitySummary: 'Hashing is a one-way irreversible mathematical digest; encryption is a two-way reversible transformation with a key.',
    detailedExplanation: 'Encryption transforms plaintext into ciphertext using a secret key, designed specifically to be decrypted back to plaintext. A cryptographic hash function (like SHA-256) takes an arbitrary input and produces a fixed-size digest in a one-way process. You cannot "decrypt" a hash digest back into original plaintext.',
    keyTakeaway: 'Use hashing (with salt and KDFs like PBKDF2/Argon2) for password verification; use encryption for data storage and transmission.',
    relatedCipherId: 'sha256',
    relatedDocSlug: 'sha256-compression',
    tags: ['One-Way', 'Hashing', 'Encryption', 'SHA-256']
  },
  {
    id: 'proprietary-custom-crypto',
    mythTitle: 'Proprietary Secret Algorithms Are Safer Than Open Standards',
    statement: 'Keeping our encryption algorithm secret makes our application harder to hack than using public standards like AES.',
    status: 'BUSTED',
    category: 'Security Principles',
    realitySummary: 'Kerckhoffs\'s Principle proves that security must depend on key secrecy, not algorithm secrecy. Custom ciphers fail.',
    detailedExplanation: 'History demonstrates that custom, unreviewed proprietary ciphers almost always suffer from devastating algebraic vulnerabilities. Open standards like AES, ChaCha20, and SHA-3 undergo decades of intense global cryptanalysis by mathematical experts before deployment.',
    keyTakeaway: 'Don\'t roll your own crypto. Use battle-tested, open-standard cryptographic libraries.',
    relatedCipherId: 'aes',
    relatedDocSlug: 'aes-encryption',
    tags: ['Kerckhoffs', 'Obscurity', 'Custom Crypto']
  },
  {
    id: 'salt-is-a-secret-key',
    mythTitle: 'Password Salt Must Be Kept Secret Like a Private Key',
    statement: 'If an attacker discovers the salt value used to hash a password, the password hash is completely compromised.',
    status: 'BUSTED',
    category: 'Password Security',
    realitySummary: 'Salts are non-secret inputs designed to prevent pre-computed rainbow table and multi-user bulk cracking attacks.',
    detailedExplanation: 'A salt is a unique, random string generated per user and stored in plain text alongside the password hash. Its purpose is to ensure two users with the same password produce different hashes, rendering pre-computed rainbow tables useless. Secret values added to hashes are known as "peppers" or HMAC keys.',
    keyTakeaway: 'Salts defeat bulk rainbow table attacks. Keep salts unique per user; secret keys belong in HSMs or environment vaults.',
    relatedCipherId: 'pbkdf2',
    relatedDocSlug: 'key-derivation',
    tags: ['Salt', 'Rainbow Tables', 'Password Security']
  },
  {
    id: 'quantum-destroys-aes',
    mythTitle: 'Quantum Computers Will Instantly Break All AES Encryption',
    statement: 'Once quantum computers arrive, symmetric encryption like AES-256 will become completely useless.',
    status: 'PARTIALLY_TRUE',
    category: 'Quantum & Future Tech',
    realitySummary: 'Quantum computers (Grover\'s algorithm) halve symmetric key security, reducing AES-256 to 128 bits—which remains completely unbroken.',
    detailedExplanation: 'Shor\'s quantum algorithm effectively breaks public-key cryptography (RSA, ECC, Diffie-Hellman) in polynomial time. However, Grover\'s algorithm only provides a quadratic speedup against symmetric ciphers. Doubling key size (from AES-128 to AES-256) provides 128 bits of post-quantum security strength, which is mathematically uncrackable for centuries.',
    keyTakeaway: 'Public-key systems (RSA/ECC) must transition to Post-Quantum Cryptography (ML-KEM/Kyber); AES-256 remains secure.',
    relatedCipherId: 'kyber',
    relatedDocSlug: 'pqc-standards',
    tags: ['Quantum', 'Grover Algorithm', 'AES-256', 'PQC']
  },
  {
    id: 'steganography-replaces-encryption',
    mythTitle: 'Hiding Messages in Images (Steganography) Eliminates Encryption Need',
    statement: 'Hiding a secret text file inside a PNG image is safer than encrypting the file.',
    status: 'BUSTED',
    category: 'Encoding vs Encryption',
    realitySummary: 'Steganography hides message existence; cryptography protects message content. Once discovered, unencrypted hidden data is exposed.',
    detailedExplanation: 'Steganography relies on obscuring the presence of a communication (e.g. least-significant-bit image encoding). Statistical analysis (steganalysis) can easily detect anomalies in carrier files. If the message inside the image is not encrypted, any analyst who extracts the payload gains immediate access to the raw secret.',
    keyTakeaway: 'Combine steganography WITH strong encryption for defense-in-depth, never use steganography as a substitute for ciphers.',
    relatedCipherId: 'caesar',
    relatedDocSlug: 'getting-started',
    tags: ['Steganography', 'Obscurity', 'Defense-in-Depth']
  },
  {
    id: 'iv-reuse-in-gcm',
    mythTitle: 'Re-using an Initialization Vector (IV) in AES-GCM is Minor',
    statement: 'Re-using the same IV or Nonce across multiple AES-GCM encryptions only reduces randomness slightly.',
    status: 'BUSTED',
    category: 'Key Management & Sizes',
    realitySummary: 'Nonce reuse in AES-GCM completely destroys confidentiality and enables catastrophic authentication key recovery.',
    detailedExplanation: 'AES-GCM (Galois/Counter Mode) uses a counter keystream. Encrypting two different messages with the same key and Nonce creates a "two-time pad" exposure where XORing ciphertexts reveals plaintext XORs. Furthermore, IV reuse in GCM allows an attacker to solve quadratic equations over GF(2^128) and recover the GHASH authentication key.',
    keyTakeaway: 'Never reuse a Nonce or IV under the same symmetric key in CTR or GCM operating modes.',
    relatedCipherId: 'modes',
    relatedDocSlug: 'block-cipher-modes',
    tags: ['AES-GCM', 'Nonce Reuse', 'Catastrophic Failure']
  }
];

export const MYTH_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'A developer encodes sensitive user SSNs using Base64 before saving to a database. Is this data securely encrypted?',
    mythContext: 'Base64 is a binary-to-text encoding scheme.',
    options: [
      { id: 'a', text: 'Yes, Base64 scrambles text so it is safe.', isCorrect: false, explanation: 'Incorrect. Base64 is an encoding format, not encryption. Anyone can decode it instantly without a key.' },
      { id: 'b', text: 'No, Base64 uses no secret key and can be decoded instantly by anyone.', isCorrect: true, explanation: 'Correct! Base64 is representation encoding. Encryption requires a key and mathematical cipher like AES.' },
      { id: 'c', text: 'Only if the Base64 string is padded with = signs.', isCorrect: false, explanation: 'Incorrect. Padding characters (=) are standard syntax markers, not security features.' }
    ]
  },
  {
    id: 'q2',
    question: 'Which key size offers greater mathematical security strength against brute-force attacks?',
    mythContext: 'Symmetric vs Asymmetric security bit equivalence.',
    options: [
      { id: 'a', text: 'RSA-2048 key size.', isCorrect: false, explanation: 'Incorrect. RSA-2048 offers ~112 bits of security strength due to sub-exponential factoring algorithms.' },
      { id: 'b', text: 'AES-256 key size.', isCorrect: true, explanation: 'Correct! AES-256 offers a full 256 bits of security strength, which is exponentially stronger than RSA-2048.' },
      { id: 'c', text: 'They offer identical security strength.', isCorrect: false, explanation: 'Incorrect. Key lengths across symmetric and asymmetric algorithms cannot be compared 1:1.' }
    ]
  },
  {
    id: 'q3',
    question: 'Why should a unique salt be generated for every user password hash?',
    mythContext: 'Salt vs secret key roles in key derivation.',
    options: [
      { id: 'a', text: 'To act as a secret decryption key.', isCorrect: false, explanation: 'Incorrect. Salts are non-secret and stored alongside hashes.' },
      { id: 'b', text: 'To prevent bulk rainbow table attacks and ensure identical passwords yield different hashes.', isCorrect: true, explanation: 'Correct! Salts guarantee unique hashes for identical passwords, defeating pre-computed tables.' },
      { id: 'c', text: 'To encrypt the user\'s email address.', isCorrect: false, explanation: 'Incorrect. Salts are used in password hashing, not email encryption.' }
    ]
  },
  {
    id: 'q4',
    question: 'What is Kerckhoffs\'s Principle in modern cryptography?',
    mythContext: 'Fundamental principle of algorithm security.',
    options: [
      { id: 'a', text: 'A cipher is secure only if its algorithm is kept completely secret.', isCorrect: false, explanation: 'Incorrect. That is "security through obscurity", which consistently fails.' },
      { id: 'b', text: 'A system must remain secure even if everything about it except the key is public knowledge.', isCorrect: true, explanation: 'Correct! Kerckhoffs\'s principle states security must depend solely on key secrecy.' },
      { id: 'c', text: 'All algorithms must use 1024-bit keys minimum.', isCorrect: false, explanation: 'Incorrect. Key size depends on the cryptographic primitive type.' }
    ]
  },
  {
    id: 'q5',
    question: 'What happens if a developer reuses the same Nonce/IV with the same key in AES-GCM mode?',
    mythContext: 'Nonce reuse vulnerabilities in authenticated encryption.',
    options: [
      { id: 'a', text: 'Encryption runs slightly slower.', isCorrect: false, explanation: 'Incorrect. Performance is unaffected, but security is destroyed.' },
      { id: 'b', text: 'Catastrophic failure: plaintexts can be derived and authentication keys recovered.', isCorrect: true, explanation: 'Correct! Nonce reuse in AES-GCM exposes keystreams and breaks GHASH authentication.' },
      { id: 'c', text: 'The algorithm automatically selects a new key.', isCorrect: false, explanation: 'Incorrect. Ciphers do not auto-generate new keys on Nonce reuse.' }
    ]
  }
];

export function getMythById(id: string): MythItem | undefined {
  return CRYPTO_MYTHS.find(m => m.id === id);
}

export function searchMyths(query: string, category: string = 'All'): MythItem[] {
  const q = query.toLowerCase().trim();
  return CRYPTO_MYTHS.filter(m => {
    const matchesCat = category === 'All' || m.category === category;
    const matchesQuery =
      q === '' ||
      m.mythTitle.toLowerCase().includes(q) ||
      m.statement.toLowerCase().includes(q) ||
      m.realitySummary.toLowerCase().includes(q) ||
      m.detailedExplanation.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q));

    return matchesCat && matchesQuery;
  });
}
