'use client';

import { clsx } from 'clsx';

interface SonificationToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  className?: string;
}

/** Accessible audio-sonification toggle for the visualizer control bar */
export function SonificationToggle({
  isEnabled,
  onToggle,
  className,
}: SonificationToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isEnabled}
      aria-label={
        isEnabled ? 'Disable audio sonification' : 'Enable audio sonification'
      }
      title={
        isEnabled
          ? 'Audio Sonification: ON — click to disable'
          : 'Audio Sonification: OFF — click to enable'
      }
      className={clsx(
        'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium',
        'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-offset-2 select-none cursor-pointer',
        isEnabled
          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          : 'border-zinc-600 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200',
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isEnabled ? (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </>
        ) : (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </>
        )}
      </svg>
      <span>{isEnabled ? 'Audio ON' : 'Audio OFF'}</span>
    </button>
  );
}
