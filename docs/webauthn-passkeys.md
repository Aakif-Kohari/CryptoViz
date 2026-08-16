# WebAuthn & Passkeys Playground

This feature adds an interactive playground demonstrating WebAuthn and Passkeys registration/authentication at:

```text
/protocols/webauthn
```

## Concepts Covered

- **Asymmetric Cryptography**: Generation of credential-specific public/private key pairs (ECDSA over Curve P-256 with SHA-256).
- **Phishing Resistance**: Origin binding matching `clientDataJSON.origin` against the relying party identifier (`rpId`).
- **User Verification**: Requiring biometrics or device PINs (User Presence (UP) & User Verification (UV) flags).
- **Binary Protocols**: Decoding CBOR (Concise Binary Object Representation) attestation objects and COSE (CBOR Object Signing and Encryption) public key structures.
- **Registration vs. Authentication (Assertion)**: Creating new credentials (attestation) vs. signing challenges (assertion).

## Core Cryptography

### Key Generation (P-256 EC)
The authenticator generates an Elliptic Curve keypair:
- **Private Key ($d$)**: Kept secure within the authenticator's secure hardware.
- **Public Key ($Q = d \cdot G$)**: Structured as coordinate pair $(X, Y)$ on Curve P-256.

### COSE Public Key Format
In WebAuthn, public keys are represented as CBOR maps using COSE identifiers:
- `kty` (Key Type): `2` (Elliptic Curve)
- `alg` (Algorithm): `-7` (ES256 - ECDSA with SHA-256)
- `crv` (Curve): `1` (P-256)
- `x`: X coordinate coordinate bytes
- `y`: Y coordinate coordinate bytes

### Signature Verification
The Relying Party (Server) verifies the authentication assertion using:
- **Hash**: $H = \text{SHA-256}(\text{authenticatorData} \,\|\, \text{SHA-256}(\text{clientDataJSON}))$
- **ECDSA Verification**: $Verify(Q, H, \text{signature})$

## Manual Verification

1. Open `/protocols/webauthn`.
2. Toggle between **Virtual Simulator** and **Real Device** modes.
3. Perform **Registration**:
   - Provide a username and click **Create Passkey**.
   - Verify the generated public/private keys and the database registry update.
4. Inspect the payload decoding (Client Data JSON, Authenticator Data, COSE public key map).
5. Perform **Authentication**:
   - Select the registered username, click **Authenticate with Passkey**, and verify successful login.
6. Try the **Phishing Resistance Demonstration**:
   - Toggle the simulated origin hostname to `phishy-cryptoviz.com` and attempt login.
   - Confirm origin verification blocks authentication.
