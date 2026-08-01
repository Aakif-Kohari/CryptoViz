import { describe, it, expect } from 'vitest'
import { encrypt, decrypt } from '@/lib/cipher/asymmetric/shamir-secret-sharing'

describe("Shamir's Secret Sharing", () => {
  const secret = 'deadbeef'

  it('reconstructs the secret with exactly threshold shares', () => {
    const split = encrypt(secret, '5,3')
    const shares = split.output.split('|')
    const combined = decrypt(shares.slice(0, 3).join('|'), '')
    expect(combined.output).toBe(secret)
  })

  it('reconstructs the secret with MORE than threshold shares', () => {
    const split = encrypt(secret, '5,3')
    const shares = split.output.split('|')
    const combined = decrypt(shares.join('|'), '') // all 5
    expect(combined.output).toBe(secret)
  })

  it('reconstructs the secret from any subset of size >= threshold, not just the first N', () => {
    const split = encrypt(secret, '5,3')
    const shares = split.output.split('|')
    const combined = decrypt([shares[1], shares[3], shares[4]].join('|'), '')
    expect(combined.output).toBe(secret)
  })

  it('does NOT reconstruct the secret with fewer than threshold shares (security property, not an error)', () => {
    const split = encrypt(secret, '5,3')
    const shares = split.output.split('|')
    const combined = decrypt(shares.slice(0, 2).join('|'), '')
    expect(combined.output).not.toBe(secret)
  })

  it('rejects an invalid threshold/totalShares combination', () => {
    expect(() => encrypt(secret, '3,5')).toThrow(/threshold/) // threshold > totalShares
  })
})
