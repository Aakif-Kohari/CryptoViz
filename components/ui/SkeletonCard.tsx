// ELSoC26 Contribution | Track: UI Components | ID: xtgp6y87q
'use client';

import { motion } from 'framer-motion';

const shimmerBaseClass =
  'relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900';

const lineClass =
  'h-3 rounded-full bg-zinc-200/80 dark:bg-zinc-700/70';

export default function SkeletonCard() {
  return (
    <div
      data-testid="skeleton-card"
      className={`${shimmerBaseClass} flex h-[220px] flex-col p-4 sm:h-[240px]`}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          duration: 1.4,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'mirror',
        }}
      >
        <div className="h-full w-1/2 bg-gradient-to-r from-zinc-200/0 via-zinc-200/70 to-zinc-200/0 dark:from-zinc-700/0 dark:via-zinc-700/70 dark:to-zinc-700/0" />
      </motion.div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 rounded-full bg-zinc-200/80 dark:bg-zinc-700/70" />
            <div className="h-6 w-6 rounded-full bg-zinc-200/80 dark:bg-zinc-700/70" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-24 rounded-full bg-zinc-200/80 dark:bg-zinc-700/70" />
            <div className="h-4 w-16 rounded-full bg-zinc-200/80 dark:bg-zinc-700/70" />
          </div>
        </div>

        <div className="space-y-3" data-testid="skeleton-lines">
          <div className={lineClass} data-testid="skeleton-line" />
          <div className={`${lineClass} w-4/5`} data-testid="skeleton-line" />
          <div className={`${lineClass} w-3/5`} data-testid="skeleton-line" />
          <div className={`${lineClass} w-2/3`} data-testid="skeleton-line" />
        </div>
      </div>
    </div>
  );
}
