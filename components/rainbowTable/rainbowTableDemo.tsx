/**
 * components/rainbowTable/rainbowTableDemo.tsx
 * 
 * Redesigned Rainbow Table Attack Visualizer and Simulator matching CryptoViz's
 * design system, glassmorphism cards, stat badges, interactive tab workspace,
 * hash reduction chain explorer, and salting defense comparison matrix.
 */

"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Database,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  Search,
  Sparkles,
  RefreshCw,
  Cpu,
  Layers,
  Lock,
  Unlock,
  ArrowRight,
  Info,
  AlertCircle,
  KeyRound,
  Table as TableIcon,
  CheckCircle2,
  XCircle,
  Hash,
} from "lucide-react";
import {
  buildRainbowTable,
  computeHash,
  lookupInTable,
  demonstrateSalting,
  generateRandomSalt,
  DEFAULT_PASSWORDS,
  getUserFriendlyErrorMessage,
  validatePassword,
  validateAlgorithm,
} from "@/lib/rainbowTable/rainbowTable";
import type { HashAlgorithm, RainbowTableLookupResult, SaltedHashResult } from "@/lib/rainbowTable/types";

type ActiveTab = "lookup" | "table" | "salting";

const SAMPLE_PRESETS = [
  "password",
  "123456",
  "admin",
  "letmein",
  "secret_pass",
  "shadow",
  "sunshine",
];

export default function RainbowTableDemo() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>("lookup");

  // User inputs
  const [inputPassword, setInputPassword] = useState("password");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("sha1");
  const [customSalt, setCustomSalt] = useState(() => generateRandomSalt(8));

  // Search filter for table inspector
  const [tableSearch, setTableSearch] = useState("");

  // Loading & error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Results
  const [lookupResult, setLookupResult] = useState<RainbowTableLookupResult | null>(() => {
    try {
      const table = buildRainbowTable(DEFAULT_PASSWORDS, "sha1");
      const userHashHex = computeHash("password", "sha1");
      return lookupInTable(userHashHex, table);
    } catch {
      return null;
    }
  });

  const [saltedResult, setSaltedResult] = useState<SaltedHashResult | null>(() => {
    try {
      return demonstrateSalting("password", customSalt, "sha1");
    } catch {
      return null;
    }
  });

  // Precomputed table map
  const rainbowTableMap = useMemo(() => {
    try {
      return buildRainbowTable(DEFAULT_PASSWORDS, algorithm);
    } catch {
      return new Map<string, string>();
    }
  }, [algorithm]);

  // Filtered entries for table inspector
  const tableEntries = useMemo(() => {
    const list: Array<{ hash: string; plaintext: string }> = [];
    rainbowTableMap.forEach((plaintext, hash) => {
      list.push({ hash, plaintext });
    });

    if (!tableSearch.trim()) return list;

    const query = tableSearch.toLowerCase().trim();
    return list.filter(
      (entry) =>
        entry.plaintext.toLowerCase().includes(query) ||
        entry.hash.toLowerCase().includes(query)
    );
  }, [rainbowTableMap, tableSearch]);

  // Execute lookup
  async function handleLookup(targetPassword?: string) {
    const pwdToSearch = targetPassword ?? inputPassword;
    setError(null);
    setLoading(true);

    try {
      const passwordValidation = validatePassword(pwdToSearch);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.error);
      }

      const algorithmValidation = validateAlgorithm(algorithm);
      if (!algorithmValidation.valid) {
        throw new Error(algorithmValidation.error);
      }

      const table = buildRainbowTable(DEFAULT_PASSWORDS, algorithm);
      const userHashHex = computeHash(pwdToSearch, algorithm);
      const result = lookupInTable(userHashHex, table);
      setLookupResult(result);

      // Salting demo
      const activeSalt = customSalt.trim() ? customSalt : generateRandomSalt(8);
      const salted = demonstrateSalting(pwdToSearch, activeSalt, algorithm);
      setSaltedResult(salted);
    } catch (err) {
      setError(getUserFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handlePresetClick(pwd: string) {
    setInputPassword(pwd);
    handleLookup(pwd);
  }

  function handleGenerateNewSalt() {
    const newSalt = generateRandomSalt(8);
    setCustomSalt(newSalt);
    if (inputPassword) {
      const salted = demonstrateSalting(inputPassword, newSalt, algorithm);
      setSaltedResult(salted);
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="w-full space-y-6">
      {/* CARD CONTAINER */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md shadow-xl overflow-hidden">
        {/* TOP TAB NAVIGATION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 p-4 sm:px-6 bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                Rainbow Table Attack Workspace
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Simulate precomputed lookups, inspect hash chains & salting defenses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60 text-xs font-medium">
            <button
              onClick={() => setActiveTab("lookup")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "lookup"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <CrosshairIcon className="w-3.5 h-3.5" />
              <span>Attack Lookup</span>
            </button>

            <button
              onClick={() => setActiveTab("table")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "table"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table Inspector</span>
              <span className="px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-300 text-[10px]">
                {DEFAULT_PASSWORDS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("salting")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "salting"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Salting Defense</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ATTACK LOOKUP */}
        {activeTab === "lookup" && (
          <div className="p-6 space-y-6">
            {/* INPUT CONTROLS */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="inputPassword" className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-teal-500" />
                    Target Password to Crack
                  </label>
                  <input
                    id="inputPassword"
                    type="text"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="Enter password to query in table..."
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 text-sm font-mono transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="algorithm" className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-teal-500" />
                    Hash Primitive
                  </label>
                  <select
                    id="algorithm"
                    value={algorithm}
                    onChange={(e) => {
                      setAlgorithm(e.target.value as HashAlgorithm);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 text-sm transition-all"
                  >
                    <option value="sha1">SHA-1 (40 Hex Chars)</option>
                    <option value="md5">MD5-like (32 Hex Chars)</option>
                  </select>
                </div>
              </div>

              {/* PRESET QUICK PASSWORDS */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Quick Test Passwords:</span>
                {SAMPLE_PRESETS.map((pwd) => (
                  <button
                    key={pwd}
                    type="button"
                    onClick={() => handlePresetClick(pwd)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                      inputPassword === pwd
                        ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30 font-semibold"
                        : "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    {pwd}
                  </button>
                ))}
              </div>

              {/* PRIMARY ACTION BUTTON */}
              <button
                onClick={() => handleLookup()}
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-teal-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching Precomputed Rainbow Table...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Execute Rainbow Table Lookup Attack</span>
                  </>
                )}
              </button>
            </div>

            {/* ERROR NOTIFICATION */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Lookup Failed</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* STATISTICAL METRICS SUMMARY */}
            {lookupResult && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Metric 1: Lookup Time */}
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>Lookup Execution</span>
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
                      {lookupResult.lookupTime < 0.01 ? "< 0.01 ms" : `${lookupResult.lookupTime.toFixed(3)} ms`}
                    </p>
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Instant O(1) Index Match</p>
                  </div>

                  {/* Metric 2: Table Entries */}
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>Indexed Table Size</span>
                      <Database className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
                      {lookupResult.tableSize} <span className="text-xs font-normal text-zinc-500">entries</span>
                    </p>
                    <p className="text-[10px] text-zinc-500">Precomputed Hashes</p>
                  </div>

                  {/* Metric 3: Attack Outcome */}
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>Attack Status</span>
                      {lookupResult.found ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <p className={`text-xl font-bold ${lookupResult.found ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {lookupResult.found ? "CRACKED" : "DEFENDED"}
                    </p>
                    <p className="text-[10px] text-zinc-500">{lookupResult.found ? "Hash Found in Table" : "Hash Not Precomputed"}</p>
                  </div>

                  {/* Metric 4: Complexity */}
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>Time Complexity</span>
                      <Cpu className="w-3.5 h-3.5 text-cyan-500" />
                    </div>
                    <p className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
                      O(1) Time
                    </p>
                    <p className="text-[10px] text-zinc-500">O(N) Offline Storage</p>
                  </div>
                </div>

                {/* ATTACK RESULT BANNER */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    lookupResult.found
                      ? "bg-red-500/10 border-red-500/30 text-red-950 dark:text-red-100"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl shrink-0 ${lookupResult.found ? "bg-red-500/20 text-red-600 dark:text-red-400" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"}`}>
                      {lookupResult.found ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <h3 className="font-bold text-base flex items-center justify-between">
                        <span>{lookupResult.found ? "⚠️ Password Hash Successfully Cracked!" : "✓ Password Not Found in Precomputed Table"}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/10 dark:bg-white/10">
                          {algorithm.toUpperCase()}
                        </span>
                      </h3>

                      <p className="text-xs sm:text-sm leading-relaxed">
                        {lookupResult.found ? (
                          <>
                            Target password <code className="font-mono bg-red-500/20 px-1.5 py-0.5 rounded text-red-700 dark:text-red-300">"{lookupResult.plaintext}"</code> matched hash <code className="font-mono text-[11px] bg-red-500/20 px-1.5 py-0.5 rounded break-all">{lookupResult.hash}</code> instantly without brute-force computation!
                          </>
                        ) : (
                          <>
                            Hash <code className="font-mono text-[11px] bg-emerald-500/20 px-1.5 py-0.5 rounded break-all">{lookupResult.hash}</code> does not exist in our {lookupResult.tableSize}-entry demo table. In real attacks, precomputing larger tables increases candidate coverage.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* FLOWCHART PIPELINE */}
                <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/40 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-500" />
                    Interactive Hash Lookup Pipeline Step Visualizer
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    {/* Step 1 */}
                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                      <div className="flex items-center justify-between text-zinc-500">
                        <span className="font-semibold text-teal-600 dark:text-teal-400">Step 1</span>
                        <KeyRound className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-semibold text-zinc-900 dark:text-white">Input Password</p>
                      <p className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded truncate text-zinc-700 dark:text-zinc-300">
                        "{inputPassword}"
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                      <div className="flex items-center justify-between text-zinc-500">
                        <span className="font-semibold text-teal-600 dark:text-teal-400">Step 2</span>
                        <Hash className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-semibold text-zinc-900 dark:text-white">Compute Hash H(p)</p>
                      <p className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded truncate text-zinc-700 dark:text-zinc-300">
                        {lookupResult.hash}
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                      <div className="flex items-center justify-between text-zinc-500">
                        <span className="font-semibold text-teal-600 dark:text-teal-400">Step 3</span>
                        <Database className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-semibold text-zinc-900 dark:text-white">Table Map Query</p>
                      <p className="text-[11px] text-zinc-500">O(1) Map.get(Hash)</p>
                    </div>

                    {/* Step 4 */}
                    <div className={`p-3.5 rounded-xl border space-y-2 ${lookupResult.found ? "bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-200" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Step 4</span>
                        {lookupResult.found ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <p className="font-semibold">Result</p>
                      <p className="font-mono text-[11px]">
                        {lookupResult.found ? `Match: "${lookupResult.plaintext}"` : "No Match"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRECOMPUTED TABLE INSPECTOR */}
        {activeTab === "table" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-500" />
                  Precomputed Rainbow Table Inspector
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Inspect the {DEFAULT_PASSWORDS.length} precomputed password-to-hash mappings built for the current algorithm ({algorithm.toUpperCase()}).
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Filter by password or hash..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>
            </div>

            {/* CHAIN REDUCTION CONCEPT CARD */}
            <div className="p-4 rounded-xl border border-teal-500/20 bg-teal-500/5 text-xs text-teal-900 dark:text-teal-200 space-y-2">
              <p className="font-semibold flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
                <Info className="w-4 h-4 shrink-0" /> Rainbow Table Chain Reduction Insight:
              </p>
              <p className="leading-relaxed">
                Full-scale rainbow tables store chains of hashes using reduction functions <em>R(hash) → plaintext</em>. A chain of length <em>K</em> computes: <code className="bg-teal-500/20 px-1 rounded font-mono">P₀ → H(P₀) → R₁(H₀) → P₁ ... → H(Pₖ)</code>. Storing only the pair <code className="bg-teal-500/20 px-1 rounded font-mono">(P₀, H(Pₖ))</code> reduces disk storage requirements by a factor of <em>K</em>!
              </p>
            </div>

            {/* TABLE LIST GRID */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/50">
              <div className="grid grid-cols-12 gap-2 p-3 bg-zinc-100 dark:bg-zinc-900 font-semibold text-xs text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-4">Plaintext Password</div>
                <div className="col-span-6">Precomputed Hash ({algorithm.toUpperCase()})</div>
                <div className="col-span-1 text-right">Copy</div>
              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80 max-h-96 overflow-y-auto">
                {tableEntries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500">
                    No matching password or hash found for "{tableSearch}".
                  </div>
                ) : (
                  tableEntries.map((entry, idx) => (
                    <div
                      key={entry.plaintext}
                      className="grid grid-cols-12 gap-2 p-3 text-xs items-center hover:bg-teal-500/5 transition-colors font-mono"
                    >
                      <div className="col-span-1 text-center text-zinc-400 font-sans">{idx + 1}</div>
                      <div className="col-span-4 font-bold text-zinc-900 dark:text-white truncate">
                        {entry.plaintext}
                      </div>
                      <div className="col-span-6 text-zinc-600 dark:text-zinc-400 text-[11px] truncate">
                        {entry.hash}
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          onClick={() => handleCopy(entry.hash, `hash-${entry.plaintext}`)}
                          className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                          title="Copy Hash"
                        >
                          {copiedKey === `hash-${entry.plaintext}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SALTING DEFENSE MATRIX */}
        {activeTab === "salting" && (
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Cryptographic Salting Defense Breakdown
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Explore how random salts modify hash values and neutralize offline rainbow table precomputations.
              </p>
            </div>

            {/* SALT GENERATOR CONTROLS */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Input Password
                  </label>
                  <input
                    type="text"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Random Salt Value
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customSalt}
                      onChange={(e) => setCustomSalt(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono text-emerald-600 dark:text-emerald-400"
                    />
                    <button
                      onClick={handleGenerateNewSalt}
                      className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors text-zinc-700 dark:text-zinc-300"
                      title="Generate New Salt"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Update Calculation
                  </label>
                  <button
                    onClick={() => handleLookup()}
                    className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Re-Evaluate Salting Defense
                  </button>
                </div>
              </div>
            </div>

            {/* SIDE BY SIDE COMPARISON */}
            {saltedResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* WITHOUT SALT */}
                <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
                    <span className="font-bold text-sm text-red-700 dark:text-red-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Unsalted Password Hash
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-700 dark:text-red-300">
                      Vulnerable
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-zinc-500 font-medium">Plaintext:</span>
                      <p className="font-mono bg-white dark:bg-zinc-900 p-2 rounded border border-red-500/20 mt-1 text-zinc-900 dark:text-white">
                        "{saltedResult.password}"
                      </p>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-medium">Computed Unsalted Hash:</span>
                      <div className="flex items-center gap-2 font-mono bg-white dark:bg-zinc-900 p-2 rounded border border-red-500/20 mt-1 text-red-700 dark:text-red-300 break-all">
                        <span className="flex-1 text-[11px]">{saltedResult.unsaltedHash}</span>
                        <button
                          onClick={() => handleCopy(saltedResult.unsaltedHash, "unsalted")}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        >
                          {copiedKey === "unsalted" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-900 dark:text-red-200 text-[11px] leading-relaxed">
                      ⚠️ <strong>Vulnerability Impact:</strong> This exact hash is identical across all users with the same password and exists in public precomputed rainbow tables globally. Password is cracked in milliseconds.
                    </div>
                  </div>
                </div>

                {/* WITH SALT */}
                <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                    <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Salted Password Hash
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      Protected
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-zinc-500 font-medium">Salt + Plaintext Input:</span>
                      <p className="font-mono bg-white dark:bg-zinc-900 p-2 rounded border border-emerald-500/20 mt-1 text-emerald-600 dark:text-emerald-400 truncate">
                        "{saltedResult.salt}" + "{saltedResult.password}"
                      </p>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-medium">Unique Salted Hash:</span>
                      <div className="flex items-center gap-2 font-mono bg-white dark:bg-zinc-900 p-2 rounded border border-emerald-500/20 mt-1 text-emerald-700 dark:text-emerald-300 break-all">
                        <span className="flex-1 text-[11px]">{saltedResult.saltedHash}</span>
                        <button
                          onClick={() => handleCopy(saltedResult.saltedHash, "salted")}
                          className="p-1 hover:bg-emerald-500/20 rounded transition-colors"
                        >
                          {copiedKey === "salted" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 text-[11px] leading-relaxed">
                      ✓ <strong>Protection Impact:</strong> The salt creates a unique hash value. Attackers cannot use precomputed tables and must fall back to slow per-salt brute-force attacks.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MATHEMATICAL PROOF BOX */}
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-900 dark:text-amber-200 text-xs space-y-1.5 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                <Lock className="w-4 h-4 shrink-0" /> Mathematical Entropy & Storage Scaling Proof:
              </p>
              <p>
                A standard 128-bit random salt yields 2<sup>128</sup> ≈ 3.4 × 10<sup>38</sup> possible salt values. To attack salted hashes with rainbow tables, an adversary must generate a distinct precomputed table for <em>every possible salt</em>. Storing 3.4 × 10<sup>38</sup> tables is physically impossible, requiring more storage than all digital media combined.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CrosshairIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
  );
}