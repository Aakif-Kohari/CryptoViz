import {
  executeCipherPipeline,
  validatePipelineInvertibility,
  calculateAvalancheEffect,
  calculateFrequencyAnalysis,
  transformStage,
  CipherPipelineStage,
} from '../../../lib/cipher/sandbox/cipherSandboxEngine'
import { CIPHER_PRESETS } from '../../../lib/cipher/sandbox/presets'

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${msg}`)
  }
  console.log(`✓ ${msg}`)
}

console.log('--- Starting Cipher Sandbox Engine Verification ---')

// 1. Caesar
const stageCaesar: CipherPipelineStage = {
  id: '1',
  name: 'Caesar',
  category: 'substitution',
  subType: 'caesar',
  shift: 3,
  enabled: true,
}
const encC = transformStage('HELLO', stageCaesar, 'encrypt')
assert(encC.output === 'KHOOR', 'Caesar shift encrypt HELLO -> KHOOR')
const decC = transformStage('KHOOR', stageCaesar, 'decrypt')
assert(decC.output === 'HELLO', 'Caesar shift decrypt KHOOR -> HELLO')

// 2. Affine
const stageAffine: CipherPipelineStage = {
  id: '2',
  name: 'Affine',
  category: 'substitution',
  subType: 'affine',
  a: 5,
  b: 8,
  enabled: true,
}
const encA = transformStage('AFFINE', stageAffine, 'encrypt')
const decA = transformStage(encA.output, stageAffine, 'decrypt')
assert(decA.output === 'AFFINE', 'Affine round-trip AFFINE')

// 3. XOR
const stageXor: CipherPipelineStage = {
  id: '3',
  name: 'XOR',
  category: 'substitution',
  subType: 'xor',
  key: 'KEY',
  enabled: true,
}
const encX = transformStage('SECRET', stageXor, 'encrypt')
const decX = transformStage(encX.output, stageXor, 'decrypt')
assert(decX.output === 'SECRET', 'XOR round-trip SECRET')

// 4. SBox
const stageSBox: CipherPipelineStage = {
  id: '4',
  name: 'SBox',
  category: 'substitution',
  subType: 'sbox',
  mapping: { A: 'X', B: 'Y', C: 'Z' },
  enabled: true,
}
const encS = transformStage('ABC', stageSBox, 'encrypt')
assert(encS.output === 'XYZ', 'SBox encrypt ABC -> XYZ')
const decS = transformStage('XYZ', stageSBox, 'decrypt')
assert(decS.output === 'ABC', 'SBox decrypt XYZ -> ABC')

// 5. PBox
const stagePBox: CipherPipelineStage = {
  id: '5',
  name: 'PBox',
  category: 'permutation',
  subType: 'pbox',
  blockSize: 4,
  permutation: [2, 0, 3, 1],
  enabled: true,
}
const encP = transformStage('CODE', stagePBox, 'encrypt')
assert(encP.output === 'DCEO', 'PBox encrypt CODE -> DCEO')
const decP = transformStage(encP.output, stagePBox, 'decrypt')
assert(decP.output === 'CODE', 'PBox decrypt DCEO -> CODE')

// 6. Columnar
const stageCol: CipherPipelineStage = {
  id: '6',
  name: 'Columnar',
  category: 'permutation',
  subType: 'columnar',
  columns: 3,
  keyOrder: [2, 0, 1],
  enabled: true,
}
const encCol = transformStage('CRYPTOGRAPHY', stageCol, 'encrypt')
assert(encCol.output === 'YOAYCPGPRTRH', 'Columnar encrypt CRYPTOGRAPHY -> YOAYCPGPRTRH')
const decCol = transformStage(encCol.output, stageCol, 'decrypt')
assert(decCol.output === 'CRYPTOGRAPHY', 'Columnar decrypt round-trip')

// 7. Block Swap
const stageSwap: CipherPipelineStage = {
  id: '7',
  name: 'BlockSwap',
  category: 'permutation',
  subType: 'block_swap',
  blockSize: 2,
  enabled: true,
}
const encSwap = transformStage('ABCD', stageSwap, 'encrypt')
assert(encSwap.output === 'CDAB', 'BlockSwap ABCD -> CDAB')
const decSwap = transformStage('CDAB', stageSwap, 'decrypt')
assert(decSwap.output === 'ABCD', 'BlockSwap decrypt CDAB -> ABCD')

// 8. Cyclic Shift
const stageCShift: CipherPipelineStage = {
  id: '8',
  name: 'CyclicShift',
  category: 'permutation',
  subType: 'cyclic_shift',
  shift: 2,
  enabled: true,
}
const encCShift = transformStage('HELLO', stageCShift, 'encrypt')
assert(encCShift.output === 'LOHEL', 'Cyclic shift HELLO -> LOHEL')
const decCShift = transformStage('LOHEL', stageCShift, 'decrypt')
assert(decCShift.output === 'HELLO', 'Cyclic shift decrypt LOHEL -> HELLO')

// 9. Presets & Multi-round
const presetSPN = CIPHER_PRESETS.find((p) => p.id === 'spn_2round')!
const inputSPN = 'CRYPTOGRAPHY'
const encSPN = executeCipherPipeline(inputSPN, presetSPN.stages, 'encrypt', presetSPN.rounds)
const decSPN = executeCipherPipeline(encSPN.output, presetSPN.stages, 'decrypt', presetSPN.rounds)
assert(decSPN.output === inputSPN, '2-Round SPN round-trip decryption match')

const presetFeistel = CIPHER_PRESETS.find((p) => p.id === 'mini_feistel')!
const inputFeistel = 'ATTACKATDAWN'
const encF = executeCipherPipeline(inputFeistel, presetFeistel.stages, 'encrypt', presetFeistel.rounds)
const decF = executeCipherPipeline(encF.output, presetFeistel.stages, 'decrypt', presetFeistel.rounds)
assert(decF.output === inputFeistel, '3-Round Mini-Feistel round-trip decryption match')

// 10. Invertibility & Metrics
const invalidStages: CipherPipelineStage[] = [
  { id: '1', name: 'Invalid Affine', category: 'substitution', subType: 'affine', a: 2, b: 3, enabled: true },
]
const val = validatePipelineInvertibility(invalidStages)
assert(val.isInvertible === false, 'Detects non-invertible Affine multiplier (a=2)')

const avalanche = calculateAvalancheEffect('TESTINPUT', presetSPN.stages, 2)
assert(avalanche.totalChars > 0, 'Calculates avalanche effect metrics')

const freq = calculateFrequencyAnalysis('AABBBCCCC')
assert(freq[0].char === 'C' && freq[0].count === 4, 'Calculates frequency analysis histogram')

console.log('--- ALL 14 ENCRYPT/DECRYPT TESTS PASSED PERFECTLY! ---')
