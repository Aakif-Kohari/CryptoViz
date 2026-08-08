declare module '@exodus/bytes/base32.js' {
  export function toBase32(bytes: Uint8Array): string
  export function fromBase32(str: string): Uint8Array
}

declare module '@exodus/bytes/base58.js' {
  export function toBase58(bytes: Uint8Array): string
  export function fromBase58(str: string): Uint8Array
}
