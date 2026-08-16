import { wipeMemory } from '../security/keyMemWipe';

export class SecureKeyStore {
  private static store: Map<string, { data: Uint8Array; expiry: number }> = new Map();

  static set(id: string, keyBuffer: Uint8Array, ttlMs: number): void {
    const data = new Uint8Array(keyBuffer);
    this.store.set(id, { data, expiry: Date.now() + ttlMs });
  }

  static get(id: string): Uint8Array | null {
    const entry = this.store.get(id);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.delete(id);
      return null;
    }
    return new Uint8Array(entry.data);
  }

  static delete(id: string): void {
    const entry = this.store.get(id);
    if (entry) {
      wipeMemory(entry.data);
      this.store.delete(id);
    }
  }

  static clear(): void {
    for (const [id, entry] of this.store.entries()) {
      wipeMemory(entry.data);
    }
    this.store.clear();
  }
}
