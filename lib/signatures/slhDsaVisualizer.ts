export interface SlhDsaParameterSet {
  name: string;
  securityLevel: 1 | 3 | 5;
  treeHeight: number;
  hypertreeLayers: number;
  forsTrees: number;
  forsHeight: number;
  wotsChains: number;
  note: string;
}

export interface SlhDsaNode {
  layer: number;
  index: number;
  label: string;
  hash: string;
  parentHash?: string;
}

export interface ForsReveal {
  treeIndex: number;
  leafIndex: number;
  secret: string;
  publicLeaf: string;
  authPath: string[];
}

export interface VerificationStep {
  label: string;
  formula: string;
  value: string;
  note: string;
}

export interface SlhDsaVisualizerResult {
  message: string;
  parameterSet: SlhDsaParameterSet;
  messageDigest: string;
  forsMessageIndexes: number[];
  forsReveals: ForsReveal[];
  hypertree: SlhDsaNode[];
  root: string;
  signatureSizeEstimateBytes: number;
  verificationSteps: VerificationStep[];
  accepted: boolean;
  references: string[];
}

export const SLH_DSA_PARAMETER_SETS: SlhDsaParameterSet[] = [
  {
    name: "SLH-DSA-SHA2-128s",
    securityLevel: 1,
    treeHeight: 63,
    hypertreeLayers: 7,
    forsTrees: 14,
    forsHeight: 12,
    wotsChains: 35,
    note: "Small-signature educational profile based on the NIST SLH-DSA family.",
  },
  {
    name: "SLH-DSA-SHA2-128f",
    securityLevel: 1,
    treeHeight: 66,
    hypertreeLayers: 22,
    forsTrees: 33,
    forsHeight: 6,
    wotsChains: 35,
    note: "Fast educational profile with more hypertree layers and lower FORS height.",
  },
  {
    name: "SLH-DSA-SHAKE-192s",
    securityLevel: 3,
    treeHeight: 63,
    hypertreeLayers: 7,
    forsTrees: 17,
    forsHeight: 14,
    wotsChains: 51,
    note: "SHAKE-based level-3 profile for showing larger FORS proofs.",
  },
  {
    name: "SLH-DSA-SHA2-256s",
    securityLevel: 5,
    treeHeight: 64,
    hypertreeLayers: 8,
    forsTrees: 22,
    forsHeight: 14,
    wotsChains: 67,
    note: "Level-5 profile for explaining why stateless hash-based signatures are large.",
  },
];

const DEFAULT_REFERENCE_LINKS = [
  "NIST FIPS 205 — Stateless Hash-Based Digital Signature Standard",
  "SPHINCS+ design: stateless hash-based signatures",
  "FORS: forest of random subsets",
  "WOTS+: one-time hash-based signatures",
  "XMSS-style Merkle authentication paths",
];

function normalizeMessage(message: string): string {
  return message
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, 512);
}

function toHexByte(value: number): string {
  return (value & 0xff).toString(16).toUpperCase().padStart(2, "0");
}

export function toyHash(input: string, bytes = 16): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;

  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (h2 + Math.imul(code + index + 1, 0x45d9f3b)) >>> 0;
    h2 ^= h2 >>> 16;
  }

  const out: string[] = [];
  for (let index = 0; index < bytes; index += 1) {
    const mixed =
      (h1 >>> ((index % 4) * 8)) ^
      (h2 >>> (((index + 1) % 4) * 8)) ^
      (index * 0x5d);
    out.push(toHexByte(mixed));
    h1 = Math.imul(h1 ^ mixed, 0x01000193) >>> 0;
    h2 = (h2 + mixed + index * 17) >>> 0;
  }

  return out.join("");
}

export function selectParameterSet(name: string): SlhDsaParameterSet {
  return (
    SLH_DSA_PARAMETER_SETS.find((params) => params.name === name) ??
    SLH_DSA_PARAMETER_SETS[0]
  );
}

export function deriveForsIndexes(
  messageDigest: string,
  parameterSet: SlhDsaParameterSet,
): number[] {
  const maxLeaf = 1 << Math.min(parameterSet.forsHeight, 15);
  const indexes: number[] = [];

  for (let tree = 0; tree < parameterSet.forsTrees; tree += 1) {
    const slice = messageDigest.slice(
      (tree * 4) % messageDigest.length,
      ((tree * 4) % messageDigest.length) + 4,
    );
    const padded = slice.padEnd(4, messageDigest.slice(0, 4));
    indexes.push(Number.parseInt(padded, 16) % maxLeaf);
  }

  return indexes;
}

export function buildForsReveals(
  messageDigest: string,
  parameterSet: SlhDsaParameterSet,
): ForsReveal[] {
  return deriveForsIndexes(messageDigest, parameterSet).map(
    (leafIndex, treeIndex) => {
      const secret = toyHash(
        `fors-secret:${parameterSet.name}:${treeIndex}:${leafIndex}:${messageDigest}`,
        8,
      );
      const publicLeaf = toyHash(`fors-leaf:${secret}`, 8);
      const authPath = Array.from(
        { length: Math.min(parameterSet.forsHeight, 6) },
        (_, level) =>
          toyHash(
            `fors-auth:${parameterSet.name}:${treeIndex}:${leafIndex}:${level}`,
            8,
          ),
      );

      return {
        treeIndex,
        leafIndex,
        secret,
        publicLeaf,
        authPath,
      };
    },
  );
}

export function buildHypertree(
  messageDigest: string,
  parameterSet: SlhDsaParameterSet,
): SlhDsaNode[] {
  const displayedLayers = Math.min(parameterSet.hypertreeLayers, 8);
  const nodes: SlhDsaNode[] = [];
  let childHash = toyHash(`leaf:${parameterSet.name}:${messageDigest}`, 8);

  for (let layer = 0; layer < displayedLayers; layer += 1) {
    const index =
      Number.parseInt(
        messageDigest.slice(
          (layer * 2) % messageDigest.length,
          ((layer * 2) % messageDigest.length) + 2,
        ),
        16,
      ) % 16;
    const parentHash = toyHash(
      `xmss-parent:${parameterSet.name}:${layer}:${index}:${childHash}`,
      8,
    );

    nodes.push({
      layer,
      index,
      label: layer === 0 ? "FORS public key leaf" : `XMSS layer ${layer}`,
      hash: childHash,
      parentHash,
    });

    childHash = parentHash;
  }

  nodes.push({
    layer: displayedLayers,
    index: 0,
    label: "Hypertree public root",
    hash: childHash,
  });

  return nodes;
}

export function estimateSignatureSizeBytes(
  parameterSet: SlhDsaParameterSet,
): number {
  const n =
    parameterSet.securityLevel === 1
      ? 16
      : parameterSet.securityLevel === 3
        ? 24
        : 32;
  const randomizer = n;
  const fors = parameterSet.forsTrees * (1 + parameterSet.forsHeight) * n;
  const wotsAndAuth =
    parameterSet.hypertreeLayers *
    (parameterSet.wotsChains +
      parameterSet.treeHeight / parameterSet.hypertreeLayers) *
    n;
  return Math.round(randomizer + fors + wotsAndAuth);
}

export function buildVerificationSteps(
  messageDigest: string,
  forsReveals: ForsReveal[],
  hypertree: SlhDsaNode[],
  parameterSet: SlhDsaParameterSet,
): VerificationStep[] {
  const firstFors = forsReveals[0];
  const root = hypertree[hypertree.length - 1]?.hash ?? "";

  return [
    {
      label: "Digest message",
      formula: "digest = H(message, public seed)",
      value: messageDigest,
      note: "SLH-DSA derives several indexes from a randomized message digest.",
    },
    {
      label: "Verify FORS reveals",
      formula: "FORS pk = root(revealed leaves + auth paths)",
      value: `${forsReveals.length} FORS trees, first leaf ${firstFors?.leafIndex ?? 0}`,
      note: "FORS signs the message digest by revealing selected leaves and authentication paths.",
    },
    {
      label: "Verify WOTS+ chain",
      formula: "WOTS+ pk = chain(signature element, checksum)",
      value: `${parameterSet.wotsChains} displayed chains`,
      note: "Each hypertree layer uses a one-time WOTS+ signature to authenticate the next root.",
    },
    {
      label: "Climb hypertree",
      formula: "rootᵢ₊₁ = Merkle(rootᵢ, auth pathᵢ)",
      value: `${hypertree.length} displayed nodes, final root ${root}`,
      note: "Verification succeeds when the computed top root equals the public key root.",
    },
  ];
}

export function buildSlhDsaVisualization(
  message: string,
  parameterSetName = SLH_DSA_PARAMETER_SETS[0].name,
): SlhDsaVisualizerResult {
  const safeMessage = normalizeMessage(
    message || "CryptoViz post-quantum signature",
  );
  const parameterSet = selectParameterSet(parameterSetName);
  const messageDigest = toyHash(
    `digest:${parameterSet.name}:${safeMessage}`,
    16,
  );
  const forsReveals = buildForsReveals(messageDigest, parameterSet);
  const hypertree = buildHypertree(messageDigest, parameterSet);
  const root = hypertree[hypertree.length - 1]?.hash ?? "";
  const verificationSteps = buildVerificationSteps(
    messageDigest,
    forsReveals,
    hypertree,
    parameterSet,
  );

  return {
    message: safeMessage,
    parameterSet,
    messageDigest,
    forsMessageIndexes: forsReveals.map((reveal) => reveal.leafIndex),
    forsReveals,
    hypertree,
    root,
    signatureSizeEstimateBytes: estimateSignatureSizeBytes(parameterSet),
    verificationSteps,
    accepted: verificationSteps.length === 4 && root.length > 0,
    references: DEFAULT_REFERENCE_LINKS,
  };
}

export function getSlhDsaConceptCards(): {
  title: string;
  description: string;
}[] {
  return [
    {
      title: "Stateless hash-based signatures",
      description:
        "SLH-DSA avoids private signing state by using a hypertree of many one-time signing keys.",
    },
    {
      title: "FORS",
      description:
        "FORS signs the message digest by revealing selected secret leaves and authentication paths.",
    },
    {
      title: "WOTS+",
      description:
        "WOTS+ signs each lower-layer root so the verifier can climb from FORS to the public root.",
    },
    {
      title: "Hypertree verification",
      description:
        "The verifier recomputes roots layer by layer until reaching the public key root.",
    },
  ];
}

export function buildSlhDsaManualChecklist(): string[] {
  return [
    "Open the SLH-DSA visualizer page.",
    "Change the message and confirm the FORS indexes, hypertree, and root update.",
    "Switch between parameter sets and confirm signature-size estimates change.",
    "Confirm FORS reveal cards show selected leaves and authentication paths.",
    "Confirm hypertree layers show how verification climbs toward the root.",
    "Confirm standards references mention NIST FIPS 205 and SPHINCS+.",
    "Resize on desktop, tablet, and mobile widths.",
    "Run the focused SLH-DSA visualizer unit tests.",
  ];
}
