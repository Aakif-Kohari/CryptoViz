export function wipeMemory(buffer: Uint8Array): void {
  if (!buffer) return;
  // First pass: cryptographically secure random bytes
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buffer);
  }
  // Second pass: zero-fill
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = 0;
  }
}
