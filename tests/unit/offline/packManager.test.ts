import { describe, it, expect } from 'vitest';
import { OFFLINE_PACKS, getOfflinePackById } from '@/lib/offline/packData';
import { exportPackAsJson, exportPackAsMarkdown, exportPackAsSingleFileHtml } from '@/lib/offline/packManager';

describe('Offline Pack Manager & Exporters', () => {
  it('contains valid curated offline learning packs', () => {
    expect(OFFLINE_PACKS.length).toBeGreaterThanOrEqual(4);
    const symmetricPack = getOfflinePackById('symmetric-classical');
    expect(symmetricPack).toBeDefined();
    expect(symmetricPack?.title).toContain('Symmetric');
  });

  it('exports valid structured JSON pack payload', () => {
    const pack = OFFLINE_PACKS[0];
    const jsonStr = exportPackAsJson(pack);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.metadata.id).toBe(pack.id);
    expect(parsed.metadata.generator).toContain('CryptoViz');
    expect(parsed.topics).toEqual(pack.topics);
    expect(parsed.referenceCode.caesar).toBeDefined();
  });

  it('exports valid Markdown text bundle', () => {
    const pack = OFFLINE_PACKS[0];
    const md = exportPackAsMarkdown(pack);

    expect(md).toContain(`# ${pack.title}`);
    expect(md).toContain('## Topics Covered');
    expect(md).toContain('## Included Documentation & Formulas');
  });

  it('generates self-contained standalone HTML app with embedded JavaScript', () => {
    const pack = OFFLINE_PACKS[0];
    const html = exportPackAsSingleFileHtml(pack);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain(pack.title);
    expect(html).toContain('Interactive Standalone Offline Cipher Runner');
    expect(html).toContain('function runCipher()');
    expect(html).toContain('crypto.subtle.digest');
  });
});
