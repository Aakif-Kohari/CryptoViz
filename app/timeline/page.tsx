/**
 * Cipher Relationship Graph Page
 *
 * Renders the interactive Cipher Relationship Graph visualizer that shows
 * cryptographic algorithm evolution, influences, and dependencies.
 *
 * @see lib/timeline/timelineData.ts for graph data
 * @see components/timeline/CryptoTimeline.tsx for the visualization component
 */

'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/footer';
import CryptoTimeline from '@/components/timeline/CryptoTimeline';
import { Sparkles, GitBranch, Search } from 'lucide-react';

export default function CipherRelationshipGraphPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#060816] text-zinc-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main id="main-content" className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Header */}
        <section
          aria-labelledby="graph-hero-title"
          className="relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent p-8 sm:p-12 backdrop-blur-2xl"
        >
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-bold text-teal-600 dark:text-teal-400">
              <Sparkles className="h-3.5 w-3.5" />
              CIPHER RELATIONSHIP GRAPH
            </div>
            <h1
              id="graph-hero-title"
              className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white"
            >
              Cryptographic{' '}
              <span className="text-teal-500">Evolution Graph</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Explore how cryptographic algorithms evolved, influenced each
              other, and branched into new designs. Nodes represent ciphers,
              edges represent relationships like "evolved from",
              "influenced by", and "variant of".
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <GitBranch className="h-4 w-4 text-teal-500" />
                <span>Evolution lineage</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <Search className="h-4 w-4 text-teal-500" />
                <span>Search &amp; filter</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <svg className="h-4 w-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <span>Pan &amp; zoom</span>
              </div>
            </div>
          </div>
        </section>

        {/* Graph Visualization */}
        <section aria-labelledby="graph-visualization-heading" className="space-y-4">
          <div>
            <h2
              id="graph-visualization-heading"
              className="text-2xl font-bold text-zinc-900 dark:text-white"
            >
              Algorithm Relationship Map
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Click any node to focus on its relationships. Drag to pan, scroll
              to zoom. Use the legend to understand colours and edge types.
            </p>
          </div>

          {/* The interactive graph */}
          <CryptoTimeline />
        </section>
      </main>

      <Footer />
    </div>
  );
}

