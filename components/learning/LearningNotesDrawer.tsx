'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  getNoteForTarget,
  saveNoteForTarget,
  downloadMarkdownFile,
  triggerPrintPdfView,
  LearningNote,
  exportNotesAsMarkdown,
} from '@/lib/learning/notesManager';
import {
  FileText,
  Save,
  Download,
  Printer,
  ChevronRight,
  ChevronLeft,
  Check,
  Bold,
  Italic,
  Code,
  List,
  Eye,
  Edit3,
  Sparkles,
} from 'lucide-react';

interface LearningNotesDrawerProps {
  targetId: string;
  targetTitle: string;
  targetType?: 'cipher' | 'doc' | 'general';
}

export default function LearningNotesDrawer({
  targetId,
  targetTitle,
  targetType = 'cipher',
}: LearningNotesDrawerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing note on mount
  useEffect(() => {
    const existing = getNoteForTarget(targetId);
    if (existing) {
      setContent(existing.content);
    }
  }, [targetId]);

  // Debounced auto-save
  useEffect(() => {
    if (!content.trim()) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveNoteForTarget(targetId, targetTitle, targetType, content);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);

    return () => clearTimeout(timer);
  }, [content, targetId, targetTitle, targetType]);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
  };

  const handleExportMarkdown = () => {
    const note = getNoteForTarget(targetId) || {
      id: 'temp',
      targetId,
      targetTitle,
      targetType,
      content,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const md = exportNotesAsMarkdown([note]);
    downloadMarkdownFile(`${targetId}-notes.md`, md);
  };

  const handlePrintPdf = () => {
    const note = getNoteForTarget(targetId) || {
      id: 'temp',
      targetId,
      targetTitle,
      targetType,
      content,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    triggerPrintPdfView([note]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-xs font-bold text-white shadow-2xl hover:bg-teal-500 hover:scale-105 active:scale-95 transition-all"
          aria-label="Open Personal Learning Notes"
        >
          <FileText className="h-4 w-4" />
          <span>Learning Notes</span>
          {saveStatus === 'saved' && <Check className="h-3.5 w-3.5 text-emerald-300" />}
        </button>
      )}

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-5 shadow-2xl backdrop-blur-2xl space-y-4 animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
                Notes: {targetTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400">
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Auto-Saved' : ''}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close notes drawer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md"
                title="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md"
                title="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('`', '`')}
                className="p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md"
                title="Code"
              >
                <Code className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => insertFormatting('\n- ')}
                className="p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md"
                title="Bullet List"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={() => setIsPreview((prev) => !prev)}
              className="flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 px-2 py-1 rounded-md hover:bg-teal-500/10"
            >
              {isPreview ? <Edit3 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {isPreview ? 'Edit' : 'Preview'}
            </button>
          </div>

          {/* Editor / Preview Body */}
          {isPreview ? (
            <div className="h-44 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs text-zinc-800 dark:text-zinc-200 font-mono whitespace-pre-wrap">
              {content || '*No content written yet.*'}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              placeholder="Jot down notes, formulas, key observations, or key lengths..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs text-zinc-900 dark:text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans leading-relaxed"
            />
          )}

          {/* Footer Export Actions */}
          <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <button
              onClick={handleExportMarkdown}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-teal-500 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export .MD
            </button>

            <button
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
