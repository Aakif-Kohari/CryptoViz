export type PqcFamily = "KEM" | "Signature";
export type PqcDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface PqcAlgorithm {
  id: string;
  name: string;
  family: PqcFamily;
  difficulty: PqcDifficulty;
  status: string;
  securityBasis: string;
  primaryUse: string;
  shortSummary: string;
  keyIdeas: string[];
  strengths: string[];
  tradeoffs: string[];
  visualizerConnections: string[];
  tags: string[];
}

export interface PqcHubFilter {
  search: string;
  family: "All" | PqcFamily;
  difficulty: "All" | PqcDifficulty;
  tag: "All" | string;
}

export interface PqcHubResult {
  filters: PqcHubFilter;
  algorithms: PqcAlgorithm[];
  featured: PqcAlgorithm | null;
  families: string[];
  difficulties: string[];
  tags: string[];
  summary: {
    total: number;
    kem: number;
    signatures: number;
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export const DEFAULT_PQC_HUB_FILTER: PqcHubFilter = {
  search: "",
  family: "All",
  difficulty: "All",
  tag: "All",
};

export const PQC_ALGORITHMS: PqcAlgorithm[] = [
  {
    id: "kyber",
    name: "Kyber / ML-KEM",
    family: "KEM",
    difficulty: "Intermediate",
    status: "NIST-selected key encapsulation mechanism",
    securityBasis: "Module Learning With Errors",
    primaryUse: "Establishing shared secrets for hybrid key exchange and post-quantum transport security.",
    shortSummary:
      "Kyber, standardized by NIST as ML-KEM, is a lattice-based key encapsulation mechanism designed to replace or combine with classical key exchange.",
    keyIdeas: [
      "A public key encapsulates a shared secret.",
      "The private key decapsulates the ciphertext and recovers the same shared secret.",
      "Security relies on lattice problems related to Module-LWE.",
    ],
    strengths: ["Efficient key exchange design", "Good practical performance", "Strong fit for hybrid TLS-style migration"],
    tradeoffs: ["Larger keys and ciphertexts than classical elliptic-curve key exchange", "Requires constant-time implementation care", "Usually deployed in hybrid mode during transition"],
    visualizerConnections: ["Key Exchange", "KDFs", "Standards & RFC Explorer"],
    tags: ["lattice", "key exchange", "KEM", "ML-KEM"],
  },
  {
    id: "dilithium",
    name: "Dilithium / ML-DSA",
    family: "Signature",
    difficulty: "Intermediate",
    status: "NIST-selected digital signature scheme",
    securityBasis: "Module Learning With Errors and Module Short Integer Solution",
    primaryUse: "Signing software updates, certificates, protocol messages, and long-lived records.",
    shortSummary:
      "Dilithium, standardized by NIST as ML-DSA, is a lattice-based signature scheme designed for robust and efficient post-quantum signatures.",
    keyIdeas: ["A private key signs a message.", "A public key verifies the signature.", "The design avoids fragile Gaussian sampling used by some older lattice signatures."],
    strengths: ["Practical performance", "Relatively straightforward implementation strategy", "Strong candidate for general-purpose post-quantum signatures"],
    tradeoffs: ["Signatures and public keys are larger than many classical signatures", "Implementations require side-channel care", "Migration requires certificate and protocol ecosystem updates"],
    visualizerConnections: ["Digital Signatures", "Hash Functions", "Roadmap"],
    tags: ["lattice", "signature", "ML-DSA", "certificates"],
  },
  {
    id: "falcon",
    name: "Falcon",
    family: "Signature",
    difficulty: "Advanced",
    status: "NIST-selected digital signature scheme",
    securityBasis: "NTRU lattices",
    primaryUse: "Post-quantum signatures where compact signatures are valuable.",
    shortSummary: "Falcon is a lattice-based signature scheme known for compact signatures, but its implementation is more complex than Dilithium.",
    keyIdeas: ["Uses NTRU lattice structure.", "Produces compact signatures compared with many PQC signature options.", "Requires careful floating-point or fixed-point implementation techniques."],
    strengths: ["Compact signatures", "Useful for bandwidth-sensitive signatures", "NIST-selected signature option"],
    tradeoffs: ["Implementation complexity is higher", "Side-channel-safe implementation is challenging", "Harder for beginners than Dilithium"],
    visualizerConnections: ["Digital Signatures", "Implementation Safety", "Side-Channel Playground"],
    tags: ["lattice", "signature", "NTRU", "compact"],
  },
  {
    id: "sphincs-plus",
    name: "SPHINCS+ / SLH-DSA",
    family: "Signature",
    difficulty: "Advanced",
    status: "NIST-selected stateless hash-based signature scheme",
    securityBasis: "Hash functions",
    primaryUse: "Conservative post-quantum signatures based mostly on hash-function security.",
    shortSummary: "SPHINCS+, standardized by NIST as SLH-DSA, is a stateless hash-based signature scheme with conservative assumptions and larger signatures.",
    keyIdeas: ["Uses hash-based one-time and few-time signature ideas.", "Stateless design avoids state-management failures.", "Security depends mainly on hash-function properties."],
    strengths: ["Conservative security assumptions", "Stateless hash-based design", "Useful diversity option beyond lattice-based signatures"],
    tradeoffs: ["Large signatures", "Slower signing or verification depending on parameter set", "Less compact than Falcon or Dilithium"],
    visualizerConnections: ["Hash Functions", "Merkle Proofs", "SHA-256 Compression"],
    tags: ["hash-based", "signature", "SLH-DSA", "stateless"],
  },
];

export function getPqcFamilies(): string[] {
  return ["All", ...Array.from(new Set(PQC_ALGORITHMS.map((algorithm) => algorithm.family))).sort()];
}

export function getPqcDifficulties(): string[] {
  return ["All", "Beginner", "Intermediate", "Advanced"];
}

export function getPqcTags(): string[] {
  return ["All", ...Array.from(new Set(PQC_ALGORITHMS.flatMap((algorithm) => algorithm.tags))).sort()];
}

export function pqcAlgorithmMatchesSearch(algorithm: PqcAlgorithm, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return [algorithm.name, algorithm.family, algorithm.difficulty, algorithm.status, algorithm.securityBasis, algorithm.primaryUse, algorithm.shortSummary, ...algorithm.keyIdeas, ...algorithm.strengths, ...algorithm.tradeoffs, ...algorithm.visualizerConnections, ...algorithm.tags].join(" ").toLowerCase().includes(query);
}

export function filterPqcAlgorithms(filters: PqcHubFilter): PqcAlgorithm[] {
  return PQC_ALGORITHMS.filter((algorithm) => {
    const familyMatches = filters.family === "All" || algorithm.family === filters.family;
    const difficultyMatches = filters.difficulty === "All" || algorithm.difficulty === filters.difficulty;
    const tagMatches = filters.tag === "All" || algorithm.tags.includes(filters.tag);
    return familyMatches && difficultyMatches && tagMatches && pqcAlgorithmMatchesSearch(algorithm, filters.search);
  });
}

export function buildPqcHubResult(filters: PqcHubFilter = DEFAULT_PQC_HUB_FILTER): PqcHubResult {
  const algorithms = filterPqcAlgorithms(filters);
  return {
    filters,
    algorithms,
    featured: algorithms[0] ?? null,
    families: getPqcFamilies(),
    difficulties: getPqcDifficulties(),
    tags: getPqcTags(),
    summary: {
      total: PQC_ALGORITHMS.length,
      kem: PQC_ALGORITHMS.filter((algorithm) => algorithm.family === "KEM").length,
      signatures: PQC_ALGORITHMS.filter((algorithm) => algorithm.family === "Signature").length,
      beginner: PQC_ALGORITHMS.filter((algorithm) => algorithm.difficulty === "Beginner").length,
      intermediate: PQC_ALGORITHMS.filter((algorithm) => algorithm.difficulty === "Intermediate").length,
      advanced: PQC_ALGORITHMS.filter((algorithm) => algorithm.difficulty === "Advanced").length,
    },
  };
}

export function buildPqcComparisonRows() {
  return PQC_ALGORITHMS.map((algorithm) => ({
    algorithm: algorithm.name,
    family: algorithm.family,
    basis: algorithm.securityBasis,
    bestFor: algorithm.primaryUse,
    tradeoff: algorithm.tradeoffs[0],
  }));
}

export function buildPqcManualChecklist(): string[] {
  return [
    "Open the Post-Quantum Cryptography Learning Hub page.",
    "Confirm Kyber, Dilithium, Falcon, and SPHINCS+ cards render.",
    "Search for lattice and confirm Kyber, Dilithium, and Falcon appear.",
    "Filter by KEM and confirm only Kyber remains.",
    "Filter by Signature and confirm signature algorithms remain.",
    "Filter by hash-based and confirm SPHINCS+ remains.",
    "Confirm the comparison table displays all four algorithms.",
    "Resize to mobile width and confirm cards, filters, and tables remain usable.",
  ];
}
