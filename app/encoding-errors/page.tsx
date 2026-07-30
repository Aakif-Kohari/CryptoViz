'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/footer';
import EncodingErrorPlayground from '@/components/encoding/EncodingErrorPlayground';
import { AlertTriangle, Bug, Wrench, Sparkles, BookOpen } from 'lucide-react';

export default function EncodingErrorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#060816] text-zinc-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main id="main-content" className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Header */}
        <section aria-labelledby="encoding-error-hero-title" className="relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-br from-amber-500/10 via-teal-500/5 to-transparent p-8 sm:p-12 backdrop-blur-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Bug className="h-3.5 w-3.5" />
              ENCODING ERROR PLAYGROUND #506
            </div>
            <h1 id="encoding-error-hero-title" className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
              Encoding Error & <span className="text-amber-500">Mojibake Playground</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Explore how decoders handle invalid sequences, byte-level truncation, Base64 padding corruption, and Mojibake character set mismatches.
            </p>
          </div>
        </section>

        {/* Playground Component */}
        <section aria-labelledby="playground-section-heading">
          <EncodingErrorPlayground />
        </section>

        {/* Educational Reference Cards */}
        <section aria-labelledby="encoding-pitfalls-heading" className="space-y-6">
          <div>
            <h2 id="encoding-pitfalls-heading" className="text-2xl font-bold text-zinc-900 dark:text-white">
              Common Encoding Pitfalls & Explanations
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Key concepts in string encoding, byte offsets, and decoding errors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/50 p-6 space-y-3">
              <span className="text-xs font-bold text-teal-500 uppercase tracking-wider">Base64 Padding</span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Padding '=' Symbol Failures</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Base64 processes data in 3-byte (24-bit) blocks. When input length is not a multiple of 3 bytes, trailing '=' characters pad the remaining 6-bit units. Omission or misplaced '=' causes decoder exceptions.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/50 p-6 space-y-3">
              <span className="text-xs font-bold text-teal-500 uppercase tracking-wider">UTF-8 Truncation</span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Replacement Character ()</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                UTF-8 uses variable-length encoding (1 to 4 bytes per codepoint). If a multi-byte sequence is truncated mid-stream, standard decoders emit the Unicode replacement character `` (U+FFFD).
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/50 p-6 space-y-3">
              <span className="text-xs font-bold text-teal-500 uppercase tracking-wider">Mojibake</span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Character Set Misinterpretation</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Mojibake occurs when text written in one encoding (e.g. UTF-8) is decoded using a different character set (e.g. ISO-8859-1), displaying garbled symbols such as "Ã©" instead of "é".
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
