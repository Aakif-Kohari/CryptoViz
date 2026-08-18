# CryptoViz #1109 — Interactive Oracle Query Inspector & Attack Stepper

Implements the issue's interactive teaching model for Padding Oracle, Meet-in-the-Middle,
and SHA-256 Length Extension simulators.

## Features

- Shared Play / Pause / Step Next / Step Previous / Reset control bar.
- Indexed state playback: stepping never reruns the attack.
- Padding Oracle query inspector with valid/invalid oracle responses.
- Padding Oracle byte memory cards: Unknown / Testing / Recovered.
- Padding Oracle algebra callouts for intermediate/plaintext recovery.
- Custom Padding Oracle key, IV and ciphertext.
- Custom MitM plaintext and both target DES keys.
- Custom Length Extension demo secret, message, appended data and secret-length guess.
- Shared query/trace log viewer.
- Unit tests for forward/backward indexed stepping.

The underlying attack modules remain the source of truth for cryptographic execution; the
new UI stores their returned trace and makes that trace navigable.
