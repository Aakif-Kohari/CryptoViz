import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveNoteForTarget,
  getNoteForTarget,
  getAllNotes,
  deleteNote,
  exportNotesAsMarkdown,
  LearningNote,
} from '../../../lib/learning/notesManager';

describe('Learning Notes Manager', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('saves and retrieves a new note for a specific target', () => {
    saveNoteForTarget('caesar', 'Caesar Cipher', 'cipher', 'My custom Caesar note');

    const note = getNoteForTarget('caesar');
    expect(note).not.toBeNull();
    expect(note?.targetTitle).toBe('Caesar Cipher');
    expect(note?.content).toBe('My custom Caesar note');
  });

  it('updates an existing note on subsequent save calls', () => {
    saveNoteForTarget('rsa', 'RSA Algorithm', 'cipher', 'Initial RSA note');
    saveNoteForTarget('rsa', 'RSA Algorithm', 'cipher', 'Updated RSA note text');

    const notes = getAllNotes().filter((n) => n.targetId === 'rsa');
    expect(notes.length).toBe(1);
    expect(notes[0].content).toBe('Updated RSA note text');
  });

  it('deletes a note by ID correctly', () => {
    const created = saveNoteForTarget('sha256', 'SHA-256 Digest', 'doc', 'SHA256 note');
    expect(getAllNotes().length).toBeGreaterThanOrEqual(1);

    deleteNote(created.id);
    expect(getNoteForTarget('sha256')).toBeNull();
  });

  it('formats array of notes into clean Markdown export format', () => {
    const sampleNotes: LearningNote[] = [
      {
        id: 'n1',
        targetId: 'aes',
        targetTitle: 'AES Encryption',
        targetType: 'cipher',
        content: 'AES uses 128-bit block size.',
        tags: ['symmetric', 'block-cipher'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const md = exportNotesAsMarkdown(sampleNotes);
    expect(md).toContain('# CryptoViz Personal Learning Notes');
    expect(md).toContain('## AES Encryption (CIPHER)');
    expect(md).toContain('AES uses 128-bit block size.');
  });
});
