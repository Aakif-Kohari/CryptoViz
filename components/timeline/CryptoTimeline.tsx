'use client';

import React, { useState, useMemo } from 'react';
import {
  TimelineEntry,
  TimelineCategory,
  timelineEntries,
  timelineCategories,
  categoryLabels,
  getSortedEntries,
} from '@/lib/timeline/timelineData';
import { Search, Filter, X, ChevronDown, ChevronUp, BookOpen, ArrowRight, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';

// ── Category colour mapping ───────────────────────────────────────────────
const CATEGORY_STYLES: Record<TimelineCategory, { dot: string; line: string; badge: string; border: string; glow: string }> = {
  classical: {
    dot: 'bg-amber-500 shadow-amber-500/40',
    line: 'bg-amber-500/30',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-500/30',
    border: 'border-amber-500/30 hover:border-amber-500/60',
    glow: 'shadow-amber-500/10',
  },
  'world-war': {
    dot: 'bg-purple-500 shadow-purple-500/40',
    line: 'bg-purple-500/30',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-500/30',
    border: 'border-purple-500/30 hover:border-purple-500/60',
    glow: 'shadow-purple-500/10',
  },
  modern: {
    dot: 'bg-teal-500 shadow-teal-500/40',
    line: 'bg-teal-500/30',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 border-teal-500/30',
    border: 'border-teal-500/30 hover:border-teal-500/60',
    glow: 'shadow-teal-500/10',
  },
  'post-quantum': {
    dot: 'bg-red-500 shadow-red-500/40',
    line: 'bg-red-500/30',
    badge: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-500/30',
    border: 'border-red-500/30 hover:border-red-500/60',
    glow: 'shadow-red-500/10',
  },
};

// ── Single timeline entry card ────────────────────────────────────────────
function TimelineCard({
  entry,
  index,
  isExpanded,
  onToggle,
}: {
  entry: TimelineEntry;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const styles = CATEGORY_STYLES[entry.category];
  const isLeft = index % 2 === 0;

  return (
    <div className="group relative flex items-start gap-4 sm:gap-8">
      {/* Desktop: Alternating layout spacer */}
      <div className="hidden w-1/2 md:block" />

      {/* Timeline dot + line */}
      <div className="relative flex shrink-0 flex-col items-center">
        <div
          className={`z-10 flex h-5 w-5 items-center justify-center rounded-full ${styles.dot} ring-4 ring-white dark:ring-[#060816] shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:shadow-xl ${styles.dot.replace('shadow-', 'shadow-')}`}
          aria-hidden="true"
        >
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>
        {/* Vertical line connecting dots */}
        <div className={`absolute top-5 h-full w-0.5 ${styles.line}`} aria-hidden="true" />
      </div>

      {/* Card content */}
      <div className={`w-full pb-12 md:w-1/2 ${isLeft ? 'md:order-first' : 'md:order-last'}`}>
        <div
          className={`relative rounded-2xl border ${styles.border} bg-white/80 dark:bg-zinc-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${styles.glow} cursor-pointer`}
          onClick={onToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
          aria-expanded={isExpanded}
        >
          {/* Year badge */}
          <div className="absolute -top-3 right-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-0.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 shadow-sm">
            {entry.year}
          </div>

          {/* Category badge */}
          <div className="mb-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
              {categoryLabels[entry.category]}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {entry.title}
          </h3>

          {/* Summary */}
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {entry.summary}
          </p>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {entry.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
            {entry.tags.length > 4 && (
              <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                +{entry.tags.length - 4}
              </span>
            )}
          </div>

          {/* Expand / collapse indicator */}
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400">
            {isExpanded ? (
              <>Show Less <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>Read More <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </div>

          {/* Expanded detail */}
          {isExpanded && (
            <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3">
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {entry.description}
              </p>

              {entry.relatedCiphers && entry.relatedCiphers.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Try in CryptoViz:</span>
                  {entry.relatedCiphers.map((cipher) => (
                    <Link
                      key={cipher}
                      href={`/visualizer/${cipher}/`}
                      className="inline-flex items-center gap-1 rounded-lg bg-teal-500/10 px-2.5 py-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 transition-colors"
                    >
                      {cipher}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Full tags */}
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Timeline Component ───────────────────────────────────────────────
export default function CryptoTimeline() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<TimelineCategory[]>(timelineCategories);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedEntries = useMemo(() => getSortedEntries(), []);

  const filteredEntries = useMemo(() => {
    return sortedEntries.filter((entry) => {
      // Category filter
      if (!activeCategories.includes(entry.category)) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          entry.title.toLowerCase().includes(q) ||
          entry.summary.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q) ||
          entry.tags.some((t) => t.toLowerCase().includes(q)) ||
          entry.year.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [sortedEntries, activeCategories, searchQuery]);

  const toggleCategory = (cat: TimelineCategory) => {
    setActiveCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategories(timelineCategories);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' || activeCategories.length < timelineCategories.length;

  return (
    <div className="space-y-8">
      {/* ── Hero section ── */}
      <section
        aria-labelledby="timeline-hero-title"
        className="relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent p-8 sm:p-12 backdrop-blur-2xl"
      >
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-bold text-teal-600 dark:text-teal-400">
            <Sparkles className="h-3.5 w-3.5" />
            INTERACTIVE HISTORICAL TIMELINE
          </div>
          <h1
            id="timeline-hero-title"
            className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white"
          >
            Cryptography{' '}
            <span className="text-teal-500">Timeline</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
            Explore the evolution of cryptography from ancient hand ciphers to post-quantum lattice-based
            cryptography. Each milestone includes historical context, technical details, and links to
            interactive visualizers.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="text-zinc-500 dark:text-zinc-400">
              <strong className="text-zinc-900 dark:text-white">{timelineEntries.length}</strong> Milestones
            </div>
            <div className="text-zinc-500 dark:text-zinc-400">
              <strong className="text-zinc-900 dark:text-white">c. 500 BC</strong> – <strong className="text-zinc-900 dark:text-white">2024+</strong>
            </div>
            <div className="text-zinc-500 dark:text-zinc-400">
              <strong className="text-zinc-900 dark:text-white">{timelineCategories.length}</strong> Eras
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section aria-label="Timeline filters" className="space-y-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search milestones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search timeline milestones"
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-10 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by era">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mr-1">
            <Filter className="inline h-3.5 w-3.5 mr-1" />
            Era:
          </span>
          {timelineCategories.map((cat) => {
            const isActive = activeCategories.includes(cat);
            const styles = CATEGORY_STYLES[cat];
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all border ${
                  isActive
                    ? `${styles.badge} shadow-sm`
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-500 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
                aria-pressed={isActive}
              >
                {categoryLabels[cat]}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* ── Results info ── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing{' '}
          <span className="font-bold text-teal-600 dark:text-teal-400">
            {filteredEntries.length}
          </span>{' '}
          of {timelineEntries.length} milestones
        </p>
      </div>

      {/* ── Timeline entries ── */}
      {filteredEntries.length > 0 ? (
        <div className="relative">
          {/* Central vertical line (desktop) */}
          <div
            className="absolute left-[10px] top-0 h-full w-0.5 bg-zinc-200 dark:bg-zinc-800 hidden md:block"
            aria-hidden="true"
          />

          <div className="space-y-0">
            {filteredEntries.map((entry, index) => (
              <TimelineCard
                key={entry.id}
                entry={entry}
                index={index}
                isExpanded={expandedId === entry.id}
                onToggle={() => toggleExpanded(entry.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            No milestones match your search or filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-3 text-xs font-bold text-teal-500 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
