# Registry-backed cipher worker

## Why

`lib/workers/cipher.worker.ts` previously contained both a large dispatcher
switch and a second cipher switch in the message handler. That meant adding a
cipher required editing the worker in multiple places.

Issue #884 moves dispatch ownership into `lib/workers/cipherDispatchRegistry.ts`.

## Architecture

```text
CIPHER_REGISTRY
      │
      ▼
cipherDispatchRegistry
      │
      ├── import.meta.glob(...)
      │
      ├── lazy module loader
      │
      └── special adapters
             │
             ▼
      { encrypt, decrypt }
             │
             ▼
       cipher.worker.ts
```

`CIPHER_REGISTRY` remains the source of truth for cipher IDs and categories.

The worker only:

1. decodes a request;
2. obtains a dispatcher from the registry;
3. selects encrypt/decrypt from the request type;
4. awaits the result;
5. posts a success/error response.

## Adding a conventional cipher

For a conventional cipher whose module is located at:

```text
lib/cipher/<category>/<id>.ts
```

and exports:

```ts
export function encrypt(...)
export function decrypt(...)
```

add the cipher definition to `CIPHER_REGISTRY`.

The worker does not need to change.

## Special modules

A small adapter is kept for modules whose exported function names differ from
the standard `encrypt`/`decrypt` contract:

- SHA-224 / SHA-384
- SHAKE128 / SHAKE256

These are mapping concerns, not worker concerns.

## Verification

Run:

```bash
node scripts/validate-cipher-dispatch.mjs
npx vitest run tests/unit/workers/cipherDispatchRegistry.test.ts
npm run lint
npm run typecheck
npm test
npm run build
```

The worker architecture check requires `cipher.worker.ts` to remain under
100 lines and rejects a cipher-specific `switch (cipherId)`.

## Extension rule

Do not add cipher-specific cases to `cipher.worker.ts`.

If a new cipher follows the normal module contract, add only its registry
definition and module.

If a module has an unusual export contract, add a small adapter in
`cipherDispatchRegistry.ts`.
