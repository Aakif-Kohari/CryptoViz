# Interactive Provable Security & Security Games

## Overview

CryptoViz's Security Game Simulator turns formal cryptographic security definitions into interactive experiments.

The learner plays the role of the adversary \(A\), while CryptoViz acts as the challenger \(C\). The learner submits challenge messages, queries the permitted oracles, receives a challenge value, submits a guess or forgery, and observes empirical advantage across repeated rounds.

The simulator is an educational model. It is designed to demonstrate the structure and intuition of game-based security definitions rather than replace formal proofs or production cryptographic libraries.

## Security Games

### IND-CPA

IND-CPA means **Indistinguishability under Chosen-Plaintext Attack**.

The game is:

1. The adversary chooses two equal-length messages \(m_0\) and \(m_1\).
2. The challenger chooses a random bit \(b \in \{0,1\}\).
3. The challenger computes:

\[
c^* = E(k,m_b)
\]

4. The challenger gives \(c^*\) to the adversary.
5. The adversary outputs a guess \(b'\).
6. The adversary wins when:

\[
b'=b
\]

The empirical advantage is displayed as:

\[
Adv(A)=|2Pr[b'=b]-1|
\]

A random adversary has expected advantage close to zero.

### Deterministic Encryption

A deterministic encryption construction produces the same ciphertext for the same plaintext and key.

Suppose:

\[
E(k,m_0)=c_0
\]

and the challenge is:

\[
c^*=E(k,m_b)
\]

The adversary can query the encryption oracle for \(m_0\).

If:

\[
c_0=c^*
\]

the adversary can conclude:

\[
b=0
\]

Otherwise the adversary concludes:

\[
b=1
\]

This gives the adversary a distinguishing strategy with a large advantage.

The simulator demonstrates this behavior for educational models of AES-ECB and textbook RSA.

## Randomized Encryption

Randomized encryption adds fresh randomness to encryption.

For example:

\[
c=E(k,m;r)
\]

where \(r\) is newly selected for each encryption.

Two encryptions of the same message can therefore produce different ciphertexts:

\[
E(k,m;r_1)\neq E(k,m;r_2)
\]

The simulator models this property for AES-CBC with random IVs, AES-GCM, and RSA-OAEP.

This prevents the simple ciphertext-equality attack used against deterministic constructions.

## IND-CCA1

IND-CCA1 gives the adversary access to a decryption oracle before the challenge.

The learner can therefore explore how decryption access changes the attack surface while respecting the game boundary.

The simulator exposes the oracle explicitly so the message flow is visible.

## IND-CCA2

IND-CCA2 extends the attack model by allowing adaptive decryption queries after the challenge has been issued.

The challenge ciphertext itself cannot be submitted to the decryption oracle.

The simulator enforces this restriction. Attempting to submit the exact challenge ciphertext results in an oracle rejection.

This illustrates an important game rule:

> The adversary receives powerful oracle access, but the security definition still specifies exactly which queries are forbidden.

## EUF-CMA

EUF-CMA means **Existential Unforgeability under Chosen-Message Attack**.

Unlike IND-CPA and IND-CCA, EUF-CMA concerns authenticity rather than confidentiality.

The adversary may request valid authentication values for chosen messages. The adversary then attempts to produce a valid authentication value for a new message.

The simulator uses HMAC-SHA-256 as the educational authenticity primitive.

The encryption primitives in the selector are intentionally not presented as EUF-CMA-secure signature schemes.

## Primitive Scenarios

| Primitive | Randomized | IND-CPA lesson |
| --- | --- | --- |
| AES-ECB | No | Determinism enables a direct comparison attack |
| AES-CBC with random IV | Yes | Random IV prevents simple equality tests |
| AES-GCM | Yes | Randomized authenticated encryption |
| Textbook RSA | No | Deterministic RSA is distinguishable |
| RSA-OAEP | Yes | Randomized encoding prevents simple equality tests |
| HMAC-SHA-256 | No | Used for the EUF-CMA authenticity game |

## Advantage Visualization

For \(N\) completed rounds, the simulator calculates:

\[
\widehat{Pr}[b'=b]=\frac{\text{wins}}{N}
\]

and:

\[
\widehat{Adv}(A)=
\left|
2\frac{\text{wins}}{N}-1
\right|
\]

The graph plots this empirical value after every completed round.

The graph is therefore a visualization of experimental behavior, not a mathematical proof of security or insecurity.

## Educational Caveat

The simulator intentionally models the structural properties needed for the lessons.

It should not be interpreted as:

- a production AES implementation;
- a production RSA implementation;
- a replacement for a formal security reduction;
- a statistically significant cryptographic benchmark;
- proof that a primitive is secure solely because a short simulation produced a low advantage.

The purpose is to make the interaction between adversary, challenger, oracle access, challenge values, and advantage concrete.

## User Flow

```text
Choose Security Game
        |
        v
Choose Primitive
        |
        v
Adversary submits challenge messages
        |
        v
Challenger selects secret bit b
        |
        v
Challenger returns challenge c*
        |
        v
Adversary queries permitted oracle
        |
        v
Adversary submits b'
        |
        v
Round result
        |
        v
Empirical advantage graph