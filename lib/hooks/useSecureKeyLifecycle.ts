import { useEffect } from 'react';
import { SecureKeyStore } from '../storage/secureKeyStore';

export function useSecureKeyLifecycle(keyId: string) {
  useEffect(() => {
    return () => {
      // Clean up key on unmount
      SecureKeyStore.delete(keyId);
    };
  }, [keyId]);
}
