// ────────────────────────────────────────────────────────────────────────────
// Learning Notes Management System
// Provides local storage persistence, auto-save, and Markdown / PDF export capabilities.
// ────────────────────────────────────────────────────────────────────────────

import { safeGetItem, safeSetItem } from '../utils/storage';

export interface LearningNote {
  id: string;
  targetId: string;
  targetTitle: string;
  targetType: 'cipher' | 'doc' | 'general';
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'cryptoviz_learning_notes';

export function getAllNotes(): LearningNote[] {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LearningNote[];
  } catch {
    return [];
  }
}

export function getNoteForTarget(targetId: string): LearningNote | null {
  const notes = getAllNotes();
  return notes.find((n) => n.targetId === targetId) || null;
}

export function saveNoteForTarget(
  targetId: string,
  targetTitle: string,
  targetType: 'cipher' | 'doc' | 'general',
  content: string,
  tags: string[] = []
): LearningNote {
  const notes = getAllNotes();
  const existingIdx = notes.findIndex((n) => n.targetId === targetId);
  const now = new Date().toISOString();

  let updatedNote: LearningNote;

  if (existingIdx >= 0) {
    updatedNote = {
      ...notes[existingIdx],
      targetTitle,
      targetType,
      content,
      tags,
      updatedAt: now,
    };
    notes[existingIdx] = updatedNote;
  } else {
    updatedNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetId,
      targetTitle,
      targetType,
      content,
      tags,
      createdAt: now,
      updatedAt: now,
    };
    notes.unshift(updatedNote);
  }

  safeSetItem(STORAGE_KEY, JSON.stringify(notes));
  return updatedNote;
}

export function deleteNote(id: string): void {
  const notes = getAllNotes().filter((n) => n.id !== id);
  safeSetItem(STORAGE_KEY, JSON.stringify(notes));
}

export function exportNotesAsMarkdown(notes: LearningNote[]): string {
  if (notes.length === 0) return '# CryptoViz Learning Notes\n\nNo notes recorded.';

  const lines = [
    '# CryptoViz Personal Learning Notes',
    `*Exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*`,
    '',
    '---',
    '',
  ];

  for (const note of notes) {
    lines.push(`## ${note.targetTitle} (${note.targetType.toUpperCase()})`);
    lines.push(`*Last updated: ${new Date(note.updatedAt).toLocaleString()}*`);
    if (note.tags.length > 0) {
      lines.push(`**Tags:** ${note.tags.map((t) => `\`${t}\``).join(', ')}`);
    }
    lines.push('');
    lines.push(note.content || '*No text entered.*');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

export function downloadMarkdownFile(filename: string, content: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.md') ? filename : `${filename}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerPrintPdfView(notes: LearningNote[]): void {
  if (typeof window === 'undefined') return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const mdHtml = notes
    .map(
      (n) => `
      <div style="margin-bottom: 2rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem;">
        <h2 style="color: #0d9488; margin-bottom: 0.25rem;">${n.targetTitle}</h2>
        <p style="font-size: 0.8rem; color: #6b7280; margin-top: 0;">Updated: ${new Date(n.updatedAt).toLocaleString()}</p>
        <div style="font-family: monospace; white-space: pre-wrap; background: #f9fafb; padding: 1rem; border-radius: 0.5rem;">${n.content}</div>
      </div>
    `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CryptoViz Learning Notes PDF</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; max-width: 800px; margin: auto; }
          h1 { color: #111827; }
        </style>
      </head>
      <body>
        <h1>CryptoViz Learning Notes</h1>
        <hr />
        ${mdHtml}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
