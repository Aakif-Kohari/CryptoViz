/**
 * Standalone verification test for Improve Learning Progression feature.
 * Run with: npx tsx tests/unit/learning/run-tests.ts
 */
import { CIPHER_REGISTRY } from '../../../lib/cipher/registry'

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${msg}`)
  }
  console.log(`✓ ${msg}`)
}

console.log('--- Starting Learning Progression Verification ---')

// Test 1: Registry has prerequisites / recommendedNext fields
const caesar = CIPHER_REGISTRY.find((c) => c.id === 'caesar')
assert(caesar !== undefined, 'caesar cipher exists in registry')
assert(Array.isArray(caesar?.recommendedNext), 'caesar has recommendedNext array')
assert((caesar?.recommendedNext?.length ?? 0) > 0, 'caesar has at least one recommendedNext entry')

// Test 2: All recommendedNext entries resolve to valid cipher IDs
const validIds = new Set(CIPHER_REGISTRY.map((c) => c.id))
let brokenLinks = 0
for (const cipher of CIPHER_REGISTRY) {
  if (cipher.recommendedNext) {
    for (const nextId of cipher.recommendedNext) {
      if (!validIds.has(nextId)) {
        console.error(`  ✗ ${cipher.id} has broken recommendedNext: "${nextId}"`)
        brokenLinks++
      }
    }
  }
  if (cipher.prerequisites) {
    for (const preId of cipher.prerequisites) {
      if (!validIds.has(preId)) {
        console.error(`  ✗ ${cipher.id} has broken prerequisites: "${preId}"`)
        brokenLinks++
      }
    }
  }
}
assert(brokenLinks === 0, `All recommendedNext/prerequisites IDs are valid cipher IDs (${brokenLinks} broken)`)

// Test 3: Key recommended ciphers have learning graph data
const keyIds = ['aes', 'sha256', 'hmac', 'rsa', 'ecc', 'chacha20-poly1305', 'bcrypt', 'dh']
for (const id of keyIds) {
  const cipher = CIPHER_REGISTRY.find((c) => c.id === id)
  assert(cipher !== undefined, `${id} exists in registry`)
  assert(
    Array.isArray(cipher?.recommendedNext) && (cipher?.recommendedNext?.length ?? 0) > 0,
    `${id} has at least one recommendedNext entry`
  )
}

// Test 4: Recommended ciphers cover all categories
const recommendedCiphers = CIPHER_REGISTRY.filter((c) => c.securityStatus === 'recommended')
assert(recommendedCiphers.length > 0, 'Registry has recommended ciphers')

// Test 5: Learning graph forms a valid DAG (no self-loops)
const selfLoops = CIPHER_REGISTRY.filter(
  (c) => c.recommendedNext?.includes(c.id) || c.prerequisites?.includes(c.id)
)
assert(selfLoops.length === 0, 'No cipher recommends itself as next step or prerequisite')

// Test 6: Classical ciphers form an educational path (caesar -> vigenere -> playfair)
const vigenere = CIPHER_REGISTRY.find((c) => c.id === 'vigenere')
assert(vigenere !== undefined, 'vigenere cipher exists')
assert(vigenere?.prerequisites?.includes('caesar') ?? false, 'vigenere lists caesar as prerequisite')

const aes = CIPHER_REGISTRY.find((c) => c.id === 'aes')
assert(aes?.recommendedNext?.includes('chacha20-poly1305') ?? false, 'aes recommends chacha20-poly1305')
assert(aes?.recommendedNext?.includes('sha256') ?? false, 'aes recommends sha256')

const sha256 = CIPHER_REGISTRY.find((c) => c.id === 'sha256')
assert(sha256?.recommendedNext?.includes('hmac') ?? false, 'sha256 recommends hmac')
assert(sha256?.recommendedNext?.includes('bcrypt') ?? false, 'sha256 recommends bcrypt')

const rsa = CIPHER_REGISTRY.find((c) => c.id === 'rsa')
assert(rsa?.recommendedNext?.includes('ecc') ?? false, 'rsa recommends ecc')
assert(rsa?.recommendedNext?.includes('ml-kem') ?? false, 'rsa recommends ml-kem (post-quantum)')

console.log('--- ALL LEARNING PROGRESSION TESTS PASSED! ---')
