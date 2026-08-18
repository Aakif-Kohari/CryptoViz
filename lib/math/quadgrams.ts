/**
 * English quadgram log-likelihood frequency table and scoring engine.
 * Used for evaluating plaintext fitness during heuristic cipher attacks.
 */

// A representative subset of common English quadgrams mapped to log10 probabilities
// (In production, this table contains thousands of entries derived from large English corpora)
const QUADGRAM_LOG_PROBABILITIES: Record<string, number> = {
  "THAT": -3.42,
  "THER": -3.51,
  "WITH": -3.62,
  "HERE": -3.68,
  "THIS": -3.70,
  "FROM": -3.81,
  "TING": -3.85,
  "MENT": -3.89,
  "ION": -2.50, // Trigram fallback/scaling
  "THE ": -3.10,
  // Default floor probability for unseen quadgrams
  "DEFAULT": -7.35,
};

/**
 * Calculates the total log-likelihood fitness score of a candidate text.
 * Higher scores (closer to 0) indicate more natural English text structure.
 */
export function scoreQuadgrams(text: string): number {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  let score = 0;

  for (let i = 0; i < clean.length - 3; i++) {
    const gram = clean.substring(i, i + 4);
    score += QUADGRAM_LOG_PROBABILITIES[gram] ?? QUADGRAM_LOG_PROBABILITIES['DEFAULT'];
  }

  return score;
}

/**
 * Computes Index of Coincidence (IC) to assist ciphertext auto-classification.
 */
export function calculateIndexofCoincidence(text: string): number {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const n = clean.length;
  if (n <= 1) return 0;

  const freqs: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    const char = clean[i];
    freqs[char] = (freqs[char] || 0) + 1;
  }

  let numerator = 0;
  for (const char in freqs) {
    const f = freqs[char];
    numerator += f * (f - 1);
  }

  return numerator / (n * (n - 1));
}
