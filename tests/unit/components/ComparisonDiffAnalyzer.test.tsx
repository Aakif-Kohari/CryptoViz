
import { describe, expect, it } from 'vitest'
import { analyzeCipherOutputs, shannonEntropy } from '../../../lib/utils/cipherDiff'
describe('comparison diff analysis', () => {
  it('returns zero difference for identical outputs', () => {
    const result = analyzeCipherOutputs('00ff', '00ff', 'hex', 'hex')
    expect(result.hammingDistance).toBe(0)
    expect(result.bitDifferencePercentage).toBe(0)
    expect(result.byteDiffs.every((item) => item.status === 'match')).toBe(true)
  })
  it('returns 100 percent for completely inverted equal-length bytes', () => {
    const result = analyzeCipherOutputs('00ff', 'ff00', 'hex', 'hex')
    expect(result.hammingDistance).toBe(16)
    expect(result.bitDifferencePercentage).toBe(100)
  })
  it('marks unequal output lengths without hiding the delta', () => {
    const result = analyzeCipherOutputs('aabb', 'aabbccdd', 'hex', 'hex')
    expect(result.byteDiffs[2].status).toBe('missing-a')
    expect(result.byteDiffs[3].status).toBe('missing-a')
    expect(result.alignedLength).toBe(4)
  })
  it('computes byte Shannon entropy', () => {
    expect(shannonEntropy([0, 0, 0, 0])).toBe(0)
    expect(shannonEntropy([0, 1, 2, 3])).toBe(2)
  })
  it('supports text outputs', () => {
    const result = analyzeCipherOutputs('A', 'B', 'utf8', 'utf8')
    expect(result.hammingDistance).toBe(2)
    expect(result.bitDifferencePercentage).toBe(25)
  })
})
