import React, { useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';

export interface ZenModeToggleProps {
  isZenMode: boolean;
  onToggle: () => void;
}

export default function ZenModeToggle({ isZenMode, onToggle }: ZenModeToggleProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        (typeof target.getAttribute === 'function' && target.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        onToggle();
      }

      if (e.key === 'Escape' && isZenMode) {
        e.preventDefault();
        onToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, onToggle]);

  return (
    <button
      onClick={onToggle}
      className={`flex items-center justify-center p-2 rounded-md transition-colors ${
        isZenMode 
          ? 'bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-900 dark:text-teal-200 dark:hover:bg-teal-800' 
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
      }`}
      aria-label={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
      aria-pressed={isZenMode}
      title={isZenMode ? "Exit Zen Mode (Esc or Z)" : "Enter Zen Mode (Press Z)"}
    >
      {isZenMode ? (
        <Minimize className="h-4 w-4" />
      ) : (
        <Maximize className="h-4 w-4" />
      )}
    </button>
  );
}
