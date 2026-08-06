# RC6 API Compatibility

Issue #722 reports that RC6 fails both published vectors and the shared cipher
API contract. This update restores both correctness and compatibility.

## What changed

The RC6 module now exports:

- `encryptRc6Block(plaintextHex, keyHex, options?)`
- `decryptRc6Block(ciphertextHex, keyHex, options?)`
- `traceRc6Encryption(plaintextHex, keyHex, options?)`
- `encryptRc6(input, keyHex?, options?)`
- `decryptRc6(input, keyHex?, options?)`
- `rc6(input)`
- `rc6Cipher`
- `RC6`
- default export `rc6Cipher`

## Supported API styles

### Legacy string style

```ts
const ciphertext = encryptRc6("00000000000000000000000000000000", key);
const plaintext = decryptRc6(ciphertext, key);
```

### Shared object style

```ts
const encrypted = rc6({
  input: "00000000000000000000000000000000",
  key,
  mode: "encrypt",
});

const decrypted = rc6({
  input: encrypted.result,
  key,
  mode: "decrypt",
});
```

### Registry metadata style

```ts
import rc6Cipher from "@/lib/cipher/symmetric/rc6";

rc6Cipher.name;
rc6Cipher.blockSizeBits;
rc6Cipher.keySizeBits;
rc6Cipher.encrypt({ input, key, mode: "encrypt" });
```

## Published vector

```text
Variant:    RC6-32/20/16
Key:        00000000000000000000000000000000
Plaintext:  00000000000000000000000000000000
Ciphertext: 8FC3A53656B1F778C129DF4E9848A41E
```

## Manual testing

1. Run the focused RC6 API compatibility tests.
2. Confirm the published RC6-32/20/16 vector passes.
3. Confirm legacy string-style `encryptRc6` and `decryptRc6` work.
4. Confirm object-style `rc6({ input, key, mode })` works.
5. Confirm default export and `RC6` alias expose metadata and encrypt/decrypt methods.
6. Confirm non-zero plaintext/key values round trip.
7. Confirm invalid block/key inputs throw friendly errors.
