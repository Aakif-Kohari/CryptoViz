import type { CipherName } from '../cipher/types';

export type ChallengeType = 'encrypt' | 'decrypt';

export interface ChallengeData {
  cipherId: CipherName;
  type: ChallengeType;
  plaintext: string;
  key: string;
}

const WORDS = [
  'CRYPTOGRAPHY', 'SECURITY', 'ALGORITHM', 'ENCRYPTION', 'DECRYPTION',
  'NETWORK', 'INTERNET', 'PRIVACY', 'AUTHENTICATION', 'SIGNATURE',
  'MESSAGE', 'CIPHERTEXT', 'PLAINTEXT', 'SECRECY', 'COMMUNICATION'
];

function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function generateChallengeData(): ChallengeData {
  const allowedCiphers: CipherName[] = ['caesar', 'vigenere'];
  const cipherId = allowedCiphers[Math.floor(Math.random() * allowedCiphers.length)];
  
  const plaintext = getRandomWord();
  let key = '';

  if (cipherId === 'caesar') {
    // Random shift 1-25
    key = Math.floor(Math.random() * 25 + 1).toString();
  } else if (cipherId === 'vigenere') {
    key = getRandomWord();
  } else {
    // Fallback for safety
    key = '3';
  }

  return {
    cipherId,
    type: 'encrypt',
    plaintext,
    key
  };
}
