# SLH-DSA / SPHINCS+ Visualizer

Issue #775 adds an educational visualizer for stateless post-quantum
hash-based signatures.

## Route

```text
/visualizer/slh-dsa
```

## What the page shows

- stateless hash-based signature overview
- SLH-DSA / SPHINCS+ parameter-set selector
- message digest derivation
- FORS selected leaf indexes
- FORS secret reveal cards
- compact authentication paths
- WOTS+ verification concept
- hypertree path from FORS public key to public root
- verification steps
- signature-size estimates
- references to NIST FIPS 205 and SPHINCS+

## Educational scope

The implementation intentionally uses toy hash functions and compact displayed
trees so learners can inspect the moving parts. It does **not** implement a
production SLH-DSA signer or verifier.

## Concepts

### Stateless signatures

SLH-DSA is a stateless hash-based digital signature algorithm. The signer does
not need to track per-signature private key state, unlike stateful hash-based
signature schemes.

### FORS

FORS signs a digest by revealing selected leaves from many small trees. The
verifier uses those leaves and authentication paths to reconstruct a FORS public
key.

### WOTS+

WOTS+ is a one-time signature layer. In SLH-DSA, WOTS+ authenticates roots as
the verifier climbs through the hypertree.

### Hypertree

The hypertree stacks many Merkle-tree layers. Verification succeeds when the
computed top root matches the public key root.

## Standards reference

NIST FIPS 205 specifies SLH-DSA, the Stateless Hash-Based Digital Signature
Standard. SLH-DSA is based on SPHINCS+.

## Manual testing

1. Open `/visualizer/slh-dsa`.
2. Change the message and confirm the FORS indexes, hypertree, and root update.
3. Switch between parameter sets and confirm signature-size estimates change.
4. Confirm FORS reveal cards show selected leaves and authentication paths.
5. Confirm hypertree layers show how verification climbs toward the root.
6. Confirm standards references mention NIST FIPS 205 and SPHINCS+.
7. Resize on desktop, tablet, and mobile widths.
8. Run the focused SLH-DSA visualizer unit tests.
