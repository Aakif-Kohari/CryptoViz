# S-Box Explorer

Substitution boxes (S-boxes) are the source of non-linearity in block ciphers —
without them, encryption would reduce to predictable linear algebra. This
visualizer lets you pick a real S-box, feed it an input, and see exactly which
row/column it hits and what comes out.

## Concepts shown

- **AES S-box** (FIPS 197): a single 16x16 byte-substitution table. The high
  nibble of the input byte selects the row, the low nibble selects the
  column.
- **AES inverse S-box**: the table used during decryption; running a byte
  through the forward box and then the inverse box returns the original byte.
- **DES S-boxes** (FIPS 46-3): eight distinct 4x16 boxes. Each consumes 6
  bits — the outer bits (`b0`, `b5`) select the row, the inner four bits
  (`b1`-`b4`) select the column — and produces a 4-bit nibble.
- Clicking any cell in the grid updates the input field to match, so you can
  explore the table in either direction.

## Default input

```text
0x53
```

Looking this up in the AES S-box should highlight row `5`, column `3`, and
produce `0xed`.

For DES S1, the input `0b011011` should highlight row `1`, column `13`, and
produce `5`.

## Input formats

The input field accepts:

- Hex with a `0x` prefix (`0x53`)
- Bare hex digits when they contain a-f (`ab`)
- Binary with a `0b` prefix (`0b011011`)
- Plain decimal (`83`)

## Manual testing

1. Open `/sbox`.
2. Confirm "AES S-Box" is selected by default with input `0x53`.
3. Confirm the result panel shows output `0xed` and the grid highlights row 5,
   column 3.
4. Switch to "AES Inverse S-Box" and confirm `0xed` maps back to `0x53`.
5. Switch to "DES S-Boxes", pick S1, and enter `0b011011`; confirm row 1,
   column 13, output `5`.
6. Click a different cell directly and confirm the input field updates to
   match.
7. Enter an out-of-range value (e.g. `999` for AES) and confirm a validation
   message appears instead of a crash.
8. Resize to mobile width and confirm the grid remains scrollable and
   readable.
