# Build Your Own Cipher Sandbox

Educational sandbox for substitution and permutation experiments in CryptoViz. Users can visually construct, test, and analyze custom multi-stage block ciphers combining substitution (confusion) and permutation (diffusion) layers.

## Key Features

- **Custom Pipeline Builder**: Add, reorder, delete, and configure substitution and permutation stages.
- **Substitution Layers (Confusion)**:
  - **Caesar Shift**: Shift characters by variable key amounts.
  - **Custom S-Box**: Direct character/nibble mapping dictionary.
  - **Affine Transform**: Mathematical $(a \cdot x + b) \pmod{26}$ transformation.
  - **XOR Layer**: Bitwise XOR with a secret key string.
- **Permutation Layers (Diffusion)**:
  - **P-Box Permutation**: Position rearrangement array across fixed block sizes.
  - **Columnar Transposition**: Grid-based column read order permutation.
  - **Block Swap**: Feistel-style half-block swapping.
  - **Cyclic Shift**: Circular rotation of state characters.
  - **Reverse State**: Reversing state characters globally or in fixed block lengths.
- **Multi-Round Execution Engine**: Repeat custom pipelines across 1 to 10 round iterations.
- **Step-by-Step State Trace Visualizer**: Live state snapshots and diff highlighting for every stage execution.
- **Security & Cryptanalysis Metrics**:
  - **Invertibility Verification**: Detects non-coprime Affine multipliers or non-bijective S-Boxes/permutations.
  - **Avalanche Effect Calculation**: Measures bit/character flip percentage resulting from 1-bit input perturbation.
  - **Symbol Frequency Histogram**: Analyzes ciphertext character distribution.
- **Presets & Import/Export**: Pre-built templates (2-Round SPN, 3-Round Feistel, Caesar+Columnar, etc.) and JSON configuration export/import.

## Usage Guide

1. Navigate to `/cipher-sandbox` (available under the **Practice** menu in navigation).
2. Select a pre-configured template from the dropdown (e.g., "2-Round SPN") or click **"+ Add Stage"** to create a custom pipeline.
3. Configure stage parameters (e.g. shift count, XOR key, P-Box order, number of columns).
4. Enter input text in the **Input Text** area and observe real-time output and step-by-step state traces.
5. Toggle between **Encryption** and **Decryption** modes to verify round-trip invertibility.
6. Switch to the **Security Metrics** tab to review Avalanche Effect percentage and symbol frequency analysis.
7. Click **Export / Import** to copy your pipeline JSON to the clipboard or load custom JSON configurations.

## Verification & Manual Testing

1. Open `/cipher-sandbox`.
2. Confirm "2-Round SPN" is selected by default with default input `CRYPTOGRAPHY`.
3. Verify that changing mode to **Decryption** decrypts the ciphertext back to `CRYPTOGRAPHY`.
4. Add a new Caesar Shift stage and verify that the output updates instantly.
5. Set an invalid Affine multiplier (e.g., $a = 2$, which is not coprime to 26) and confirm that an **Invertibility Warning** banner is displayed.
6. Verify responsive layout across mobile and desktop breakpoints.
