# RSA Attack Playground

The RSA Attack Playground demonstrates four classic failures caused by weak RSA
parameters. It uses tiny teaching-size numbers only.

## Route

```text
/attacks/rsa
```

## Included attacks

### Fermat factorization

Fermat factorization recovers `p` and `q` when RSA primes are too close together.

```text
n = p·q
a = ceil(sqrt(n))
b² = a² − n
p = a − b
q = a + b
```

Mitigation: generate primes with approved libraries and sufficient separation.

### Wiener's attack

Wiener's attack recovers a dangerously small private exponent from the continued
fraction convergents of `e/n`.

Mitigation: do not choose unusually small private exponents; use safe RSA key
generation practices.

### Common modulus attack

If the same modulus `n` is reused with coprime public exponents, the same
plaintext can be recovered using Bézout coefficients.

```text
a·e1 + b·e2 = 1
m = c1^a · c2^b mod n
```

Mitigation: never reuse RSA moduli across users or keys.

### Håstad broadcast attack

If the same unpadded message is sent to enough recipients with small exponent
`e`, CRT reconstructs `m^e`, then an exact integer root recovers `m`.

Mitigation: use randomized padding such as RSA-OAEP and do not encrypt raw
messages directly.

## Manual testing

1. Open `/attacks/rsa`.
2. Confirm all four tabs render.
3. Confirm Fermat recovers `p` and `q`.
4. Confirm Wiener recovers the small private exponent for the preset.
5. Confirm common modulus recovers `m`.
6. Confirm Håstad recovers `m`.
7. Enter invalid inputs and confirm friendly errors appear.
8. Resize to mobile width and confirm the page remains usable.
