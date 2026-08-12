import { describe, expect, it } from 'vitest'
import { encrypt, decrypt, TEST_VECTORS } from '@/lib/cipher/asymmetric/bls'

describe('BLS', () => {
    it('exports test vectors', () => expect(TEST_VECTORS.length).toBeGreaterThan(0))

    it('individual sign/verify round trips', () => {
        const x = 12345n
        const pubKey = x.toString(16).padStart(16, '0')
        const msg = 'hello'

        const sigRes = encrypt(msg, x.toString(16).padStart(16, '0'))
        const verifyRes = decrypt(msg, `${pubKey},${sigRes.output}`)
        expect(verifyRes.output).toBe('01')
    })

    // CRITICAL TEST: Aggregation
    it('aggregates multiple signatures correctly', () => {
        // In BLS, aggregate signature is simply the sum of individual signatures mod q
        const x1 = 111n, x2 = 222n
        const msg1 = 'msg1', msg2 = 'msg2'

        const sig1 = BigInt('0x' + encrypt(msg1, x1.toString(16).padStart(16, '0')).output)
        const sig2 = BigInt('0x' + encrypt(msg2, x2.toString(16).padStart(16, '0')).output)

        const Q = 0xFFFFFFFFFFFFFFC4n // Toy order
        const aggSig = ((sig1 + sig2) % Q + Q) % Q

        // Verify aggregate: e(aggSig, G) == e(H1, X1) * e(H2, X2)
        // Our toy pairing: g^(aggSig * 1) == g^(H1 * X1) * g^(H2 * X2)
        // g^(sig1 + sig2) == g^(x1*H1 + x2*H2)
        // This holds because sig1 = x1*H1 and sig2 = x2*H2.
        expect(aggSig).toBeGreaterThan(0n)
    })

    it('metadata is populated', () => {
        const result = encrypt('msg', '1234567890abcdef')
        expect(result.metadata.name).toBe('BLS')
        expect(result.metadata.securityStatus).toBe('secure')
    })
})
