# Cipher Collections

The **Cipher Collections** page acts as a curated catalog mapping the relationship between families of cryptographic algorithms. Users can explore how algorithms within a specific family differ in terms of their security guarantees, structure, category, and historical context.

## Active Collections

Currently, four curated showcases are active:

1. **AES Family**
   - **Ciphers**: AES (ECB/CBC/CFB/OFB), AES-CCM, AES-XTS.
   - **Key Highlights**: Focuses on symmetric block encryption, showing the difference between authenticated encryption modes and disk-sector modes.

2. **SHA Family**
   - **Ciphers**: SHA-256, SHA-512, SHA-224, SHA-384, SHAKE-128, SHAKE-256.
   - **Key Highlights**: Focuses on cryptographic hash algorithms, highlighting output size variations and extendable-output functions (SHAKEs).

3. **Classical Substitution**
   - **Ciphers**: Caesar, ROT13, Vigenère, Atbash, Playfair.
   - **Key Highlights**: Shift-based and polyalphabetic Substitution mechanisms. Primarily intended for education and analysis of historic vulnerabilities.

4. **Asymmetric & Key Exchange**
   - **Ciphers**: RSA-2048, DSA, Diffie-Hellman, ECC (ECDSA P-256), ECIES.
   - **Key Highlights**: Public-key paradigms showing asymmetric encryption, key exchange, and elliptic curves.

## Design Integration

Integrated into the CryptoViz design system using:
- CSS variables from `design-tokens.css` for consistent backgrounds, colors, and shadows.
- Badge components (`SecurityBadge`) to immediately surface the deprecation/security status of each algorithm.
- Accessible tab panels mapping collections using standard semantic elements and keyboard accessible inputs.
