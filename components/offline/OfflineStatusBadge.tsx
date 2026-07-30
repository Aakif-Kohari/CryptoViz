'use client';

import React from 'react';
import { Wifi, WifiOff, HardDrive, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { OfflineCacheStatus } from '@/lib/offline/types';

interface OfflineStatusBadgeProps {
  status: OfflineCacheStatus;
  onClearCache?: () => void;
}

export default function OfflineStatusBadge({ status, onClearCache }: OfflineStatusBadgeProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const cachedCount = status.cachedPackIds.length;

  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 p-5 backdrop-blur-xl shadow-lg shadow-teal-500/5 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Connection & Offline Readiness Status */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              status.isOnline
                ? 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400'
                : 'bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400'
            }`}
          >
            {status.isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 dark:text-white">
                {status.isOnline ? 'Online Mode Active' : 'Offline Mode Active'}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  cachedCount > 0
                    ? 'bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400 border border-teal-500/20'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                {cachedCount > 0 ? `${cachedCount} Pack(s) Cached` : 'No Packs Cached'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {status.isOnline
                ? 'All docs and standalone visualizers are ready for pre-download.'
                : 'Browsing cached offline learning material without network connectivity.'}
            </p>
          </div>
        </div>

        {/* Cache Storage Stats & Clear Action */}
        <div className="flex items-center gap-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-3 sm:border-t-0 sm:pt-0">
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <HardDrive className="h-4 w-4 text-teal-500" />
            <div>
              <span className="font-semibold text-zinc-900 dark:text-white">
                {formatSize(status.storageUsedBytes)}
              </span>
              <span className="text-zinc-400 dark:text-zinc-500 ml-1">
                / {formatSize(status.storageQuotaBytes)}
              </span>
            </div>
          </div>

          {cachedCount > 0 && onClearCache && (
            <button
              onClick={onClearCache}
              aria-label="Clear offline cached packs"
              className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Cache
            </button>
          )}
        </div>
      </div>

      {/* Caching Progress Indicator */}
      {status.isCachingInProgress && (
        <div className="mt-4 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
          <div className="flex items-center justify-between text-xs font-medium text-teal-600 dark:text-teal-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 animate-bounce" />
              Pre-caching learning assets...
            </span>
            <span>{status.cachingProgressPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${status.cachingProgressPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
