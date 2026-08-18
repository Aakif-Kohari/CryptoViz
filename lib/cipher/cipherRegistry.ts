import { KalynaEngine } from './kalyna/kalynaEngine';
import { KupynaEngine } from './kupyna/kupynaEngine';
import { BaseCipher } from './baseCipher';

export class CipherRegistry {
  private ciphers: Map<string, any> = new Map();

  constructor() {
    this.register('kalyna', new KalynaEngine());
    this.register('kupyna', new KupynaEngine());
  }

  register(name: string, instance: any): void {
    this.ciphers.set(name, instance);
  }

  get(name: string): any {
    return this.ciphers.get(name);
  }
}

export const globalCipherRegistry = new CipherRegistry();
