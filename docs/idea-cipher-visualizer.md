# IDEA Cipher Visualizer

IDEA, the International Data Encryption Algorithm, is a historical 64-bit block cipher that uses a 128-bit key. It combines multiplication modulo 65537, addition modulo 65536, and XOR.

## What the visualizer shows

- 64-bit plaintext block input
- 128-bit key input
- 52 generated 16-bit subkeys
- eight full IDEA rounds
- six subkeys used per full round
- modular multiplication, modular addition, and XOR mixing
- final output transformation using the last four subkeys
- final ciphertext block

## Educational note

This page is for understanding the structure of IDEA. It is not intended as a modern production encryption recommendation. For new applications, prefer modern authenticated encryption schemes such as AES-GCM or ChaCha20-Poly1305.

## Manual testing

1. Open `/visualizer/idea`.
2. Confirm the default plaintext and key generate 52 subkeys.
3. Confirm eight rounds and the final output transform are displayed.
4. Click different rounds and confirm details update.
5. Change plaintext and confirm ciphertext changes.
6. Change key and confirm subkeys and ciphertext change.
7. Enter invalid hex and confirm validation appears.
8. Resize to mobile width and confirm the page remains usable.
