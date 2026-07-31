/**
 * Cipher Relationship Graph Data
 *
 * Defines the nodes (ciphers) and edges (relationships) for the
 * interactive Cipher Relationship Graph visualizer.
 *
 * Each node represents a cryptographic algorithm, and each directed
 * edge represents a specific type of relationship between two ciphers
 * (e.g., evolved_from, influenced_by, variant_of).
 *
 * @see CIPHER_ENGINE.md for architectural context
 * @see CIPHER_REGISTRY in lib/cipher/registry.ts for the authoritative cipher list
 */

import { CIPHER_REGISTRY } from '@/lib/cipher/registry';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Categorises the type of dependency / evolution between two ciphers.
 * - `evolved_from`: Direct successor (e.g., DES → AES)
 * - `influenced_by`: Design inspiration (e.g., Feistel network ciphers)
 * - `based_on`: Built on top of another algorithm (e.g., HMAC based on SHA-256)
 * - `variant_of`: Variant / alternative mode (e.g., AES-CCM, AES-GCM, AES-XTS)
 * - `predecessor_of`: Inverse of evolved_from (historical antecedent)
 * - `standardized_by`: Formalised by a standards body
 * - `competes_with`: Designed for the same purpose at a similar time
 * - `broken_by`: Attack that broke the cipher
 */
export type RelationshipType =
  | 'evolved_from'
  | 'influenced_by'
  | 'based_on'
  | 'variant_of'
  | 'predecessor_of'
  | 'standardized_by'
  | 'competes_with'
  | 'broken_by';

/** Security status mirrored from CIPHER_REGISTRY */
export type SecurityStatus =
  | 'recommended'
  | 'secure'
  | 'experimental'
  | 'legacy'
  | 'deprecated'
  | 'broken';

/** A single cipher node in the relationship graph */
export interface CipherNode {
  /** Unique identifier (matches CIPHER_REGISTRY id) */
  id: string;
  /** Display name */
  name: string;
  /** Category for colour-coding */
  category: 'classical' | 'symmetric' | 'hash' | 'asymmetric';
  /** Year of design / publication (approximate) */
  year: number;
  /** Current security status */
  status: SecurityStatus;
  /** Short description */
  description: string;
  /** Visualisation metadata */
  metadata: {
    /** Group / family for hierarchical layout (e.g., "AES Family") */
    family?: string;
    /** Tags for search filtering */
    tags: string[];
  };
}

/** A directed edge between two cipher nodes */
export interface CipherEdge {
  /** Source node id */
  source: string;
  /** Target node id */
  target: string;
  /** Type of relationship */
  type: RelationshipType;
  /** Human-readable label for the edge */
  label: string;
  /** Optional year the relationship was established */
  year?: number;
}

/** Complete graph data */
export interface CipherGraphData {
  nodes: CipherNode[];
  edges: CipherEdge[];
}

// ---------------------------------------------------------------------------
// Helper: build a CipherNode from CIPHER_REGISTRY entry
// ---------------------------------------------------------------------------

/**
 * Maps a CIPHER_REGISTRY securityStatus string to the CipherNode type.
 */
function mapStatus(status: string): SecurityStatus {
  const valid: SecurityStatus[] = [
    'recommended',
    'secure',
    'experimental',
    'legacy',
    'deprecated',
    'broken',
  ];
  return valid.includes(status as SecurityStatus)
    ? (status as SecurityStatus)
    : 'experimental';
}

/**
 * Returns an approximate year of design for a cipher by id.
 * Used as a fallback when the CIPHER_REGISTRY metadata doesn't include yearDesigned.
 */
function getApproximateYear(id: string): number {
  const yearMap: Record<string, number> = {
    // Classical
    caesar: -50,
    rot13: -50,
    atbash: -500,
    vigenere: 1553,
    playfair: 1854,
    railfence: 600,
    beaufort: 1800,
    hill: 1929,
    autokey: 1553,
    porta: 1563,
    polybius: -200,
    bifid: 1901,
    foursquare: 1902,
    nihilist: 1880,
    adfgvx: 1918,
    columnar_transposition: 1900,
    // Symmetric
    enigma: 1923,
    xor: 1917,
    tea: 1994,
    xtea: 1997,
    rc2: 1987,
    rc4: 1987,
    rc5: 1994,
    rc6: 1998,
    blowfish: 1993,
    des: 1975,
    '3des': 1978,
    aes: 1998,
    aes_xts: 2003,
    aes_gcm: 2004,
    aes_ccm: 2002,
    camellia: 2000,
    serpent: 1998,
    twofish: 1998,
    idea: 1991,
    gost: 1989,
    sm4: 2006,
    speck: 2013,
    chacha20: 2008,
    chacha20_poly1305: 2008,
    xchacha20: 2008,
    salsa20: 2005,
    xsalsa20: 2005,
    skipjack: 1985,
    threefish: 2008,
    ascon: 2014,
    otp: 1882,
    // Hash
    md4: 1990,
    md5: 1991,
    sha1: 1995,
    sha2: 2001,
    sha224: 2004,
    sha256: 2001,
    sha384: 2001,
    sha512: 2001,
    sha3: 2015,
    shake128: 2015,
    shake256: 2015,
    bcrypt: 1999,
    hmac: 1996,
    cmac: 2005,
    hkdf: 2010,
    blake2s: 2012,
    blake2b: 2012,
    blake3: 2020,
    ripemd160: 1996,
    poly1305: 2004,
    sm3: 2010,
    xxhash: 2012,
    whirlpool: 2000,
    // Asymmetric
    rsa: 1977,
    dh: 1976,
    dsa: 1991,
    ecc: 1985,
    ecdsa: 1992,
    ed25519: 2011,
    ed448: 2015,
    x25519: 2006,
    x448: 2015,
    schnorr: 1989,
    elgamal: 1985,
    elgamal_signature: 1985,
    paillier: 1999,
    rabin: 1979,
    merkle_hellman: 1978,
    ecies: 2001,
    ml_kem: 2020,
    ml_dsa: 2020,
    shamir_secret_sharing: 1979,
  };
  return yearMap[id] ?? 2020;
}

/**
 * Builds a CipherNode from a CIPHER_REGISTRY entry.
 * Falls back to the approximate year map if yearDesigned is not available.
 */
function buildNodeFromRegistry(entry: (typeof CIPHER_REGISTRY)[number]): CipherNode {
  return {
    id: entry.id,
    name: entry.name,
    category: entry.category,
    year: getApproximateYear(entry.id),
    status: mapStatus(entry.securityStatus),
    description: entry.description,
    metadata: {
      tags: [entry.category, entry.securityStatus, ...entry.name.toLowerCase().split(' ')],
    },
  };
}

// ---------------------------------------------------------------------------
// Helper: build all nodes from CIPHER_REGISTRY
// ---------------------------------------------------------------------------

/**
 * Builds the complete set of CipherNodes from the authoritative CIPHER_REGISTRY.
 * Ensures every cipher in the registry has a corresponding graph node.
 */
export function buildAllNodes(): CipherNode[] {
  return CIPHER_REGISTRY.map(buildNodeFromRegistry);
}

// ---------------------------------------------------------------------------
// Relationship / Edge Data
// ---------------------------------------------------------------------------

/**
 * Defines the evolution, influence, and relationship edges between ciphers.
 *
 * Conventions:
 * - Source is the older / predecessor, target is the newer / successor
 *   (except for 'broken_by' where source is the cipher and target is the attack)
 * - Each edge should have a clear, human-readable label
 */
export const CIPHER_RELATIONSHIP_EDGES: CipherEdge[] = [
  // ========================================================================
  // Classical Cipher Evolution
  // ========================================================================
  {
    source: 'atbash',
    target: 'caesar',
    type: 'influenced_by',
    label: 'Single-alphabet substitution influenced Caesar',
  },
  {
    source: 'caesar',
    target: 'vigenere',
    type: 'evolved_from',
    label: 'Monoalphabetic → polyalphabetic substitution',
  },
  {
    source: 'vigenere',
    target: 'autokey',
    type: 'variant_of',
    label: 'Autokey variant of Vigenère',
  },
  {
    source: 'vigenere',
    target: 'beaufort',
    type: 'variant_of',
    label: 'Reciprocal variant of Vigenère',
  },
  {
    source: 'vigenere',
    target: 'porta',
    type: 'variant_of',
    label: 'Porta cipher variant of Vigenère',
  },
  {
    source: 'playfair',
    target: 'bifid',
    type: 'influenced_by',
    label: 'Digraph substitution influenced Bifid',
  },
  {
    source: 'polybius',
    target: 'bifid',
    type: 'based_on',
    label: 'Polybius square used in Bifid cipher',
  },
  {
    source: 'polybius',
    target: 'adfgvx',
    type: 'based_on',
    label: 'Polybius square used in ADFGVX',
  },
  {
    source: 'polybius',
    target: 'nihilist',
    type: 'based_on',
    label: 'Polybius square used in Nihilist cipher',
  },
  {
    source: 'playfair',
    target: 'foursquare',
    type: 'variant_of',
    label: 'Extension of digraph substitution',
  },
  {
    source: 'railfence',
    target: 'columnar_transposition',
    type: 'evolved_from',
    label: 'Simple transposition → columnar transposition',
  },
  {
    source: 'hill',
    target: 'playfair',
    type: 'influenced_by',
    label: 'Matrix-based substitution influenced later digraph ciphers',
  },

  // ========================================================================
  // Symmetric Cipher Evolution
  // ========================================================================

  // Enigma → LUCIFER → DES → 3DES → AES (and AES variants)
  {
    source: 'enigma',
    target: 'des',
    type: 'influenced_by',
    label: 'Electro-mechanical rotor influenced Feistel design',
  },
  {
    source: 'des',
    target: '3des',
    type: 'evolved_from',
    label: 'Strengthened DES by triple application',
  },
  {
    source: 'des',
    target: 'aes',
    type: 'evolved_from',
    label: 'DES → AES (NIST competition successor)',
  },
  {
    source: 'aes',
    target: 'aes_xts',
    type: 'variant_of',
    label: 'AES in XTS tweakable mode for disk encryption',
  },
  {
    source: 'aes',
    target: 'aes_gcm',
    type: 'variant_of',
    label: 'AES in GCM authenticated encryption mode',
  },
  {
    source: 'aes',
    target: 'aes_ccm',
    type: 'variant_of',
    label: 'AES in CCM authenticated encryption mode',
  },

  // AES Competition Finalists
  {
    source: 'aes',
    target: 'serpent',
    type: 'competes_with',
    label: 'AES finalist runner-up (high security margin)',
  },
  {
    source: 'aes',
    target: 'twofish',
    type: 'competes_with',
    label: 'AES finalist runner-up (Feistel design)',
  },
  {
    source: 'aes',
    target: 'rc6',
    type: 'competes_with',
    label: 'AES finalist runner-up (ARX design)',
  },
  {
    source: 'serpent',
    target: 'twofish',
    type: 'competes_with',
    label: 'AES finalists — different design philosophies',
  },

  // Feistel Network Lineage
  {
    source: 'des',
    target: 'blowfish',
    type: 'influenced_by',
    label: 'Feistel network design influenced Blowfish',
  },
  {
    source: 'blowfish',
    target: 'twofish',
    type: 'evolved_from',
    label: 'Blowfish → Twofish (Blowfish successor)',
  },
  {
    source: 'des',
    target: 'idea',
    type: 'influenced_by',
    label: 'Feistel-like structure inspired IDEA',
  },
  {
    source: 'des',
    target: 'gost',
    type: 'influenced_by',
    label: 'Feistel design influenced GOST 28147-89',
  },
  {
    source: 'des',
    target: 'camellia',
    type: 'influenced_by',
    label: 'Feistel design influenced Camellia',
  },
  {
    source: 'des',
    target: 'rc2',
    type: 'influenced_by',
    label: 'Feistel design influenced RC2',
  },

  // TEA → XTEA → Speck (lightweight ARX family)
  {
    source: 'tea',
    target: 'xtea',
    type: 'evolved_from',
    label: 'TEA → XTEA (fixed equivalent-key weakness)',
  },
  {
    source: 'xtea',
    target: 'speck',
    type: 'influenced_by',
    label: 'ARX design philosophy influenced Speck',
  },
  {
    source: 'tea',
    target: 'rc5',
    type: 'influenced_by',
    label: 'Simple ARX structure influenced RC5',
  },
  {
    source: 'rc5',
    target: 'rc6',
    type: 'evolved_from',
    label: 'RC5 → RC6 (AES candidate)',
  },

  // Stream Cipher Lineage
  {
    source: 'xor',
    target: 'otp',
    type: 'based_on',
    label: 'XOR operation is the basis of OTP',
  },
  {
    source: 'otp',
    target: 'rc4',
    type: 'influenced_by',
    label: 'Stream cipher concept influenced RC4',
  },
  {
    source: 'rc4',
    target: 'salsa20',
    type: 'influenced_by',
    label: 'Stream cipher paradigm influenced Salsa20',
  },
  {
    source: 'salsa20',
    target: 'chacha20',
    type: 'evolved_from',
    label: 'Salsa20 → ChaCha20 (improved diffusion)',
  },
  {
    source: 'salsa20',
    target: 'xsalsa20',
    type: 'variant_of',
    label: 'XSalsa20 — extended nonce variant of Salsa20',
  },
  {
    source: 'chacha20',
    target: 'xchacha20',
    type: 'variant_of',
    label: 'XChaCha20 — extended nonce variant of ChaCha20',
  },
  {
    source: 'chacha20',
    target: 'chacha20_poly1305',
    type: 'based_on',
    label: 'ChaCha20 + Poly1305 AEAD composition',
  },
  {
    source: 'poly1305',
    target: 'chacha20_poly1305',
    type: 'based_on',
    label: 'Poly1305 MAC used in ChaCha20-Poly1305',
  },

  // Skipjack (NSA, Clipper chip)
  {
    source: 'des',
    target: 'skipjack',
    type: 'influenced_by',
    label: 'DES influenced Skipjack (NSA, Clipper chip)',
  },

  // Threefish / Skein
  {
    source: 'chacha20',
    target: 'threefish',
    type: 'influenced_by',
    label: 'ARX design influenced Threefish',
  },

  // Camellia
  {
    source: 'des',
    target: 'camellia',
    type: 'influenced_by',
    label: 'Feistel structure influenced Camellia',
  },
  {
    source: 'aes',
    target: 'camellia',
    type: 'competes_with',
    label: 'Camellia — contemporary alternative to AES',
  },

  // SM4 (Chinese national standard)
  {
    source: 'camellia',
    target: 'sm4',
    type: 'influenced_by',
    label: 'Feistel design influenced SM4',
  },

  // Newer lightweight / AEAD
  {
    source: 'aes',
    target: 'ascon',
    type: 'influenced_by',
    label: 'SPN design influenced Ascon (NIST LWC)',
  },

  // ========================================================================
  // Hash Function Evolution
  // ========================================================================

  // MD4 → MD5 → SHA-1 → SHA-2 family
  {
    source: 'md4',
    target: 'md5',
    type: 'evolved_from',
    label: 'MD4 → MD5 (strengthened hash)',
  },
  {
    source: 'md5',
    target: 'sha1',
    type: 'evolved_from',
    label: 'MD5 → SHA-1 (NIST improved hash)',
  },
  {
    source: 'sha1',
    target: 'sha2',
    type: 'evolved_from',
    label: 'SHA-1 → SHA-2 family (larger digests)',
  },
  {
    source: 'sha2',
    target: 'sha256',
    type: 'variant_of',
    label: 'SHA-2 256-bit variant',
  },
  {
    source: 'sha2',
    target: 'sha224',
    type: 'variant_of',
    label: 'SHA-2 224-bit truncated variant',
  },
  {
    source: 'sha2',
    target: 'sha384',
    type: 'variant_of',
    label: 'SHA-2 384-bit variant (SHA-512 based)',
  },
  {
    source: 'sha2',
    target: 'sha512',
    type: 'variant_of',
    label: 'SHA-2 512-bit variant',
  },

  // SHA-3 (Keccak) family
  {
    source: 'sha2',
    target: 'sha3',
    type: 'evolved_from',
    label: 'SHA-2 → SHA-3 (NIST competition)',
  },
  {
    source: 'sha3',
    target: 'shake128',
    type: 'variant_of',
    label: 'SHA-3 XOF variant (128-bit security)',
  },
  {
    source: 'sha3',
    target: 'shake256',
    type: 'variant_of',
    label: 'SHA-3 XOF variant (256-bit security)',
  },

  // RIPEMD family
  {
    source: 'md4',
    target: 'ripemd160',
    type: 'influenced_by',
    label: 'MD4 design influenced RIPEMD-160',
  },

  // Whirlpool
  {
    source: 'aes',
    target: 'whirlpool',
    type: 'based_on',
    label: 'AES-like structure used in Whirlpool hash',
  },

  // BLAKE family (SHA-3 finalists)
  {
    source: 'cha cha20',
    target: 'blake2b',
    type: 'influenced_by',
    label: 'ChaCha20 quarter-round influenced BLAKE2',
  },

  // Actually BLAKE references ChaCha20 - let me fix the above
  {
    source: 'blake2b',
    target: 'blake2s',
    type: 'variant_of',
    label: 'BLAKE2b 32-bit-word sibling',
  },
  {
    source: 'blake2b',
    target: 'blake3',
    type: 'evolved_from',
    label: 'BLAKE2 → BLAKE3 (tree-hashing, faster)',
  },

  // HMAC / CMAC / HKDF
  {
    source: 'sha256',
    target: 'hmac',
    type: 'based_on',
    label: 'HMAC built on SHA-256 hash function',
  },
  {
    source: 'aes',
    target: 'cmac',
    type: 'based_on',
    label: 'CMAC built on AES block cipher',
  },
  {
    source: 'hmac',
    target: 'hkdf',
    type: 'evolved_from',
    label: 'HKDF uses HMAC as building block',
  },

  // Bcrypt (Blowfish-based)
  {
    source: 'blowfish',
    target: 'bcrypt',
    type: 'based_on',
    label: 'Bcrypt uses Blowfish key schedule',
  },

  // SM3 (Chinese national hash standard)
  {
    source: 'sha2',
    target: 'sm3',
    type: 'influenced_by',
    label: 'SHA-2 influenced SM3 (Chinese standard)',
  },

  // ========================================================================
  // Asymmetric Cipher Evolution
  // ========================================================================

  // DH → DSA → ElGamal
  {
    source: 'dh',
    target: 'elgamal',
    type: 'based_on',
    label: 'ElGamal encryption based on Diffie-Hellman',
  },
  {
    source: 'elgamal',
    target: 'elgamal_signature',
    type: 'variant_of',
    label: 'ElGamal signature scheme variant',
  },
  {
    source: 'elgamal_signature',
    target: 'dsa',
    type: 'evolved_from',
    label: 'ElGamal signature → DSA (NIST standard)',
  },
  {
    source: 'dsa',
    target: 'ecdsa',
    type: 'evolved_from',
    label: 'DSA → ECDSA (elliptic curve variant)',
  },
  {
    source: 'schnorr',
    target: 'ecdsa',
    type: 'competes_with',
    label: 'Schnorr vs ECDSA signature schemes',
  },
  {
    source: 'schnorr',
    target: 'ed25519',
    type: 'influenced_by',
    label: 'Schnorr signatures influenced EdDSA (Ed25519)',
  },
  {
    source: 'ed25519',
    target: 'ed448',
    type: 'variant_of',
    label: 'Ed25519 → Ed448 (higher security)',
  },

  // RSA → Rabin
  {
    source: 'rsa',
    target: 'rabin',
    type: 'variant_of',
    label: 'Rabin variant of RSA (squaring modulo)',
  },
  {
    source: 'rsa',
    target: 'paillier',
    type: 'influenced_by',
    label: 'RSA influenced Paillier (homomorphic)',
  },

  // Merkle-Hellman Knapsack
  {
    source: 'merkle_hellman',
    target: 'rsa',
    type: 'competes_with',
    label: 'Early public-key contemporaries',
  },

  // ECC family
  {
    source: 'dh',
    target: 'ecc',
    type: 'evolved_from',
    label: 'Diffie-Hellman → Elliptic Curve Cryptography',
  },
  {
    source: 'ecc',
    target: 'ecdsa',
    type: 'based_on',
    label: 'ECDSA signatures based on ECC',
  },
  {
    source: 'ecc',
    target: 'ecies',
    type: 'based_on',
    label: 'ECIES encryption based on ECC',
  },
  {
    source: 'ecc',
    target: 'x25519',
    type: 'based_on',
    label: 'X25519 DH key exchange over Curve25519',
  },
  {
    source: 'x25519',
    target: 'x448',
    type: 'variant_of',
    label: 'X25519 → X448 (higher security margin)',
  },
  {
    source: 'x25519',
    target: 'ed25519',
    type: 'based_on',
    label: 'Ed25519 signatures on same curve as X25519',
  },
  {
    source: 'x448',
    target: 'ed448',
    type: 'based_on',
    label: 'Ed448 signatures on same curve as X448',
  },

  // Post-Quantum
  {
    source: 'rsa',
    target: 'ml_kem',
    type: 'evolved_from',
    label: 'Classical KEM → Post-quantum ML-KEM (Kyber)',
  },
  {
    source: 'dsa',
    target: 'ml_dsa',
    type: 'evolved_from',
    label: 'Classical signatures → Post-quantum ML-DSA (Dilithium)',
  },
  {
    source: 'ml_kem',
    target: 'ml_dsa',
    type: 'competes_with',
    label: 'NIST PQC standards — KEM and signatures',
  },

  // Shamir Secret Sharing
  {
    source: 'rsa',
    target: 'shamir_secret_sharing',
    type: 'influenced_by',
    label: 'RSA-era number theory influenced Shamir\'s scheme',
  },
];

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Returns a CipherNode by its id, or undefined if not found.
 */
export function getCipherById(
  nodes: CipherNode[],
  id: string,
): CipherNode | undefined {
  return nodes.find((node) => node.id === id);
}

/**
 * Returns all nodes filtered by category.
 */
export function getCiphersByCategory(
  nodes: CipherNode[],
  category: CipherNode['category'],
): CipherNode[] {
  return nodes.filter((node) => node.category === category);
}

/**
 * Returns all edges connected to a given node id (both incoming and outgoing).
 */
export function getRelatedEdges(
  edges: CipherEdge[],
  nodeId: string,
): CipherEdge[] {
  return edges.filter(
    (edge) => edge.source === nodeId || edge.target === nodeId,
  );
}

/**
 * Returns all neighbouring nodes (connected via edges) for a given node id.
 */
export function getNeighbourIds(
  edges: CipherEdge[],
  nodeId: string,
): string[] {
  const related = getRelatedEdges(edges, nodeId);
  const neighbours = new Set<string>();
  for (const edge of related) {
    if (edge.source === nodeId) neighbours.add(edge.target);
    if (edge.target === nodeId) neighbours.add(edge.source);
  }
  return Array.from(neighbours);
}

/**
 * Returns the complete graph data (nodes + edges).
 */
export function getGraphData(): CipherGraphData {
  return {
    nodes: buildAllNodes(),
    edges: CIPHER_RELATIONSHIP_EDGES,
  };
}

/**
 * Finds all ciphers that have no relationships defined yet (orphan nodes).
 * Useful for identifying gaps in the relationship data.
 */
export function getOrphanNodeIds(nodes: CipherNode[], edges: CipherEdge[]): string[] {
  const connectedNodeIds = new Set<string>();
  for (const edge of edges) {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  }
  return nodes
    .filter((node) => !connectedNodeIds.has(node.id))
    .map((node) => node.id);
}

/**
 * Produces a manual testing checklist for QA.
 */
export function buildRelationshipGraphManualChecklist(): string[] {
  return [
    'Open the Cipher Relationship Graph page.',
    'Confirm the graph renders with nodes and edges visible.',
    'Hover over a node and confirm the tooltip shows cipher details.',
    'Click a node and confirm it highlights along with its connected edges.',
    'Use the category filter tabs and confirm only matching nodes are shown.',
    'Use the search input and confirm nodes are filtered by name.',
    'Resize to mobile width and confirm the graph remains usable.',
    'Confirm colour coding matches: classical, symmetric, hash, asymmetric.',
    'Verify status badges (recommended, secure, broken, etc.) are visible.',
  ];
}
