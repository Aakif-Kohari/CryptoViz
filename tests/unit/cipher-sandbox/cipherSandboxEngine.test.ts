import { describe, expect, it } from 'vitest'
import {
  executeCipherPipeline,
  validatePipelineInvertibility,
  calculateAvalancheEffect,
  calculateFrequencyAnalysis,
  transformStage,
  modInverse,
  CipherPipelineStage,
} from '../../../lib/cipher/sandbox/cipherSandboxEngine'
import { CIPHER_PRESETS } from '../../../lib/cipher/sandbox/presets'

describe('Cipher Sandbox Engine Unit Tests', () => {
  describe('Substitution Stage Transformations', () => {
    it('performs Caesar shift encryption and decryption correctly', () => {
      const stage: CipherPipelineStage = {
        id: '1',
        name: 'Caesar',
        category: 'substitution',
        subType: 'caesar',
        shift: 3,
        enabled: true,
      }

      const enc = transformStage('HELLO', stage, 'encrypt')
      expect(enc.output).toBe('KHOOR')

      const dec = transformStage('KHOOR', stage, 'decrypt')
      expect(dec.output).toBe('HELLO')
    })

    it('performs Affine transformation and inverse correctly', () => {
      const stage: CipherPipelineStage = {
        id: '2',
        name: 'Affine',
        category: 'substitution',
        subType: 'affine',
        a: 5,
        b: 8,
        enabled: true,
      }

      const enc = transformStage('AFFINE', stage, 'encrypt')
      const dec = transformStage(enc.output, stage, 'decrypt')
      expect(dec.output).toBe('AFFINE')
    })

    it('performs XOR transformation correctly', () => {
      const stage: CipherPipelineStage = {
        id: '3',
        name: 'XOR',
        category: 'substitution',
        subType: 'xor',
        key: 'KEY',
        enabled: true,
      }

      const enc = transformStage('SECRET', stage, 'encrypt')
      const dec = transformStage(enc.output, stage, 'decrypt')
      expect(dec.output).toBe('SECRET')
    })

    it('performs Custom S-Box transformation correctly', () => {
      const stage: CipherPipelineStage = {
        id: '4',
        name: 'SBox',
        category: 'substitution',
        subType: 'sbox',
        mapping: { A: 'X', B: 'Y', C: 'Z' },
        enabled: true,
      }

      const enc = transformStage('ABC', stage, 'encrypt')
      expect(enc.output).toBe('XYZ')

      const dec = transformStage('XYZ', stage, 'decrypt')
      expect(dec.output).toBe('ABC')
    })
  })

  describe('Permutation Stage Transformations', () => {
    it('performs P-Box permutation and inverse correctly', () => {
      const stage: CipherPipelineStage = {
        id: '5',
        name: 'PBox',
        category: 'permutation',
        subType: 'pbox',
        blockSize: 4,
        permutation: [2, 0, 3, 1],
        enabled: true,
      }

      const enc = transformStage('CODE', stage, 'encrypt')
      expect(enc.output).toBe('DCEO')

      const dec = transformStage(enc.output, stage, 'decrypt')
      expect(dec.output).toBe('CODE')
    })

    it('performs Columnar Transposition encryption and decryption', () => {
      const stage: CipherPipelineStage = {
        id: '6',
        name: 'Columnar',
        category: 'permutation',
        subType: 'columnar',
        columns: 3,
        keyOrder: [2, 0, 1],
        enabled: true,
      }

      const enc = transformStage('CRYPTOGRAPHY', stage, 'encrypt')
      expect(enc.output).toBe('YOAYCPGPRTRH')

      const dec = transformStage(enc.output, stage, 'decrypt')
      expect(dec.output).toBe('CRYPTOGRAPHY')
    })

    it('performs Block Swap correctly', () => {
      const stage: CipherPipelineStage = {
        id: '7',
        name: 'BlockSwap',
        category: 'permutation',
        subType: 'block_swap',
        blockSize: 2,
        enabled: true,
      }

      const enc = transformStage('ABCD', stage, 'encrypt')
      expect(enc.output).toBe('CDAB')

      const dec = transformStage('CDAB', stage, 'decrypt')
      expect(dec.output).toBe('ABCD')
    })

    it('performs Cyclic Shift correctly', () => {
      const stage: CipherPipelineStage = {
        id: '8',
        name: 'CyclicShift',
        category: 'permutation',
        subType: 'cyclic_shift',
        shift: 2,
        enabled: true,
      }

      const enc = transformStage('HELLO', stage, 'encrypt')
      expect(enc.output).toBe('LOHEL')

      const dec = transformStage('LOHEL', stage, 'decrypt')
      expect(dec.output).toBe('HELLO')
    })

    it('performs Reverse State correctly', () => {
      const stage: CipherPipelineStage = {
        id: '9',
        name: 'Reverse',
        category: 'permutation',
        subType: 'reverse',
        enabled: true,
      }

      const enc = transformStage('CIPHER', stage, 'encrypt')
      expect(enc.output).toBe('REHPIC')

      const dec = transformStage('REHPIC', stage, 'decrypt')
      expect(dec.output).toBe('CIPHER')
    })
  })

  describe('Multi-Round Pipeline Invertibility', () => {
    it('encrypts and decrypts 2-round SPN preset with perfect round-trip fidelity', () => {
      const preset = CIPHER_PRESETS.find((p) => p.id === 'spn_2round')!
      const input = 'CRYPTOGRAPHY'

      const encRes = executeCipherPipeline(input, preset.stages, 'encrypt', preset.rounds)
      const decRes = executeCipherPipeline(encRes.output, preset.stages, 'decrypt', preset.rounds)

      expect(decRes.output).toBe(input)
      expect(encRes.steps.length).toBeGreaterThan(0)
    })

    it('encrypts and decrypts 3-round Mini-Feistel preset correctly', () => {
      const preset = CIPHER_PRESETS.find((p) => p.id === 'mini_feistel')!
      const input = 'ATTACKATDAWN'

      const encRes = executeCipherPipeline(input, preset.stages, 'encrypt', preset.rounds)
      const decRes = executeCipherPipeline(encRes.output, preset.stages, 'decrypt', preset.rounds)

      expect(decRes.output).toBe(input)
    })
  })

  describe('Invertibility Validation & Security Metrics', () => {
    it('detects invalid non-coprime Affine multiplier', () => {
      const stages: CipherPipelineStage[] = [
        {
          id: '1',
          name: 'Invalid Affine',
          category: 'substitution',
          subType: 'affine',
          a: 2, // 2 is not coprime to 26
          b: 3,
          enabled: true,
        },
      ]

      const val = validatePipelineInvertibility(stages)
      expect(val.isInvertible).toBe(false)
      expect(val.warnings.length).toBeGreaterThan(0)
    })

    it('throws CipherError in modInverse for all non-coprime multipliers mod 26', () => {
      const nonCoprimes = [0, 2, 4, 6, 8, 10, 12, 13, 14, 16, 18, 20, 22, 24, 26]
      for (const a of nonCoprimes) {
        expect(() => modInverse(a, 26)).toThrow(/no modular inverse/i)
      }
    })

    it('computes correct modInverse for valid coprime multipliers mod 26', () => {
      const coprimes = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]
      for (const a of coprimes) {
        const inv = modInverse(a, 26)
        expect((a * inv) % 26).toBe(1)
      }
    })

    it('surfaces error during Affine decryption when multiplier is not coprime to 26', () => {
      const stage: CipherPipelineStage = {
        id: '2',
        name: 'Invalid Affine',
        category: 'substitution',
        subType: 'affine',
        a: 2,
        b: 5,
        enabled: true,
      }
      expect(() => transformStage('CIPHER', stage, 'decrypt')).toThrow(/no modular inverse/i)
    })

    it('calculates avalanche effect score correctly', () => {
      const preset = CIPHER_PRESETS[0]
      const avalanche = calculateAvalancheEffect('TESTINPUT', preset.stages, 2)

      expect(avalanche.bitFlipPct).toBeGreaterThanOrEqual(0)
      expect(avalanche.totalChars).toBeGreaterThan(0)
    })

    it('calculates symbol frequency analysis', () => {
      const freq = calculateFrequencyAnalysis('AABBBCCCC')
      expect(freq[0].char).toBe('C')
      expect(freq[0].count).toBe(4)
      expect(freq[1].char).toBe('B')
      expect(freq[1].count).toBe(3)
    })
  })
})
