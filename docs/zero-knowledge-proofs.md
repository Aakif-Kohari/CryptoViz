# Zero-Knowledge Proof / Sigma-Protocol Playground

This feature adds an educational Schnorr sigma-protocol playground at:

```text
/protocols/zero-knowledge
```

## Concepts covered

- Three-move sigma protocol:
  1. commitment
  2. challenge
  3. response
- Completeness
- Special soundness
- Zero-knowledge simulation
- Cheating prover success probability
- Knowledge extraction
- Fiat-Shamir transform
- Weak Fiat-Shamir context-omission pitfall

## Demo group

The implementation uses small explicit parameters for teaching:

```text
p = 23
q = 11
g = 2
```

These values are not intended for real cryptography. They keep every exponent and
modular equation legible for learners.

## Core equations

### Key generation

```text
y = g^x mod p
```

### Commitment

```text
t = g^r mod p
```

### Response

```text
s = r + c·x mod q
```

### Verification

```text
g^s = t·y^c mod p
```

### Simulator

```text
t = g^s · y^(-c) mod p
```

The simulator chooses `c` and `s` first, then builds an accepting commitment
without knowing the witness `x`.

### Extractor

```text
x = (s1 - s2) / (c1 - c2) mod q
```

Two accepting transcripts with the same commitment and different challenges
reveal the witness.

## Fiat-Shamir

The interactive verifier challenge is replaced by:

```text
c = H(group, y, t, message)
```

The demo also shows why omitting public key and message context from the hash is
dangerous.

## Manual testing

1. Open `/protocols/zero-knowledge`.
2. Run an honest transcript and confirm verification succeeds.
3. Change `x`, `r`, and `c` and confirm formulas update.
4. Confirm two accepting transcripts recover the witness.
5. Confirm simulated transcripts verify without the witness.
6. Confirm cheating success rate is near `1 / challenge space`.
7. Confirm Fiat-Shamir verification passes.
8. Change the message and confirm the signature no longer verifies.
9. Resize to desktop, tablet, and mobile widths.
10. Run the focused sigma protocol unit tests.
