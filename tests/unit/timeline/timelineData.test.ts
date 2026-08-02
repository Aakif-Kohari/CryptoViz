import { describe, it, expect } from 'vitest';
import {
  timelineEntries,
  getSortedEntries,
  timelineCategories,
} from '../../../lib/timeline/timelineData';

describe('Timeline Data', () => {
  it('should have at least 15 entries spanning from ancient to post-quantum', () => {
    expect(timelineEntries.length).toBeGreaterThanOrEqual(15);
  });

  it('should include entries from all four categories', () => {
    const categories = new Set(timelineEntries.map((e) => e.category));
    expect(categories.has('classical')).toBe(true);
    expect(categories.has('world-war')).toBe(true);
    expect(categories.has('modern')).toBe(true);
    expect(categories.has('post-quantum')).toBe(true);
  });

  it('should have unique IDs for every entry', () => {
    const ids = timelineEntries.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have sortYear present on every entry for ordering', () => {
    for (const entry of timelineEntries) {
      expect(typeof entry.sortYear).toBe('number');
    }
  });

  it('should sort entries by sortYear ascending when calling getSortedEntries()', () => {
    const sorted = getSortedEntries();
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].sortYear).toBeGreaterThanOrEqual(sorted[i - 1].sortYear);
    }
  });

  it('should have all entries with required string fields', () => {
    for (const entry of timelineEntries) {
      expect(entry.id).toBeTruthy();
      expect(entry.year).toBeTruthy();
      expect(entry.title).toBeTruthy();
      expect(entry.summary).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(entry.colour).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(Array.isArray(entry.tags)).toBe(true);
      expect(entry.tags.length).toBeGreaterThan(0);
    }
  });

  it('should have valid category values for all entries', () => {
    const validCategories = new Set(timelineCategories);
    for (const entry of timelineEntries) {
      expect(validCategories.has(entry.category)).toBe(true);
    }
  });

  it('should include the Caesar Cipher entry', () => {
    const caesar = timelineEntries.find((e) => e.title.includes('Caesar'));
    expect(caesar).toBeDefined();
    expect(caesar!.tags).toContain('shift-cipher');
  });

  it('should include a Post-Quantum entry', () => {
    const pq = timelineEntries.find((e) => e.category === 'post-quantum');
    expect(pq).toBeDefined();
    expect(pq!.tags).toContain('pqc');
  });

  it('should have entries with relatedCiphers that link to existing visualizer routes', () => {
    for (const entry of timelineEntries) {
      if (entry.relatedCiphers) {
        for (const cipher of entry.relatedCiphers) {
          expect(typeof cipher).toBe('string');
          expect(cipher.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

