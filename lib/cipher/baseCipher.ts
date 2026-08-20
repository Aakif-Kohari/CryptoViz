import { wipeMemory } from '../security/keyMemWipe';

export abstract class BaseCipher {
  protected key: Uint8Array | null = null;

  setKey(keyMaterial: Uint8Array): void {
    if (this.key) {
      wipeMemory(this.key);
    }
    this.key = new Uint8Array(keyMaterial);
  }

  destroy(): void {
    if (this.key) {
      wipeMemory(this.key);
      this.key = null;
    }
  }

  abstract encrypt(plaintext: Uint8Array): Promise<Uint8Array>;
  abstract decrypt(ciphertext: Uint8Array): Promise<Uint8Array>;
}
