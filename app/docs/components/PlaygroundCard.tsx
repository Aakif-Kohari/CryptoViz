import React from 'react';
import Link from 'next/link';

interface PlaygroundCardProps {
  link: string;
}

export const PlaygroundCard: React.FC<PlaygroundCardProps> = ({ link }) => {
  return (
<div className="mt-10 p-6 bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-teal-500/30 rounded-lg flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm dark:shadow-[0_0_15px_rgba(20,184,166,0.1)] relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">      {/* Glow effect */}
      <div className="absolute inset-0 bg-zinc-50 dark:bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 text-center sm:text-left">
        <h3 className="text-zinc-900 dark:text-white font-mono font-bold text-lg mb-1 tracking-tight">Interactive Playground</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-sans">Experiment with this cipher in real-time, visualizing transformations step-by-step.</p>
      </div>
      
      <Link href={link} className="relative z-10 shrink-0">
        <button className="bg-teal-600 hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-black font-mono font-bold px-6 py-2.5 rounded transition-all shadow-md dark:shadow-[0_0_10px_rgba(20,184,166,0.3)] hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(20,184,166,0.5)] active:scale-95 flex items-center gap-2">
          Try this cipher
          <span className="text-lg leading-none">→</span>
        </button>
      </Link>
    </div>
  );
};
