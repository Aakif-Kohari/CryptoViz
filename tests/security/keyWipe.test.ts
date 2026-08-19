import { wipeMemory } from '../../lib/security/keyMemWipe';
import { SecureKeyStore } from '../../lib/storage/secureKeyStore';

describe('Memory Wiping & Key Lifecycle', () => {
  it('should zero out the buffer when wipeMemory is called', () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);
    wipeMemory(buffer);
    
    // Check if everything is zeroed out
    for (let i = 0; i < buffer.length; i++) {
      expect(buffer[i]).toBe(0);
    }
  });

  it('should securely store and delete keys from SecureKeyStore', () => {
    const keyData = new Uint8Array([10, 20, 30, 40]);
    SecureKeyStore.set('test-key', keyData, 5000); // 5 seconds ttl
    
    const retrieved = SecureKeyStore.get('test-key');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.[0]).toBe(10);
    
    SecureKeyStore.delete('test-key');
    const afterDelete = SecureKeyStore.get('test-key');
    expect(afterDelete).toBeNull();
  });
});
