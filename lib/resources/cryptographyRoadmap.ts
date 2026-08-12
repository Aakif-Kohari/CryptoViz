export type RoadmapLevel = "Beginner" | "Intermediate" | "Advanced";
export type RoadmapStatus = "not-started" | "in-progress" | "completed";

export interface RoadmapNode {
  id: string;
  title: string;
  level: RoadmapLevel;
  category: string;
  estimatedMinutes: number;
  description: string;
  outcomes: string[];
  prerequisites: string[];
  resources: string[];
}

export interface RoadmapProgress {
  [nodeId: string]: RoadmapStatus;
}

export interface RoadmapFilter {
  level: "All" | RoadmapLevel;
  category: "All" | string;
  search: string;
}

export interface RoadmapNodeView extends RoadmapNode {
  status: RoadmapStatus;
  locked: boolean;
  dependencyLabels: string[];
}

export const DEFAULT_ROADMAP_FILTER: RoadmapFilter = {
  level: "All",
  category: "All",
  search: "",
};

export const DEFAULT_ROADMAP_PROGRESS: RoadmapProgress = {
  "crypto-foundations": "completed",
  "encoding-vs-encryption": "completed",
  "hash-functions": "in-progress",
};

export const CRYPTOGRAPHY_ROADMAP_NODES: RoadmapNode[] = [
  {
    id: "crypto-foundations",
    title: "Cryptography Foundations",
    level: "Beginner",
    category: "Foundations",
    estimatedMinutes: 25,
    description: "Understand confidentiality, integrity, authentication, keys, and threat models.",
    outcomes: ["Explain why cryptography is used", "Identify core security goals", "Recognize common misuse risks"],
    prerequisites: [],
    resources: ["Glossary", "Standards Explorer", "Video Library"],
  },
  {
    id: "encoding-vs-encryption",
    title: "Encoding, Hashing, and Encryption",
    level: "Beginner",
    category: "Foundations",
    estimatedMinutes: 20,
    description: "Compare reversible encoding, one-way hashing, symmetric encryption, and asymmetric encryption.",
    outcomes: ["Avoid confusing encoding with encryption", "Choose a suitable primitive", "Separate reversible and one-way operations"],
    prerequisites: ["crypto-foundations"],
    resources: ["Hash Collision Playground", "CRC32 Visualization"],
  },
  {
    id: "hash-functions",
    title: "Hash Functions",
    level: "Beginner",
    category: "Hashing",
    estimatedMinutes: 30,
    description: "Learn digest properties, collision resistance, preimage resistance, and avalanche behavior.",
    outcomes: ["Describe hash properties", "Explain collisions", "Connect SHA-256 rounds to digest output"],
    prerequisites: ["encoding-vs-encryption"],
    resources: ["SHA-256 Compression", "Hash Collision Playground"],
  },
  {
    id: "merkle-proofs",
    title: "Merkle Trees and Proofs",
    level: "Intermediate",
    category: "Hashing",
    estimatedMinutes: 35,
    description: "Learn how tree hashing proves membership without revealing every item in a dataset.",
    outcomes: ["Build a Merkle root", "Verify a proof path", "Explain odd-node duplication"],
    prerequisites: ["hash-functions"],
    resources: ["Merkle Proof Demonstration"],
  },
  {
    id: "symmetric-encryption",
    title: "Symmetric Encryption",
    level: "Beginner",
    category: "Symmetric Crypto",
    estimatedMinutes: 35,
    description: "Understand shared-key encryption, block ciphers, stream ciphers, and safe mode selection.",
    outcomes: ["Explain shared-key encryption", "Compare block and stream ciphers", "Understand why modes matter"],
    prerequisites: ["encoding-vs-encryption"],
    resources: ["AES Visualizer", "DES Key Schedule", "ECB Pattern Leakage"],
  },
  {
    id: "aes-internals",
    title: "AES Internals and Key Expansion",
    level: "Intermediate",
    category: "Symmetric Crypto",
    estimatedMinutes: 45,
    description: "Explore AES round transformations, key schedule, and authenticated-mode guidance.",
    outcomes: ["Trace AES key expansion", "Identify round transformations", "Explain why raw block encryption is not enough"],
    prerequisites: ["symmetric-encryption"],
    resources: ["AES Key Expansion Visualizer", "FIPS 197"],
  },
  {
    id: "public-key-crypto",
    title: "Public-Key Cryptography",
    level: "Intermediate",
    category: "Asymmetric Crypto",
    estimatedMinutes: 40,
    description: "Learn how public/private key pairs support encryption, signatures, and key agreement.",
    outcomes: ["Explain public and private keys", "Separate encryption from signing", "Identify key exchange use cases"],
    prerequisites: ["crypto-foundations"],
    resources: ["RSA Key Generation Wizard", "Diffie-Hellman"],
  },
  {
    id: "elliptic-curves",
    title: "Elliptic-Curve Cryptography",
    level: "Advanced",
    category: "Asymmetric Crypto",
    estimatedMinutes: 55,
    description: "Understand curve-based key exchange and signatures conceptually.",
    outcomes: ["Explain scalar multiplication", "Connect ECC to ECDH and signatures", "Recognize compact key strengths"],
    prerequisites: ["public-key-crypto"],
    resources: ["ECDSA", "X25519", "Video Library"],
  },
  {
    id: "password-kdfs",
    title: "Password Hashing and KDFs",
    level: "Intermediate",
    category: "Key Derivation",
    estimatedMinutes: 35,
    description: "Learn salts, work factors, memory hardness, and password attack resistance.",
    outcomes: ["Explain salts and work factors", "Compare fast hashes with password KDFs", "Understand dictionary attack resistance"],
    prerequisites: ["hash-functions"],
    resources: ["Argon2id Visualizer", "Dictionary Attack Simulator"],
  },
  {
    id: "cryptanalysis-basics",
    title: "Cryptanalysis Basics",
    level: "Advanced",
    category: "Cryptanalysis",
    estimatedMinutes: 50,
    description: "Explore linear bias, timing leakage, side channels, and implementation attack surfaces.",
    outcomes: ["Explain statistical cryptanalysis", "Recognize timing side channels", "Apply secure implementation guidance"],
    prerequisites: ["symmetric-encryption", "hash-functions"],
    resources: ["Linear Cryptanalysis Demo", "Side-Channel Playground", "Timing Attack Visualization"],
  },
  {
    id: "standards-and-practice",
    title: "Standards and Real-World Practice",
    level: "Intermediate",
    category: "Standards",
    estimatedMinutes: 30,
    description: "Connect visual lessons to RFCs, FIPS publications, NIST recommendations, and safe defaults.",
    outcomes: ["Use standards as references", "Choose modern primitives", "Document assumptions clearly"],
    prerequisites: ["crypto-foundations", "symmetric-encryption", "hash-functions"],
    resources: ["Standards & RFC Explorer", "Curated Video Library"],
  },
];

export function getRoadmapCategories(nodes: RoadmapNode[] = CRYPTOGRAPHY_ROADMAP_NODES): string[] {
  return ["All", ...Array.from(new Set(nodes.map((node) => node.category))).sort()];
}

export function getRoadmapLevels(): string[] {
  return ["All", "Beginner", "Intermediate", "Advanced"];
}

export function getNodeStatus(progress: RoadmapProgress, nodeId: string): RoadmapStatus {
  return progress[nodeId] ?? "not-started";
}

export function arePrerequisitesComplete(node: RoadmapNode, progress: RoadmapProgress): boolean {
  return node.prerequisites.every((id) => getNodeStatus(progress, id) === "completed");
}

function toNodeView(node: RoadmapNode, progress: RoadmapProgress, nodes = CRYPTOGRAPHY_ROADMAP_NODES): RoadmapNodeView {
  return {
    ...node,
    status: getNodeStatus(progress, node.id),
    locked: !arePrerequisitesComplete(node, progress),
    dependencyLabels: node.prerequisites
      .map((id) => nodes.find((candidate) => candidate.id === id)?.title)
      .filter((title): title is string => Boolean(title)),
  };
}

export function filterRoadmapNodes(filters: RoadmapFilter, progress: RoadmapProgress = DEFAULT_ROADMAP_PROGRESS): RoadmapNodeView[] {
  const query = filters.search.trim().toLowerCase();

  return CRYPTOGRAPHY_ROADMAP_NODES.map((node) => toNodeView(node, progress)).filter((node) => {
    const levelMatches = filters.level === "All" || node.level === filters.level;
    const categoryMatches = filters.category === "All" || node.category === filters.category;
    const searchMatches =
      !query ||
      [node.title, node.level, node.category, node.description, ...node.outcomes, ...node.resources]
        .join(" ")
        .toLowerCase()
        .includes(query);

    return levelMatches && categoryMatches && searchMatches;
  });
}

export function calculateRoadmapSummary(progress: RoadmapProgress = DEFAULT_ROADMAP_PROGRESS) {
  const completed = CRYPTOGRAPHY_ROADMAP_NODES.filter((node) => getNodeStatus(progress, node.id) === "completed").length;
  const inProgress = CRYPTOGRAPHY_ROADMAP_NODES.filter((node) => getNodeStatus(progress, node.id) === "in-progress").length;
  const notStarted = CRYPTOGRAPHY_ROADMAP_NODES.length - completed - inProgress;
  const estimatedMinutesRemaining = CRYPTOGRAPHY_ROADMAP_NODES
    .filter((node) => getNodeStatus(progress, node.id) !== "completed")
    .reduce((sum, node) => sum + node.estimatedMinutes, 0);

  return {
    total: CRYPTOGRAPHY_ROADMAP_NODES.length,
    completed,
    inProgress,
    notStarted,
    completionPercent: Math.round((completed / CRYPTOGRAPHY_ROADMAP_NODES.length) * 100),
    estimatedMinutesRemaining,
  };
}

export function getNextRecommendedNode(progress: RoadmapProgress = DEFAULT_ROADMAP_PROGRESS): RoadmapNodeView | null {
  return CRYPTOGRAPHY_ROADMAP_NODES
    .map((node) => toNodeView(node, progress))
    .find((node) => node.status !== "completed" && !node.locked) ?? null;
}

export function buildRoadmapResult(filters: RoadmapFilter = DEFAULT_ROADMAP_FILTER, progress: RoadmapProgress = DEFAULT_ROADMAP_PROGRESS) {
  return {
    filters,
    nodes: filterRoadmapNodes(filters, progress),
    categories: getRoadmapCategories(),
    levels: getRoadmapLevels(),
    summary: calculateRoadmapSummary(progress),
    nextRecommended: getNextRecommendedNode(progress),
  };
}

export function setRoadmapNodeStatus(progress: RoadmapProgress, nodeId: string, status: RoadmapStatus): RoadmapProgress {
  if (!CRYPTOGRAPHY_ROADMAP_NODES.some((node) => node.id === nodeId)) {
    throw new Error("Roadmap node does not exist.");
  }

  return { ...progress, [nodeId]: status };
}

export function buildRoadmapManualChecklist(): string[] {
  return [
    "Open the Interactive Cryptography Roadmap page.",
    "Confirm progress summary cards render.",
    "Mark a roadmap item completed and confirm completion percentage updates.",
    "Filter by Beginner, Intermediate, and Advanced levels.",
    "Filter by category and confirm matching roadmap cards remain.",
    "Search for AES and confirm related roadmap items appear.",
    "Confirm locked items show prerequisite labels.",
    "Resize to mobile width and confirm cards and controls remain usable.",
  ];
}
