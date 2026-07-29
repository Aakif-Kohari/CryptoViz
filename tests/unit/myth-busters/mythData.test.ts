import { describe, it, expect } from 'vitest';
import { CRYPTO_MYTHS, MYTH_QUIZ_QUESTIONS, getMythById, searchMyths } from '@/lib/myth-busters/mythData';

describe('Cryptography Myth Busters Dataset & Search', () => {
  it('contains curated myth entries', () => {
    expect(CRYPTO_MYTHS.length).toBeGreaterThanOrEqual(6);
    const base64Myth = getMythById('base64-is-encryption');
    expect(base64Myth).toBeDefined();
    expect(base64Myth?.status).toBe('BUSTED');
  });

  it('searches myths by query keyword', () => {
    const results = searchMyths('Base64');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].mythTitle).toContain('Base64');
  });

  it('filters myths by category', () => {
    const results = searchMyths('', 'Encoding vs Encryption');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.every(m => m.category === 'Encoding vs Encryption')).toBe(true);
  });

  it('validates quiz questions structure and correct options', () => {
    expect(MYTH_QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(5);
    MYTH_QUIZ_QUESTIONS.forEach(q => {
      const correctOptions = q.options.filter(o => o.isCorrect);
      expect(correctOptions.length).toBe(1);
    });
  });
});
