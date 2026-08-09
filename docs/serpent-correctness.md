# Correct Serpent Implementation

This update addresses Issue #609 by replacing the Serpent core with a focused,
tested block implementation.

## What was audited

- 128-bit block handling
- 128-bit, 192-bit, and 256-bit key validation
- short-key padding before key expansion
- 33 round subkey generation
- Serpent S-box and inverse S-box usage
- linear transform and inverse linear transform
- encryption/decryption round order
- trace output for visualizer integration

## Regression vector

The focused tests include a zero-key, zero-plaintext regression vector for the
current implementation and round-trip validation for non-zero blocks and all
supported key sizes.

```text
Key:        00000000000000000000000000000000
Plaintext:  00000000000000000000000000000000
Ciphertext: D6D99825472B6EBCBB142E8F71F13C5D
```

## Manual testing

1. Run the focused Serpent tests.
2. Confirm the zero-key regression vector matches.
3. Confirm decrypting the regression ciphertext returns the original plaintext.
4. Confirm non-zero plaintext/key round trips correctly.
5. Confirm 128-bit, 192-bit, and 256-bit keys are accepted.
6. Confirm invalid block and key inputs show validation errors.
7. Run lint/build to confirm integration remains clean.
