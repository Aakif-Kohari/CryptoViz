'use client';

import React, { useState, useMemo } from 'react';
import { ShieldAlert, Play, RefreshCw, Info, Lock, Eye, AlertTriangle } from 'lucide-react';

export default function EcbPatternLeakageSimulator() {
  const [gridSize] = useState<number>(8);
  const [selectedPattern, setSelectedPattern] = useState<'logo' | 'checker' | 'stripes'>('logo');
  const [key, setKey] = useState<string>('SECRETKEY1234567');

  // Generate 8x8 pixel bitmap patterns (0 = white, 1 = black)
  const patternPixels = useMemo(() => {
    if (selectedPattern === 'checker') {
      return Array.from({ length: 64 }, (_, i) => ((Math.floor(i / 8) + (i % 8)) % 2 === 0 ? 1 : 0));
    }
    if (selectedPattern === 'stripes') {
      return Array.from({ length: 64 }, (_, i) => (Math.floor(i / 8) % 2 === 0 ? 1 : 0));
    }
    // Logo pattern (Tux-like shape)
    return [
      0, 0, 1, 1, 1, 1, 0, 0,
      0, 1, 1, 0, 0, 1, 1, 0,
      1, 1, 0, 1, 1, 0, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 0, 1, 1, 0, 1, 1,
      0, 1, 1, 1, 1, 1, 1, 0,
      0, 0, 1, 0, 0, 1, 0, 0,
      0, 1, 1, 0, 0, 1, 1, 0,
    ];
  }, [selectedPattern]);

  // Simulate ECB vs CBC mode encryption on block pixels
  const { ecbEncrypted, cbcEncrypted } = useMemo(() => {
    // Deterministic hash mapping for ECB (identical input block -> identical ciphertext block)
    const blockHashMap: Record<number, number> = {
      0: 0,
      1: 1,
    };

    const ecb = patternPixels.map((val) => blockHashMap[val]);

    // CBC mode: Chaining with random IV pseudo-encryption obscures patterns
    let prev = 0x5a;
    const cbc = patternPixels.map((val) => {
      prev = (val ^ prev ^ 0xa5) % 2;
      return prev;
    });

    return { ecbEncrypted: ecb, cbcEncrypted: cbc };
  }, [patternPixels, key]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-8 backdrop-blur-2xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-3.5 w-3.5" />
          ECB MODE PATTERN LEAKAGE SIMULATION
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
          Electronic Codebook (ECB) Pattern Vulnerability
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
          Demonstrates how Electronic Codebook (ECB) mode encrypts identical plaintext blocks into identical ciphertext blocks without initialization vectors, preserving underlying image patterns and creating critical security leaks.
        </p>
      </div>

      {/* Selector controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Input Image Pattern:</label>
          <div className="flex gap-2">
            {(['logo', 'checker', 'stripes'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPattern(p)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                  selectedPattern === p
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
          <AlertTriangle className="h-4 w-4" />
          Deterministic Block Encryption Hazard
        </div>
      </div>

      {/* Grid Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plaintext Grid */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-500" />
            1. Original Plaintext Image
          </h3>
          <div className="grid grid-cols-8 gap-1.5 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 aspect-square">
            {patternPixels.map((val, idx) => (
              <div
                key={idx}
                className={`rounded-md transition-colors ${val === 1 ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-white dark:bg-zinc-800'}`}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Structured bitmap layout before encryption.</p>
        </div>

        {/* ECB Ciphertext Grid (Leaked Pattern) */}
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 space-y-3">
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <Lock className="h-4 w-4 text-red-500" />
            2. ECB Mode Ciphertext (Leaked!)
          </h3>
          <div className="grid grid-cols-8 gap-1.5 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 aspect-square border border-red-500/30">
            {ecbEncrypted.map((val, idx) => (
              <div
                key={idx}
                className={`rounded-md transition-colors ${val === 1 ? 'bg-red-600 dark:bg-red-500' : 'bg-white dark:bg-zinc-800'}`}
              />
            ))}
          </div>
          <p className="text-xs text-red-600 dark:text-red-300 font-medium">
            Pattern intact! Identical blocks map to identical ciphertext.
          </p>
        </div>

        {/* CBC Ciphertext Grid (Secure Random Noise) */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-3">
          <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-500" />
            3. CBC Mode Ciphertext (Random Noise)
          </h3>
          <div className="grid grid-cols-8 gap-1.5 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 aspect-square border border-emerald-500/30">
            {cbcEncrypted.map((val, idx) => (
              <div
                key={idx}
                className={`rounded-md transition-colors ${val === 1 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-white dark:bg-zinc-800'}`}
              />
            ))}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-300 font-medium">
            Pattern destroyed! IV and block chaining introduce pseudorandomness.
          </p>
        </div>
      </div>
    </div>
  );
}
