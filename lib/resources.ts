export type ResourceCategory =
  | "Book"
  | "Research Paper"
  | "RFC"
  | "NIST"
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
  {
    id: 1,
    title: "Serious Cryptography",
    description:
      "Modern practical cryptography explained with real-world examples.",
    category: "Book",
    difficulty: "Intermediate",
    tags: ["AES", "RSA", "ECC", "Hashing"],
    author: "Jean-Philippe Aumasson",
    url: "https://nostarch.com/seriouscrypto"
  },
  {
    id: 2,
    title: "Understanding Cryptography",
    description:
      "Excellent beginner-friendly introduction to modern cryptography.",
    category: "Book",
    difficulty: "Beginner",
    tags: ["Block Cipher", "DES", "AES"],
    author: "Christof Paar",
    url: "https://link.springer.com/book/10.1007/978-3-642-04101-3"
  },
  {
    id: 3,
    title: "The RSA Algorithm",
    description:
      "Original RSA public-key cryptosystem research paper.",
    category: "Research Paper",
    difficulty: "Advanced",
    tags: ["RSA", "Public Key"],
    author: "Rivest, Shamir, Adleman",
    url: "https://people.csail.mit.edu/rivest/Rsapaper.pdf"
  },
  {
    id: 4,
    title: "RFC 8017 - PKCS #1",
    description:
      "Official RSA Cryptography Standard.",
    category: "RFC",
    difficulty: "Advanced",
    tags: ["RSA", "PKCS"],
    author: "IETF",
    url: "https://datatracker.ietf.org/doc/html/rfc8017"
  },
  {
    id: 5,
    title: "NIST FIPS 197",
    description:
      "Official AES Encryption Standard.",
    category: "NIST",
    difficulty: "Intermediate",
    tags: ["AES"],
    author: "NIST",
    url: "https://csrc.nist.gov/publications/detail/fips/197/final"
  },
  {
    id: 6,
    title: "Computerphile Cryptography Playlist",
    description:
      "Easy-to-understand videos explaining cryptography concepts.",
    category: "Video",
    difficulty: "Beginner",
    tags: ["AES", "RSA", "Hashing"],
    author: "Computerphile",
    url: "https://www.youtube.com/@Computerphile"
  },
  {
    id: 7,
    title: "Cryptography I",
    description:
      "Stanford University's famous cryptography course.",
    category: "Video",
    difficulty: "Intermediate",
    tags: ["Cryptography", "Protocols"],
    author: "Dan Boneh",
    url: "https://www.coursera.org/learn/crypto"
  },
  {
    id: 8,
    title: "CryptoHack",
    description:
      "Interactive platform for learning practical cryptography.",
    category: "Website",
    difficulty: "Beginner",
    tags: ["Practice", "CTF"],
    author: "CryptoHack",
    url: "https://cryptohack.org"
  },
  {
    id: 9,
    title: "RFC 8446 - TLS 1.3",
    description:
      "Official TLS 1.3 specification.",
    category: "RFC",
    difficulty: "Advanced",
    tags: ["TLS", "HTTPS"],
    author: "IETF",
    url: "https://datatracker.ietf.org/doc/html/rfc8446"
  },
  {
    id: 10,
    title: "NIST Cryptographic Standards",
    description:
      "Collection of official NIST cryptographic publications.",
    category: "NIST",
    difficulty: "Intermediate",
    tags: ["Standards", "Security"],
    author: "NIST",
    url: "https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines"
  },
  {
    id: 11,
    title: "Applied Cryptography",
    description:
      "Classic reference book covering cryptographic algorithms and protocols.",
    category: "Book",
    difficulty: "Advanced",
    tags: ["Protocols", "Algorithms"],
    author: "Bruce Schneier",
    url: "https://www.schneier.com/books/applied_cryptography/"
  },
  {
    id: 12,
    title: "OWASP Cryptographic Storage Cheat Sheet",
    description:
      "Best practices for secure cryptographic storage.",
    category: "Website",
    difficulty: "Intermediate",
    tags: ["OWASP", "Security"],
    author: "OWASP",
    url: "https://cheatsheetseries.owasp.org/"
  }
];

export const categories = [
  "All",
  "Book",
  "Research Paper",
  "RFC",
  "NIST",
  "Video",
  "Website"
];

export const difficulties = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced"
];