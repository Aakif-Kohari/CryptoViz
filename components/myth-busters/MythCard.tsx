'use client';

import React, { useState } from 'react';
import { XCircle, CheckCircle2, ChevronDown, ChevronUp, ArrowRight, ShieldAlert, BookOpen } from 'lucide-react';
import { MythItem } from '@/lib/myth-busters/types';
import Link from 'next/link';

interface MythCardProps {
  myth: MythItem;
  onOpenDetails: (myth: MythItem) => void;
}

export default function MythCard({ myth, onOpenDetails }: MythCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = (status: string) => {
    if (status === 'BUSTED') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400 border border-red-500/20">
          <XCircle className="h-4 w-4" />
          BUSTED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <ShieldAlert className="h-4 w-4" />
        MISCONCEPTION
      </span>
    );
  };

  return (
    <div
      className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10"
      tabIndex={0}
      aria-label={`Myth: ${myth.mythTitle}`}
    >
      <div>
        {/* Top Header: Badge & Category */}
        <div className="flex items-center justify-between gap-3 mb-3">
          {getStatusBadge(myth.status)}
          <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {myth.category}
          </span>
        </div>

        {/* Myth Title & Misconception Statement */}
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {myth.mythTitle}
        </h3>

        <div className="mt-3 rounded-xl border border-red-200/60 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20 p-3.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            Common Misconception
          </span>
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-1 italic">
            "{myth.statement}"
          </p>
        </div>

        {/* Reality Summary */}
        <div className="mt-4 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Technical Reality
          </span>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {myth.realitySummary}
          </p>
        </div>

        {/* Expandable Explanation */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3 text-xs text-zinc-600 dark:text-zinc-400 animate-in fade-in duration-200">
            <p className="leading-relaxed">{myth.detailedExplanation}</p>
            <div className="rounded-lg bg-teal-500/10 p-2.5 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-medium">
              💡 <strong>Key Takeaway:</strong> {myth.keyTakeaway}
            </div>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800/60 pt-4 flex items-center justify-between gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Read Analysis <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDetails(myth)}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            Full Deep Dive
          </button>

          {myth.relatedCipherId && (
            <Link
              href={`/visualizer/${myth.relatedCipherId}`}
              className="flex items-center gap-1 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 px-3 py-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 border border-teal-500/20 transition-colors"
            >
              Test Cipher
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
