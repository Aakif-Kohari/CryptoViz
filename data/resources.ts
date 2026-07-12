import { Resource } from "@/types/resource";

export const resources: Resource[] = [
  // ==========================
  // BOOKS
  // ==========================
  {
    id: "book-1",
    title: "Cryptography Engineering",
    description:
      "A practical guide to designing secure cryptographic systems by Ferguson, Schneier, and Kohno.",
    category: "Book",
    difficulty: "Intermediate",
    tags: ["AES", "RSA", "TLS", "Security"],
    link: "https://www.schneier.com/books/cryptography_engineering/",
  },
  {
    id: "book-2",
    title: "Serious Cryptography",
    description:
      "Modern introduction to applied cryptography covering algorithms, protocols, and best practices.",
    category: "Book",
    difficulty: "Beginner",
    tags: ["Hashing", "AES", "ECC"],
    link: "https://nostarch.com/seriouscrypto",
  },
  {
    id: "book-3",
    title: "Understanding Cryptography",
    description:
      "Excellent beginner-friendly textbook explaining modern cryptographic concepts.",
    category: "Book",
    difficulty: "Beginner",
    tags: ["DES", "AES", "RSA"],
    link: "https://link.springer.com/book/10.1007/978-3-642-04101-3",
  },
  {
    id: "book-4",
    title: "Applied Cryptography",
    description:
      "Bruce Schneier's classic reference covering cryptographic protocols and algorithms.",
    category: "Book",
    difficulty: "Advanced",
    tags: ["Protocols", "Security", "RSA"],
    link: "https://www.schneier.com/books/applied_cryptography/",
  },

  // ==========================
  // RESEARCH PAPERS
  // ==========================
  {
    id: "paper-1",
    title: "New Directions in Cryptography",
    description:
      "The landmark Diffie-Hellman paper introducing public-key cryptography.",
    category: "Research Paper",
    difficulty: "Advanced",
    tags: ["Diffie-Hellman", "Public Key"],
    link: "https://ee.stanford.edu/~hellman/publications/24.pdf",
  },
  {
    id: "paper-2",
    title: "A Method for Obtaining Digital Signatures",
    description:
      "Original RSA paper introducing the RSA cryptosystem.",
    category: "Research Paper",
    difficulty: "Advanced",
    tags: ["RSA", "Digital Signatures"],
    link: "https://people.csail.mit.edu/rivest/Rsapaper.pdf",
  },
  {
    id: "paper-3",
    title: "Keccak Specifications",
    description:
      "Research describing the SHA-3 cryptographic hash function.",
    category: "Research Paper",
    difficulty: "Advanced",
    tags: ["SHA-3", "Hashing"],
    link: "https://keccak.team/files/Keccak-specifications.pdf",
  },

  // ==========================
  // RFCs
  // ==========================
  {
    id: "rfc-1",
    title: "RFC 8446 - TLS 1.3",
    description:
      "Specification for the TLS 1.3 secure communication protocol.",
    category: "RFC",
    difficulty: "Intermediate",
    tags: ["TLS", "Networking"],
    link: "https://www.rfc-editor.org/rfc/rfc8446",
  },
  {
    id: "rfc-2",
    title: "RFC 8017 - PKCS #1",
    description:
      "Specification for the RSA Cryptography Standard.",
    category: "RFC",
    difficulty: "Advanced",
    tags: ["RSA", "PKCS"],
    link: "https://www.rfc-editor.org/rfc/rfc8017",
  },
  {
    id: "rfc-3",
    title: "RFC 2104 - HMAC",
    description:
      "Definition and implementation details for HMAC.",
    category: "RFC",
    difficulty: "Intermediate",
    tags: ["HMAC", "Hashing"],
    link: "https://www.rfc-editor.org/rfc/rfc2104",
  },

  // ==========================
  // NIST
  // ==========================
  {
    id: "nist-1",
    title: "FIPS 197 - AES",
    description:
      "Official Advanced Encryption Standard specification.",
    category: "NIST",
    difficulty: "Intermediate",
    tags: ["AES", "Standard"],
    link: "https://csrc.nist.gov/pubs/fips/197/final",
  },
  {
    id: "nist-2",
    title: "SP 800-38A",
    description:
      "Recommendation for Block Cipher Modes of Operation.",
    category: "NIST",
    difficulty: "Intermediate",
    tags: ["AES", "Modes"],
    link: "https://csrc.nist.gov/pubs/sp/800/38/a/final",
  },
  {
    id: "nist-3",
    title: "SP 800-57",
    description:
      "Key management recommendations from NIST.",
    category: "NIST",
    difficulty: "Advanced",
    tags: ["Key Management", "Security"],
    link: "https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final",
  },

  // ==========================
  // VIDEOS
  // ==========================
  {
    id: "video-1",
    title: "Computerphile - AES Explained",
    description:
      "A simple explanation of AES encryption from Computerphile.",
    category: "Video",
    difficulty: "Beginner",
    tags: ["AES", "YouTube"],
    link: "https://www.youtube.com/results?search_query=computerphile+aes",
  },
  {
    id: "video-2",
    title: "MIT OpenCourseWare - Cryptography",
    description:
      "University lectures covering modern cryptography.",
    category: "Video",
    difficulty: "Intermediate",
    tags: ["MIT", "Course"],
    link: "https://ocw.mit.edu/",
  },
  {
    id: "video-3",
    title: "Stanford Cryptography Course",
    description:
      "Academic lectures on cryptography fundamentals.",
    category: "Video",
    difficulty: "Advanced",
    tags: ["Stanford", "Course"],
    link: "https://crypto.stanford.edu/",
  },
  {
    id: "video-4",
    title: "Khan Academy - Cryptography",
    description:
      "Introductory videos covering encryption and security concepts.",
    category: "Video",
    difficulty: "Beginner",
    tags: ["Education", "Basics"],
    link: "https://www.khanacademy.org/computing/computer-science/cryptography",
  },

  // ==========================
  // EXTERNAL
  // ==========================
  {
    id: "external-1",
    title: "CryptoHack",
    description:
      "Interactive cryptography challenges for learning by doing.",
    category: "External",
    difficulty: "Beginner",
    tags: ["Practice", "Challenges"],
    link: "https://cryptohack.org/",
  },
  {
    id: "external-2",
    title: "Cryptopals",
    description:
      "Hands-on cryptography programming exercises.",
    category: "External",
    difficulty: "Intermediate",
    tags: ["Exercises", "Programming"],
    link: "https://cryptopals.com/",
  },
  {
    id: "external-3",
    title: "OWASP Cryptographic Storage Cheat Sheet",
    description:
      "Best practices for securely storing sensitive data.",
    category: "External",
    difficulty: "Intermediate",
    tags: ["OWASP", "Security"],
    link: "https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html",
  },
];