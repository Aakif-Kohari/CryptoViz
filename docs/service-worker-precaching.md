# Service Worker Precaching Architecture

This document describes how Progressive Web App (PWA) Service Worker precaching is generated and managed in CryptoViz.

## Overview

CryptoViz is configured for Next.js static export (`output: 'export'`). To support full offline availability without stale precache lists or missing assets, service worker precaching is built dynamically during the build process.

## Architecture

1. **Build Generator Script**: [`scripts/generate-sw-precache.mjs`](file:///c:/Users/Rushabh%20Mahajan/Documents/GitHub/CryptoViz/scripts/generate-sw-precache.mjs)
   - Recursively scans the `app/` directory for all active route segments (`page.tsx` and `page.js`).
   - Automatically maps dynamic parameter routes (e.g. `[cipher]`) to representative visualizer preset routes (e.g. `/visualizer/caesar/`, `/visualizer/aes/`, `/visualizer/rsa/`, etc.).
   - Combines root assets (`/icon.svg`, `/theme-init.js`, `/globals.css`).
   - Generates [`public/sw.js`](file:///c:/Users/Rushabh%20Mahajan/Documents/GitHub/CryptoViz/public/sw.js) with cache versioning and `PRECACHE_URLS`.
   - Generates [`lib/offline/precacheRoutes.ts`](file:///c:/Users/Rushabh%20Mahajan/Documents/GitHub/CryptoViz/lib/offline/precacheRoutes.ts) to keep client-side cache managers (`swRegister.ts`) synchronized.

2. **Npm Scripts & Build Hooks**:
   - `npm run generate:sw`: Executes `scripts/generate-sw-precache.mjs`.
   - `npm run prebuild`: Automatically triggers `generate:sw` before `npm run build`.

## Manual Update & Custom Overrides

If you add new static assets or custom dynamic routes that should be precached:
1. Edit `DEFAULT_STATIC_ASSETS` or `CIPHER_SUBSTITUTES` inside [`scripts/generate-sw-precache.mjs`](file:///c:/Users/Rushabh%20Mahajan/Documents/GitHub/CryptoViz/scripts/generate-sw-precache.mjs).
2. Run `npm run generate:sw` to regenerate `public/sw.js` and `lib/offline/precacheRoutes.ts`.
