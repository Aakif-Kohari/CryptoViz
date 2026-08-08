import { recommendCiphersByUseCase } from '../../../lib/advisor/useCaseRecommendationEngine'

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${msg}`)
  }
  console.log(`✓ ${msg}`)
}

console.log('--- Starting Cipher Recommendation Assistant Verification ---')

// Test 1: Web & API Security
const webRecs = recommendCiphersByUseCase({ goal: 'confidentiality', environment: 'web_server' })
assert(webRecs.length > 0, 'Generates recommendations for Web & API Security')
assert(webRecs.some((r) => r.cipher.id === 'aes'), 'AES is recommended for Web Security')

// Test 2: Password Hashing & Key Auth
const passRecs = recommendCiphersByUseCase({ goal: 'password' })
assert(passRecs.length > 0, 'Generates recommendations for Password Hashing & Key Auth')
assert(passRecs.some((r) => r.cipher.id === 'hmac' || r.cipher.id === 'sha256'), 'HMAC or SHA-256 recommended for Password & Auth hashing')

// Test 3: IoT & Embedded
const iotRecs = recommendCiphersByUseCase({ environment: 'iot_embedded' })
assert(iotRecs.some((r) => r.cipher.id.includes('chacha')), 'ChaCha20 recommended for IoT')

// Test 4: Post-Quantum
const pqRecs = recommendCiphersByUseCase({ goal: 'post_quantum' })
assert(pqRecs.length > 0, 'Generates Post-Quantum recommendations')
assert(pqRecs[0].badgeLabel === 'Quantum-Resistant', 'Quantum-Resistant badge set correctly')

// Test 5: Search Query
const searchRecs = recommendCiphersByUseCase({ searchQuery: 'hmac' })
assert(searchRecs.length > 0 && searchRecs[0].cipher.id === 'hmac', 'Search query finds HMAC algorithm')

// Test 6: Only Recommended Filter
const recsOnly = recommendCiphersByUseCase({ onlyRecommended: true })
assert(
  recsOnly.every((r) => r.cipher.securityStatus === 'recommended' || r.cipher.securityStatus === 'secure'),
  'onlyRecommended filter filters out legacy/broken ciphers'
)

// Test 7: Code Snippets
assert(webRecs[0].sampleCode.javascript.length > 0, 'Provides JavaScript implementation code')
assert(webRecs[0].sampleCode.python.length > 0, 'Provides Python implementation code')

console.log('--- ALL RECOMMENDATION ASSISTANT TESTS PASSED PERFECTLY! ---')
