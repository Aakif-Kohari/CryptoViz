# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.
## Static Export Security Headers

CryptoViz is deployed as a fully static Next.js export (`output: 'export'`). Because Next.js middleware does not execute for static exports, middleware-based security headers are not relied upon for production deployments.

Security headers for the deployed application are configured in `vercel.json`. This includes the Content Security Policy and other browser security headers required by the application.

The static deployment configuration should remain the source of truth for response security headers unless the application is migrated to an SSR or edge deployment where middleware can execute.