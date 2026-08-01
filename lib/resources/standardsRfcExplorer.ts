export type StandardType = "RFC" | "FIPS" | "NIST SP" | "NIST IR";
export type StandardStatus =
  "Active" | "Superseded" | "Informational" | "Draft guidance";

export interface CryptoStandard {
  id: string;
  title: string;
  type: StandardType;
  number: string;
  year: number;
  status: StandardStatus;
  topic: string;
  tags: string[];
  summary: string;
  relevance: string;
  url: string;
}

export interface StandardsFilter {
  search: string;
  type: "All" | StandardType;
  topic: "All" | string;
  status: "All" | StandardStatus;
}

export interface StandardsExplorerResult {
  filters: StandardsFilter;
  standards: CryptoStandard[];
  featured: CryptoStandard | null;
  types: string[];
  topics: string[];
  statuses: string[];
  summary: {
    total: number;
    rfc: number;
    fips: number;
    nist: number;
  };
}

export const DEFAULT_STANDARDS_FILTER: StandardsFilter = {
  search: "",
  type: "All",
  topic: "All",
  status: "All",
};

export const CRYPTO_STANDARDS: CryptoStandard[] = [
  {
    id: "rfc-8446",
    title: "The Transport Layer Security Protocol Version 1.3",
    type: "RFC",
    number: "RFC 8446",
    year: 2018,
    status: "Active",
    topic: "Transport Security",
    tags: ["TLS", "key exchange", "AEAD"],
    summary:
      "Defines TLS 1.3, including the handshake, authenticated encryption, key schedule, and protocol security improvements over earlier TLS versions.",
    relevance:
      "Useful when studying modern secure transport, handshake design, key derivation, and authenticated encryption.",
    url: "https://www.rfc-editor.org/rfc/rfc8446",
  },
  {
    id: "rfc-5869",
    title: "HMAC-based Extract-and-Expand Key Derivation Function",
    type: "RFC",
    number: "RFC 5869",
    year: 2010,
    status: "Active",
    topic: "Key Derivation",
    tags: ["HKDF", "HMAC", "KDF"],
    summary:
      "Specifies HKDF, a two-step extract-and-expand construction for deriving strong key material from input keying material.",
    relevance:
      "Pairs well with CryptoViz KDF and TLS key schedule explanations.",
    url: "https://www.rfc-editor.org/rfc/rfc5869",
  },
  {
    id: "rfc-8439",
    title: "ChaCha20 and Poly1305 for IETF Protocols",
    type: "RFC",
    number: "RFC 8439",
    year: 2018,
    status: "Active",
    topic: "Authenticated Encryption",
    tags: ["ChaCha20", "Poly1305", "AEAD"],
    summary:
      "Describes the ChaCha20 stream cipher, Poly1305 authenticator, and their AEAD construction for internet protocols.",
    relevance: "Helpful for stream cipher, MAC, and AEAD visualizers.",
    url: "https://www.rfc-editor.org/rfc/rfc8439",
  },
  {
    id: "fips-197",
    title: "Advanced Encryption Standard",
    type: "FIPS",
    number: "FIPS 197",
    year: 2001,
    status: "Active",
    topic: "Symmetric Encryption",
    tags: ["AES", "block cipher", "key schedule"],
    summary:
      "Defines AES, including block size, key sizes, round transformations, and key expansion.",
    relevance:
      "Core reference for AES visualizers and AES key schedule education.",
    url: "https://csrc.nist.gov/pubs/fips/197/final",
  },
  {
    id: "fips-180-4",
    title: "Secure Hash Standard",
    type: "FIPS",
    number: "FIPS 180-4",
    year: 2015,
    status: "Active",
    topic: "Hashing",
    tags: ["SHA-1", "SHA-2", "SHA-256"],
    summary:
      "Specifies SHA-1 and SHA-2 hash algorithms, including SHA-224, SHA-256, SHA-384, SHA-512, and variants.",
    relevance:
      "Reference for SHA-256 compression, message schedule, and digest visualizations.",
    url: "https://csrc.nist.gov/pubs/fips/180-4/upd1/final",
  },
  {
    id: "fips-202",
    title:
      "SHA-3 Standard: Permutation-Based Hash and Extendable-Output Functions",
    type: "FIPS",
    number: "FIPS 202",
    year: 2015,
    status: "Active",
    topic: "Hashing",
    tags: ["SHA-3", "Keccak", "XOF"],
    summary:
      "Defines SHA-3 hash functions and SHAKE extendable-output functions based on the Keccak permutation.",
    relevance:
      "Useful for comparing Merkle-Damgård style hashes with sponge constructions.",
    url: "https://csrc.nist.gov/pubs/fips/202/final",
  },
  {
    id: "sp-800-38d",
    title: "Recommendation for Block Cipher Modes of Operation: GCM and GMAC",
    type: "NIST SP",
    number: "SP 800-38D",
    year: 2007,
    status: "Active",
    topic: "Authenticated Encryption",
    tags: ["GCM", "GMAC", "AES"],
    summary:
      "Specifies Galois/Counter Mode and GMAC for authenticated encryption and authentication.",
    relevance: "Useful for AES-GCM and AEAD mode explanations.",
    url: "https://csrc.nist.gov/pubs/sp/800/38/d/final",
  },
  {
    id: "sp-800-56a",
    title:
      "Recommendation for Pair-Wise Key-Establishment Schemes Using Discrete Logarithm Cryptography",
    type: "NIST SP",
    number: "SP 800-56A",
    year: 2018,
    status: "Active",
    topic: "Key Exchange",
    tags: ["ECDH", "DH", "key agreement"],
    summary:
      "Provides recommendations for key-establishment schemes based on finite field and elliptic curve discrete logarithm cryptography.",
    relevance: "Reference for Diffie-Hellman, ECDH, and key agreement modules.",
    url: "https://csrc.nist.gov/pubs/sp/800/56/a/r3/final",
  },
  {
    id: "sp-800-90a",
    title:
      "Recommendation for Random Number Generation Using Deterministic Random Bit Generators",
    type: "NIST SP",
    number: "SP 800-90A",
    year: 2015,
    status: "Active",
    topic: "Randomness",
    tags: ["DRBG", "randomness", "entropy"],
    summary:
      "Specifies approved deterministic random bit generators and security requirements for random generation.",
    relevance:
      "Useful for explaining key generation, nonce generation, and randomness quality.",
    url: "https://csrc.nist.gov/pubs/sp/800/90/a/r1/final",
  },
  {
    id: "sp-800-185",
    title: "SHA-3 Derived Functions: cSHAKE, KMAC, TupleHash, and ParallelHash",
    type: "NIST SP",
    number: "SP 800-185",
    year: 2016,
    status: "Active",
    topic: "Hashing",
    tags: ["KMAC", "SHA-3", "XOF"],
    summary:
      "Defines SHA-3 derived functions for customization, message authentication, tuple hashing, and parallel hashing.",
    relevance: "Helpful for advanced hash and MAC learning paths.",
    url: "https://csrc.nist.gov/pubs/sp/800/185/final",
  },
  {
    id: "ir-8413",
    title:
      "Status Report on the Third Round of the NIST Post-Quantum Cryptography Standardization Process",
    type: "NIST IR",
    number: "NIST IR 8413",
    year: 2022,
    status: "Informational",
    topic: "Post-Quantum Cryptography",
    tags: ["PQC", "Kyber", "Dilithium"],
    summary:
      "Summarizes the third round of the NIST post-quantum cryptography standardization process and selected algorithms.",
    relevance:
      "Useful for learners exploring post-quantum algorithm migration and standards history.",
    url: "https://csrc.nist.gov/pubs/ir/8413/final",
  },
];

export function getStandardTypes(): string[] {
  return [
    "All",
    ...Array.from(
      new Set(CRYPTO_STANDARDS.map((standard) => standard.type)),
    ).sort(),
  ];
}

export function getStandardTopics(): string[] {
  return [
    "All",
    ...Array.from(
      new Set(CRYPTO_STANDARDS.map((standard) => standard.topic)),
    ).sort(),
  ];
}

export function getStandardStatuses(): string[] {
  return [
    "All",
    ...Array.from(
      new Set(CRYPTO_STANDARDS.map((standard) => standard.status)),
    ).sort(),
  ];
}

export function standardMatchesSearch(
  standard: CryptoStandard,
  search: string,
): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return [
    standard.title,
    standard.type,
    standard.number,
    standard.topic,
    standard.status,
    standard.summary,
    standard.relevance,
    ...standard.tags,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function filterStandards(filters: StandardsFilter): CryptoStandard[] {
  return CRYPTO_STANDARDS.filter((standard) => {
    const typeMatches =
      filters.type === "All" || standard.type === filters.type;
    const topicMatches =
      filters.topic === "All" || standard.topic === filters.topic;
    const statusMatches =
      filters.status === "All" || standard.status === filters.status;

    return (
      typeMatches &&
      topicMatches &&
      statusMatches &&
      standardMatchesSearch(standard, filters.search)
    );
  }).sort((a, b) => b.year - a.year || a.number.localeCompare(b.number));
}

export function buildStandardsExplorerResult(
  filters: StandardsFilter = DEFAULT_STANDARDS_FILTER,
): StandardsExplorerResult {
  const standards = filterStandards(filters);

  return {
    filters,
    standards,
    featured: standards[0] ?? null,
    types: getStandardTypes(),
    topics: getStandardTopics(),
    statuses: getStandardStatuses(),
    summary: {
      total: CRYPTO_STANDARDS.length,
      rfc: CRYPTO_STANDARDS.filter((standard) => standard.type === "RFC")
        .length,
      fips: CRYPTO_STANDARDS.filter((standard) => standard.type === "FIPS")
        .length,
      nist: CRYPTO_STANDARDS.filter((standard) =>
        standard.type.startsWith("NIST"),
      ).length,
    },
  };
}

export function buildStandardsManualChecklist(): string[] {
  return [
    "Open the Standards & RFC Explorer page.",
    "Confirm the RFC, FIPS, and NIST summary counts render.",
    "Search for TLS and confirm RFC 8446 appears.",
    "Filter by FIPS and confirm only FIPS publications remain.",
    "Filter by Hashing and confirm hash-related publications remain.",
    "Open a source link and confirm it uses a new browser tab.",
    "Reset filters and confirm the full index returns.",
    "Resize to mobile width and confirm cards and filters remain usable.",
  ];
}
