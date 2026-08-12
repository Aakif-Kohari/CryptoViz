'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllNotes,
  saveNoteForTarget,
  deleteNote,
  exportNotesAsMarkdown,
  downloadMarkdownFile,
  triggerPrintPdfView,
  LearningNote,
} from '@/lib/learning/notesManager';
import { Search, Download, Printer, Trash2, Plus, Edit3, FileText, Sparkles, Check } from 'lucide-react';

export default function LearningNotesHub() {
  const [notes, setNotes] = useState<LearningNote[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newType, setNewType] = useState<'cipher' | 'doc' | 'general'>('general');

  useEffect(() => {
    const loaded = getAllNotes();
    setNotes(loaded);
    if (loaded.length > 0) {
      setSelectedNoteId(loaded[0].id);
      setEditContent(loaded[0].content);
    }
  }, []);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.targetTitle.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.targetType.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  const handleSelectNote = (note: LearningNote) => {
    setSelectedNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (!selectedNote) return;
    const updated = saveNoteForTarget(
      selectedNote.targetId,
      selectedNote.targetTitle,
      selectedNote.targetType,
      editContent
    );
    setNotes(getAllNotes());
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    const updated = getAllNotes();
    setNotes(updated);
    if (updated.length > 0) {
      setSelectedNoteId(updated[0].id);
      setEditContent(updated[0].content);
    } else {
      setSelectedNoteId(null);
      setEditContent('');
    }
  };

  const handleCreateNew = () => {
    if (!newTitle.trim()) return;
    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const created = saveNoteForTarget(slug, newTitle, newType, `# ${newTitle}\n\nStart typing notes...`);
    const updated = getAllNotes();
    setNotes(updated);
    setSelectedNoteId(created.id);
    setEditContent(created.content);
    setShowNewModal(false);
    setNewTitle('');
  };

  const handleExportAllMarkdown = () => {
    const md = exportNotesAsMarkdown(notes);
    downloadMarkdownFile('all-cryptoviz-notes.md', md);
  };

  const handlePrintAllPdf = () => {
    triggerPrintPdfView(notes);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent p-8 sm:p-12 backdrop-blur-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-bold text-teal-600 dark:text-teal-400">
            <Sparkles className="h-3.5 w-3.5" />
            PERSONAL LEARNING WORKSPACE
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            My Learning <span className="text-teal-500">Notes Hub</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
            Organize, edit, and export your personal study notes recorded across algorithm visualizers, documentation articles, and custom security research topics.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-teal-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Note Topic
            </button>

            <button
              onClick={handleExportAllMarkdown}
              disabled={notes.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export All (.MD)
            </button>

            <button
              onClick={handlePrintAllPdf}
              disabled={notes.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print / PDF
            </button>
          </div>
        </div>
      </section>

      {/* Main Layout: Notes List (Left) & Active Editor (Right) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Notes List */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 text-center text-xs text-zinc-400">
                No notes found. Click "New Note Topic" to create one.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    selectedNoteId === note.id
                      ? 'border-teal-500/50 bg-teal-500/10 shadow-md'
                      : 'border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 hover:border-teal-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
                      {note.targetTitle}
                    </h4>
                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[9px] font-bold uppercase text-zinc-500">
                      {note.targetType}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {note.content.replace(/#+/g, '').slice(0, 100)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Note Editor */}
        <div className="lg:col-span-2">
          {selectedNote ? (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-teal-500" />
                    {selectedNote.targetTitle}
                  </h3>
                  <div className="text-xs text-zinc-400">
                    Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-teal-500"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Save Note
                  </button>
                  <button
                    onClick={() => handleDelete(selectedNote.id)}
                    className="rounded-xl p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Delete Note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={14}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 font-mono text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center text-zinc-400">
              Select a note on the left to edit or export.
            </div>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Create New Note Topic</h3>
            <input
              type="text"
              placeholder="Topic Title (e.g. Elliptic Curves Notes)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNew}
                className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-500"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
