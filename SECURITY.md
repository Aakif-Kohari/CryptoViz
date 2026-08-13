# Security Policy

## Supported Versions

CryptoViz is currently an educational visualization tool. Security updates and patches are primarily applied to the current development version.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.0   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Scope of Security Policy

### In Scope
- Vulnerabilities in the web application hosting environment configuration (e.g., security headers, Next.js configuration).
- Vulnerabilities that compromise the user's browser environment (e.g., Cross-Site Scripting (XSS), dependency-based vulnerabilities).
- Leaks of user session state or configuration in the browser.

### Out of Scope
CryptoViz is an **educational tool** designed for visual demonstrations, not a production-grade cryptographic library. The following are explicitly out of scope for security reporting:
- Mathematical correctness of educational cipher implementations (which are simplified for visualization and educational purposes).
- The use of weak keys, short key lengths, or unsafe cryptographic algorithms (e.g., visualizers for classic ciphers like Caesar, Vigenère, or standard RSA with visual/demo key sizes).
- The publicly available RSA demo key pair embedded in the source code (see [RSA Real Mode Demo Key](#rsa-real-mode-demo-key) below).

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue. Doing so risks exposing the vulnerability before a fix can be applied.

Instead, please report vulnerabilities via one of the following channels:
1. **GitHub Private Vulnerability Reporting**: Use the "Report a vulnerability" button on the security tab of the repository.
2. **Email**: Send the details privately to arktandoncs@gmail.com.

### Expected Response Time
We take security seriously and will make every effort to acknowledge your report and coordinate a resolution. You can expect:
- An initial response/acknowledgment within **7 business days**.
- Regular updates on the progress of resolving the reported issue.

## Static Export Security Headers

CryptoViz is deployed as a fully static Next.js export (`output: 'export'`). Because Next.js middleware does not execute for static exports, middleware-based security headers are not relied upon for production deployments.

Security headers for the deployed application are configured in `vercel.json`. This includes the Content Security Policy and other browser security headers required by the application.

The static deployment configuration should remain the source of truth for response security headers unless the application is migrated to an SSR or edge deployment where middleware can execute.
## RSA Real Mode Demo Key

RSA real mode uses a fixed 2048-bit demo key pair embedded in the application source code. The key exists only so the visualizer can demonstrate RSA-OAEP encryption and decryption consistently.

Because the private key is publicly available in the source code, it must not be considered secret or secure for protecting real data. Any ciphertext encrypted with this demo public key can be decrypted by anyone who has access to the corresponding embedded private key.

For production use, applications should generate or securely provision their own RSA key pairs and keep private keys outside the source code and version control.
