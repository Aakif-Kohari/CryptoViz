import { scoreQuadgrams } from '@/lib/math/quadgrams';

export interface HillClimbResult {
  iteration: number;
  score: number;
  key: string;
  plaintext: string;
}

/**
 * Executes a single hill-climbing optimization pass for monoalphabetic substitution ciphers.
 */
export function runHillClimbStep(ciphertext: string, currentKey: string): HillClimbResult {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  // Helper to decrypt with a given substitution key mapping
  const decrypt = (text: string, key: string): string => {
    return text.toUpperCase().split('').map(char => {
      const idx = key.indexOf(char);
      return idx !== -1 ? alphabet[idx] : char;
    }).join('');
  };

  let bestKey = currentKey;
  let bestPlaintext = decrypt(ciphertext, bestKey);
  let bestScore = scoreQuadgrams(bestPlaintext);

  // Mutate key by swapping two random characters
  for (let i = 0; i < 50; i++) {
    const idx1 = Math.floor(Math.random() * 26);
    let idx2 = Math.floor(Math.random() * 26);
    while (idx1 === idx2) idx2 = Math.floor(Math.random() * 26);

    const keyArr = bestKey.split('');
    const temp = keyArr[idx1];
    keyArr[idx1] = keyArr[idx2];
    keyArr[idx2] = temp;
    const candidateKey = keyArr.join('');

    const candidatePlaintext = decrypt(ciphertext, candidateKey);
    const candidateScore = scoreQuadgrams(candidatePlaintext);

    if (candidateScore > bestScore) {
      bestScore = candidateScore;
      bestKey = candidateKey;
      bestPlaintext = candidatePlaintext;
    }
  }

  return {
    iteration: 1,
    score: bestScore,
    key: bestKey,
    plaintext: bestPlaintext,
  };
}
