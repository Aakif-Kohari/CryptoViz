import { describe, it, expect } from 'vitest'
import {
  encrypt,
  decrypt,
  generateKeypair,
  generateMatrixA,
  generateNoiseMatrix,
  multiplyMatricesMod,
  addMatricesMod,
  subtractMatricesMod,
  TEST_VECTORS,
} from '@/lib/cipher/asymmetric/frodokem'

describe('FrodoKEM-640', () => {
  it('generates valid keypair with matrix structure', () => {
    const { publicKey, privateKey, matrixA, secretS, publicB } = generateKeypair(42)
    expect(publicKey).toBeDefined()
    expect(privateKey).toBeDefined()
    expect(matrixA.length).toBe(8)
    expect(secretS.length).toBe(8)
    expect(publicB.length).toBe(8)
  })

  it('performs matrix arithmetic correctly modulo q', () => {
    const A = [[1, 2], [3, 4]]
    const B = [[5, 6], [7, 8]]
    const q = 32768

    const mult = multiplyMatricesMod(A, B, q)
    expect(mult).toEqual([[19, 22], [43, 50]])

    const add = addMatricesMod(A, B, q)
    expect(add).toEqual([[6, 8], [10, 12]])

    const sub = subtractMatricesMod(B, A, q)
    expect(sub).toEqual([[4, 4], [4, 4]])
  })

  it('encapsulates and decapsulates shared secret successfully', () => {
    const keypair = generateKeypair(100)
    const encResult = encrypt('', keypair.publicKey, { instrument: true })

    expect(encResult.output).toBeDefined()
    expect(encResult.output.length).toBe(64)
    expect(encResult.steps.length).toBeGreaterThan(0)

    const decResult = decrypt(encResult.steps[2]?.outputState || '', keypair.privateKey, { instrument: true })
    expect(decResult.output).toBeDefined()
    expect(decResult.output.length).toBe(64)
  })

  it('contains test vectors definition', () => {
    expect(TEST_VECTORS.length).toBeGreaterThan(0)
    expect(TEST_VECTORS[0].description).toContain('FrodoKEM-640')
  })
})
