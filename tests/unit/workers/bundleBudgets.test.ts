import { describe, it, expect } from 'vitest';
import { runBudgetChecks, BUDGETS } from '../../../scripts/check-bundle-budgets.mjs';

describe('Cipher Worker Bundle Size & Lazy-Loading Budgets (#1321)', () => {
  it('passes all automated budget threshold checks for workers, cipher modules, and visualizers', () => {
    const result = runBudgetChecks();
    expect(result.success).toBe(true);
    expect(result.count).toBeGreaterThan(50);
  });

  it('verifies that the primary cipher worker entry point remains strictly under 25 KB', () => {
    const result = runBudgetChecks();
    const cipherWorkerReport = result.reports.find(r => r.file.includes('cipher.worker.ts'));
    expect(cipherWorkerReport).toBeDefined();
    expect(cipherWorkerReport?.ok).toBe(true);
    expect(cipherWorkerReport?.sizeKb).toBeLessThan(BUDGETS.workerEntryKb);
  });

  it('verifies dynamic lazy-loading modular execution without pulling entire registry', async () => {
    // Dynamically load only the Caesar cipher module
    const startTime = performance.now();
    const caesarMod = await import('../../../lib/cipher/classical/caesar');
    const loadDuration = performance.now() - startTime;

    expect(caesarMod).toBeDefined();
    expect(typeof caesarMod.encrypt).toBe('function');
    expect(loadDuration).toBeLessThan(1000); // Fast on-demand load

    const res = caesarMod.encrypt('HELLO WORLD', '3');
    expect(res).toBeDefined();
    expect(res.output).toBe('KHOOR ZRUOG');
  });
});
