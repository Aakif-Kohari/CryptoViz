export type AuditScenarioId =
  | 'predictable-key-generator'
  | 'static-iv'
  | 'leaky-mac-check'
  | 'unpadded-rsa'
  | 'insecure-encryption-mode'

export type AuditSeverity = 'critical' | 'high' | 'medium'

export type AuditCheckResult = {
  passed: boolean
  title: string
  message: string
}

export type AuditScenario = {
  id: AuditScenarioId
  title: string
  shortTitle: string
  description: string
  severity: AuditSeverity
  category: string
  vulnerableCode: string
  secureCode: string
  vulnerability: string
  impact: string
  remediation: string
  references: string[]
  exploitLabel: string
  exploitDescription: string
  hints: string[]
  check: (code: string) => AuditCheckResult
}

const normalizeCode = (code: string): string =>
  code
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()

const containsAny = (code: string, patterns: RegExp[]): boolean =>
  patterns.some((pattern) => pattern.test(code))

const hasCryptoRandom = (code: string): boolean =>
  containsAny(code, [
    /\bcrypto\.getRandomValues\s*\(/,
    /\bcrypto\.randomUUID\s*\(/,
    /\bcrypto\.subtle\.generateKey\s*\(/,
    /\brandomBytes\s*\(/,
    /\bwebcrypto\.getRandomValues\s*\(/,
  ])

const hasConstantTimeComparison = (code: string): boolean =>
  containsAny(code, [
    /\bconstantTimeEqual\s*\(/,
    /\bconstantTimeHexEqual\s*\(/,
    /\bconstantTimeStringEqual\s*\(/,
  ])

const hasSecureAesIv = (code: string): boolean =>
  containsAny(code, [
    /\bcrypto\.getRandomValues\s*\(\s*iv\s*\)/,
    /\bcrypto\.getRandomValues\s*\(\s*new\s+Uint8Array\s*\(\s*16\s*\)\s*\)/,
    /\brandomBytes\s*\(\s*16\s*\)/,
    /\bgenerateIv\s*\(/,
    /\biv\s*=\s*crypto\.getRandomValues/,
  ])

const hasRsaPadding = (code: string): boolean =>
  containsAny(code, [
    /\bRSA-OAEP\b/,
    /\brsa_oaep\b/i,
    /\bRSA_PKCS1_OAEP_PADDING\b/,
    /\bOAEP\b/,
  ])

const hasAuthenticatedEncryption = (code: string): boolean =>
  containsAny(code, [
    /\bAES-GCM\b/,
    /\bAES-GCM\b/i,
    /\bchacha20-poly1305\b/i,
    /\bChaCha20-Poly1305\b/,
  ])

export const NAVIGATION_AUDIT_CATEGORY = 'Security Auditing'

export const AUDIT_SCENARIOS: AuditScenario[] = [
  {
    id: 'predictable-key-generator',
    title: 'The Predictable Key Generator',
    shortTitle: 'Predictable Key',
    description:
      'A cryptographic key is generated with Math.random(), whose output is not designed to provide cryptographically secure randomness.',
    severity: 'critical',
    category: 'Randomness',
    vulnerableCode: `function generateKey(): Uint8Array {
  const key = new Uint8Array(32)

  for (let i = 0; i < key.length; i++) {
    key[i] = Math.floor(Math.random() * 256)
  }

  return key
}`,
    secureCode: `function generateKey(): Uint8Array {
  const key = new Uint8Array(32)

  crypto.getRandomValues(key)

  return key
}`,
    vulnerability:
      'Math.random() is a general-purpose pseudo-random number generator. Its output must not be treated as cryptographic entropy for keys, IVs, tokens, nonces, or secrets.',
    impact:
      'If an attacker can predict or reconstruct the generator state, future cryptographic material may become predictable.',
    remediation:
      'Use a cryptographically secure random number generator such as crypto.getRandomValues() in the browser or an operating-system-backed CSPRNG on the server.',
    references: [
      'NIST SP 800-90A — Recommendation for Random Number Generation',
      'OWASP Cryptographic Failures',
    ],
    exploitLabel: 'Predict Random Key Material',
    exploitDescription:
      'The verifier searches the current implementation for a cryptographically secure randomness source and rejects Math.random()-based key generation.',
    hints: [
      'Look for the source of entropy used to fill the key.',
      'Math.random() is not a cryptographic random number generator.',
      'Replace the byte generation loop with crypto.getRandomValues().',
    ],
    check: (code) => {
      const normalized = normalizeCode(code)
      const vulnerable = /\bMath\.random\s*\(/.test(normalized)
      const secure = hasCryptoRandom(normalized)

      if (secure && !vulnerable) {
        return {
          passed: true,
          title: 'Key generation secured',
          message:
            'The implementation uses a cryptographically secure randomness source instead of Math.random().',
        }
      }

      return {
        passed: false,
        title: 'Predictable randomness detected',
        message:
          'The key-generation path still uses Math.random() or does not demonstrate a cryptographically secure randomness source.',
      }
    },
  },

  {
    id: 'static-iv',
    title: 'The Static IV Disaster',
    shortTitle: 'Static IV',
    description:
      'AES-CBC encryption uses a fixed initialization vector, allowing repeated plaintext prefixes to produce detectable ciphertext relationships.',
    severity: 'high',
    category: 'IV / Nonce Management',
    vulnerableCode: `const IV = new Uint8Array([
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
])

async function encrypt(data: ArrayBuffer, key: CryptoKey) {
  return crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: IV },
    key,
    data,
  )
}`,
    secureCode: `async function encrypt(data: ArrayBuffer, key: CryptoKey) {
  const iv = crypto.getRandomValues(
    new Uint8Array(16),
  )

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    data,
  )

  return { iv, ciphertext }
}`,
    vulnerability:
      'CBC requires an unpredictable, non-repeating IV for encryption under the same key. Reusing a fixed IV removes this protection.',
    impact:
      'An attacker can detect relationships between messages and identify repeated plaintext prefixes without knowing the key.',
    remediation:
      'Generate a fresh unpredictable IV for every encryption operation and transmit the IV alongside the ciphertext. For new designs, prefer authenticated encryption such as AES-GCM.',
    references: [
      'NIST SP 800-38A — Recommendation for Block Cipher Modes of Operation',
      'OWASP Cryptographic Storage Cheat Sheet',
    ],
    exploitLabel: 'Detect IV Reuse',
    exploitDescription:
      'The verifier checks whether the encryption implementation uses a hardcoded IV or instead creates fresh IV material for each encryption operation.',
    hints: [
      'The IV should not be a module-level constant.',
      'Generate a new IV for every encryption.',
      'AES-GCM is generally preferable for new authenticated encryption designs.',
    ],
    check: (code) => {
      const normalized = normalizeCode(code)
      const hardcodedIv =
        /\b(?:const|let|var)\s+(?:IV|iv)\s*=\s*(?:new\s+)?Uint8Array\s*\(/.test(
          normalized,
        ) ||
        /\b(?:const|let|var)\s+(?:IV|iv)\s*=\s*\[[\s\S]*?\]/.test(normalized)

      const randomIv = hasSecureAesIv(normalized)
      const authenticatedMode = hasAuthenticatedEncryption(normalized)

      if ((!hardcodedIv && randomIv) || authenticatedMode) {
        return {
          passed: true,
          title: 'IV handling secured',
          message:
            'The implementation no longer relies on a fixed IV and demonstrates fresh randomness or authenticated encryption.',
        }
      }

      return {
        passed: false,
        title: 'Static IV detected',
        message:
          'The encryption implementation still appears to use a fixed IV or does not demonstrate fresh IV generation.',
      }
    },
  },

  {
    id: 'leaky-mac-check',
    title: 'The Leaky MAC Check',
    shortTitle: 'MAC Timing Leak',
    description:
      'A MAC is compared with ordinary string equality, which can short-circuit when an early byte differs.',
    severity: 'high',
    category: 'Side Channels',
    vulnerableCode: `function verifyMac(
  providedMac: string,
  expectedMac: string,
): boolean {
  return providedMac === expectedMac
}`,
    secureCode: `import {
  constantTimeStringEqual,
} from '@/lib/utils/constantTime'

function verifyMac(
  providedMac: string,
  expectedMac: string,
): boolean {
  return constantTimeStringEqual(
    providedMac,
    expectedMac,
  )
}`,
    vulnerability:
      'Ordinary equality can expose information through differences in execution time when comparing attacker-controlled authentication material.',
    impact:
      'In sufficiently measurable environments, an attacker may use timing differences to learn information about a secret MAC or authentication token.',
    remediation:
      'Use a constant-time comparison primitive designed for security-sensitive values. CryptoViz provides constantTimeStringEqual(), constantTimeHexEqual(), and constantTimeEqual().',
    references: [
      'CWE-208 — Observable Timing Discrepancy',
      'OWASP Authentication Cheat Sheet',
    ],
    exploitLabel: 'Launch Timing Attack',
    exploitDescription:
      'The verifier detects ordinary equality operators used to compare the two MAC values and checks for CryptoViz constant-time comparison utilities.',
    hints: [
      'Do not compare authentication tags with ordinary === or ==.',
      'CryptoViz already provides constantTimeStringEqual().',
      'The comparison should not return early based on the first mismatching byte.',
    ],
    check: (code) => {
      const normalized = normalizeCode(code)

      const secure = hasConstantTimeComparison(normalized)

      const insecureComparison =
        /\b(providedMac|userMac|expectedMac|secretMac)\b[\s\S]{0,120}(===|==)\s*\b(providedMac|userMac|expectedMac|secretMac)\b/.test(
          normalized,
        ) ||
        /\b(providedMac|userMac|expectedMac|secretMac)\b\s*(===|==)\s*\b(providedMac|userMac|expectedMac|secretMac)\b/.test(
          normalized,
        )

      if (secure && !insecureComparison) {
        return {
          passed: true,
          title: 'MAC comparison secured',
          message:
            'The MAC verification path uses a constant-time comparison utility.',
        }
      }

      return {
        passed: false,
        title: 'Timing-sensitive comparison detected',
        message:
          'The MAC verification path still appears to use ordinary equality or lacks a constant-time comparison.',
      }
    },
  },

  {
    id: 'unpadded-rsa',
    title: 'The Unpadded RSA Cube Root Vulnerability',
    shortTitle: 'Unpadded RSA',
    description:
      'RSA with a small public exponent and no randomized padding can expose small plaintexts through algebraic attacks.',
    severity: 'critical',
    category: 'RSA',
    vulnerableCode: `function encryptSmallMessage(
  message: bigint,
  publicExponent = 3n,
  modulus: bigint,
): bigint {
  // Dangerous: raw RSA without randomized padding.
  return (message ** publicExponent) % modulus
}`,
    secureCode: `async function encryptMessage(
  data: ArrayBuffer,
  publicKey: CryptoKey,
): Promise<ArrayBuffer> {
  return crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    data,
  )
}`,
    vulnerability:
      'Raw RSA is deterministic and provides no semantic security. With a small exponent such as e=3, sufficiently small messages may be recoverable using an integer cube-root attack when the ciphertext is not reduced modulo the RSA modulus.',
    impact:
      'Sensitive plaintext may become recoverable without the private key under vulnerable parameter and message-size conditions.',
    remediation:
      'Never implement raw RSA encryption. Use a standardized randomized padding scheme such as RSA-OAEP through a vetted cryptographic library or platform API.',
    references: [
      'RFC 8017 — PKCS #1 v2.2',
      'NIST SP 800-56B — Recommendation for Pair-Wise Key-Establishment Schemes Using Integer Factorization Cryptography',
    ],
    exploitLabel: 'Test Cube Root Exposure',
    exploitDescription:
      'The verifier identifies raw RSA exponentiation and small-exponent patterns and requires RSA-OAEP or another recognized padding mechanism.',
    hints: [
      'Raw RSA should not be exposed as an application encryption primitive.',
      'The public exponent alone does not provide semantic security.',
      'Use RSA-OAEP rather than direct modular exponentiation.',
    ],
    check: (code) => {
      const normalized = normalizeCode(code)

      const rawRsa =
        /\bmessage\s*\*\*\s*publicExponent\b/.test(normalized) ||
        /\bmessage\s*\*\*\s*3n\b/.test(normalized) ||
        /\bpow\s*\(\s*message\s*,\s*3\b/i.test(normalized)

      if (hasRsaPadding(normalized) && !rawRsa) {
        return {
          passed: true,
          title: 'RSA encryption secured',
          message:
            'The implementation uses RSA-OAEP instead of raw RSA exponentiation.',
        }
      }

      return {
        passed: false,
        title: 'Raw RSA encryption detected',
        message:
          'The implementation still exposes direct RSA exponentiation or does not demonstrate randomized RSA padding.',
      }
    },
  },

  {
    id: 'insecure-encryption-mode',
    title: 'The Missing Authentication Check',
    shortTitle: 'Unauthenticated Encryption',
    description:
      'Encryption is performed without authentication, allowing ciphertext manipulation to go undetected.',
    severity: 'high',
    category: 'Authenticated Encryption',
    vulnerableCode: `async function encryptMessage(
  data: ArrayBuffer,
  key: CryptoKey,
) {
  const iv = crypto.getRandomValues(
    new Uint8Array(16),
  )

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    data,
  )

  return { iv, ciphertext }
}

async function decryptMessage(
  ciphertext: ArrayBuffer,
  iv: Uint8Array,
  key: CryptoKey,
) {
  return crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    ciphertext,
  )
}`,
    secureCode: `async function encryptMessage(
  data: ArrayBuffer,
  key: CryptoKey,
) {
  const iv = crypto.getRandomValues(
    new Uint8Array(12),
  )

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data,
  )

  return { iv, ciphertext }
}

async function decryptMessage(
  ciphertext: ArrayBuffer,
  iv: Uint8Array,
  key: CryptoKey,
) {
  return crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  )
}`,
    vulnerability:
      'Encryption without an authentication mechanism does not guarantee ciphertext integrity. CBC encryption by itself does not authenticate the ciphertext.',
    impact:
      'An attacker may be able to modify ciphertext and cause controlled changes in decrypted data or exploit downstream parsing behavior.',
    remediation:
      'Prefer an authenticated encryption mode such as AES-GCM or ChaCha20-Poly1305. Treat authentication failure as a complete decryption failure.',
    references: [
      'NIST SP 800-38D — Galois/Counter Mode',
      'OWASP Cryptographic Storage Cheat Sheet',
    ],
    exploitLabel: 'Test Ciphertext Tampering',
    exploitDescription:
      'The verifier checks whether the implementation uses an authenticated encryption construction instead of relying solely on AES-CBC.',
    hints: [
      'Encryption and authentication should be provided together.',
      'AES-CBC by itself does not authenticate ciphertext.',
      'AES-GCM provides authenticated encryption.',
    ],
    check: (code) => {
      const normalized = normalizeCode(code)

      if (hasAuthenticatedEncryption(normalized)) {
        return {
          passed: true,
          title: 'Authenticated encryption detected',
          message:
            'The implementation uses an authenticated encryption construction such as AES-GCM.',
        }
      }

      return {
        passed: false,
        title: 'Unauthenticated encryption detected',
        message:
          'The implementation does not demonstrate authenticated encryption.',
      }
    },
  },
]

export const AUDIT_SCENARIO_MAP: Record<
  AuditScenarioId,
  AuditScenario
> = AUDIT_SCENARIOS.reduce(
  (map, scenario) => {
    map[scenario.id] = scenario
    return map
  },
  {} as Record<AuditScenarioId, AuditScenario>,
)

export const DEFAULT_AUDIT_SCENARIO_ID: AuditScenarioId =
  'predictable-key-generator'

export function getAuditScenario(
  id: AuditScenarioId,
): AuditScenario {
  return AUDIT_SCENARIO_MAP[id]
}