# Linear Cryptanalysis Demo

Linear cryptanalysis studies whether selected plaintext bits, ciphertext bits,
and key-dependent intermediate bits satisfy a linear relation with probability
noticeably different from random chance.

This module uses a tiny 4-bit toy cipher so the concept is easy to inspect.

## What the demo shows

- plaintext bit mask
- ciphertext bit mask
- toy key nibble
- toy S-box table
- plaintext/ciphertext sample pairs
- parity of selected plaintext bits
- parity of selected ciphertext bits
- whether the relation holds
- probability and bias summary

## Interpreting bias

A random relation should hold close to 50% of the time. If a relation holds much
more or much less often, the absolute distance from 50% is the bias.

Strong ciphers are designed to keep useful linear biases low across many rounds.

## Security note

This demo is educational. It uses a toy 4-bit substitution cipher and does not
attack external systems or real cryptographic deployments.

## Manual testing

1. Open `/attacks/linear-cryptanalysis`.
2. Confirm the default masks render sample pairs and a bias summary.
3. Change masks and confirm matches, misses, and bias update.
4. Change the toy key nibble and confirm ciphertext samples update.
5. Change sample count and confirm the table updates.
6. Enter an invalid mask and confirm validation appears.
7. Resize to mobile width and confirm the page remains usable.
