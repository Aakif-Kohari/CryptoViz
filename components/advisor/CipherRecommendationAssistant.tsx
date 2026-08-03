'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  USE_CASE_PRESETS,
  recommendCiphersByUseCase,
  SecurityGoal,
  TargetEnvironment,
  UseCasePreset,
} from '@/lib/advisor/useCaseRecommendationEngine'
import DecisionTree from './DecisionTree'
import {
  Sparkles,
  Search,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Code,
  Terminal,
  Cpu,
  Lock,
  Layers,
  Zap,
  Filter,
  Check,
  ExternalLink,
} from 'lucide-react'

export default function CipherRecommendationAssistant() {
  const [activeTab, setActiveTab] = useState<'use_cases' | 'wizard'>('use_cases')
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [goal, setGoal] = useState<SecurityGoal>('all')
  const [environment, setEnvironment] = useState<TargetEnvironment>('all')
  const [onlyRecommended, setOnlyRecommended] = useState<boolean>(false)
  const [selectedCodeTab, setSelectedCodeTab] = useState<Record<string, 'js' | 'python'>>({})
  const [expandedCodeCipherId, setExpandedCodeCipherId] = useState<string | null>(null)

  // Handle Preset Selection
  const handleSelectPreset = (preset: UseCasePreset) => {
    if (selectedPresetId === preset.id) {
      setSelectedPresetId(null)
      setGoal('all')
      setEnvironment('all')
    } else {
      setSelectedPresetId(preset.id)
      setGoal(preset.goal)
      setEnvironment(preset.environment)
    }
  }

  // Filter & Score Recommendations
  const recommendations = useMemo(() => {
    return recommendCiphersByUseCase({
      goal,
      environment,
      searchQuery,
      onlyRecommended,
    })
  }, [goal, environment, searchQuery, onlyRecommended])

  return (
    <div className="space-y-10">
      {/* Mode Navigation Tabs */}
      <div className="flex justify-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <nav className="inline-flex rounded-2xl border border-zinc-200 bg-zinc-100 p-1.5 dark:border-zinc-800 dark:bg-zinc-900" aria-label="Advisor modes">
          <button
            onClick={() => setActiveTab('use_cases')}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === 'use_cases'
                ? 'bg-white text-teal-600 shadow-sm dark:bg-zinc-800 dark:text-teal-400'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Use Case Explorer & Recommender
          </button>

          <button
            onClick={() => setActiveTab('wizard')}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === 'wizard'
                ? 'bg-white text-teal-600 shadow-sm dark:bg-zinc-800 dark:text-teal-400'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            Decision Tree Wizard
          </button>
        </nav>
      </div>

      {activeTab === 'wizard' ? (
        <DecisionTree />
      ) : (
        <div className="space-y-10">
          {/* Quick Use Case Preset Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                Select a Common Use Case Scenario
              </h2>
              {selectedPresetId && (
                <button
                  onClick={() => {
                    setSelectedPresetId(null)
                    setGoal('all')
                    setEnvironment('all')
                  }}
                  className="text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400"
                >
                  Clear Preset Selection
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {USE_CASE_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 space-y-3 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500/10 shadow-md dark:border-teal-400 dark:bg-teal-950/40'
                        : 'border-zinc-200 bg-white hover:border-teal-500/50 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-teal-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{preset.icon}</span>
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {preset.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        {preset.title}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {preset.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-300"
                        >
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Filter & Search Bar */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/80 shadow-sm space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search algorithms (e.g. AES, Argon2, RSA)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm font-medium text-zinc-900 focus:border-teal-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as SecurityGoal)}
                  className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="all">Goal: All Security Goals</option>
                  <option value="confidentiality">Encryption / Confidentiality</option>
                  <option value="password">Password Hashing</option>
                  <option value="signature">Digital Signatures</option>
                  <option value="post_quantum">Post-Quantum Cryptography</option>
                </select>

                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as TargetEnvironment)}
                  className="rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="all">Env: All Environments</option>
                  <option value="web_server">Web Server & APIs</option>
                  <option value="iot_embedded">IoT & Embedded (No AES-NI)</option>
                  <option value="database">Database & File Storage</option>
                  <option value="quantum_safe">Post-Quantum Systems</option>
                </select>

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyRecommended}
                    onChange={(e) => setOnlyRecommended(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                  />
                  Only Recommended
                </label>
              </div>
            </div>
          </section>

          {/* Recommendation Results List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Recommended Algorithms ({recommendations.length})
              </h2>
            </div>

            {recommendations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
                <Filter className="mx-auto h-8 w-8 text-zinc-400" />
                <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  No algorithms match your active filters. Try resetting search parameters.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {recommendations.map(({ cipher, matchScore, badgeLabel, rationale, tradeOffs, bestFor, sampleCode }) => {
                  const isCodeExpanded = expandedCodeCipherId === cipher.id
                  const activeLang = selectedCodeTab[cipher.id] || 'js'

                  return (
                    <div
                      key={cipher.id}
                      className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/90 shadow-sm transition-all space-y-5"
                    >
                      {/* Header */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold">
                            {matchScore}%
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                                {cipher.name}
                              </h3>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                                  cipher.securityStatus === 'recommended'
                                    ? 'bg-teal-500/10 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                                    : cipher.securityStatus === 'secure'
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : cipher.securityStatus === 'legacy'
                                    ? 'bg-amber-500/10 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                    : 'bg-red-500/10 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                                }`}
                              >
                                {cipher.securityStatus}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-400 font-medium">
                              Category: {cipher.category.toUpperCase()} • {badgeLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/visualizer/${cipher.id}/`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/40 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/50"
                          >
                            Explore Visualizer
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            onClick={() =>
                              setExpandedCodeCipherId(isCodeExpanded ? null : cipher.id)
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                          >
                            <Code className="h-3.5 w-3.5" />
                            {isCodeExpanded ? 'Hide Code' : 'View Code'}
                          </button>
                        </div>
                      </div>

                      {/* Rationale & Trade-offs */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-xs leading-relaxed">
                        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/60 space-y-1">
                          <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-teal-500" />
                            Why Recommended:
                          </h4>
                          <p className="text-zinc-600 dark:text-zinc-300">{rationale}</p>
                        </div>

                        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/60 space-y-1">
                          <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                            <ShieldAlert className="h-4 w-4 text-amber-500" />
                            Trade-offs & Considerations:
                          </h4>
                          <p className="text-zinc-600 dark:text-zinc-300">{tradeOffs}</p>
                        </div>
                      </div>

                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        <strong>Best used for:</strong> {bestFor}
                      </div>

                      {/* Expandable Code Snippets Drawer */}
                      {isCodeExpanded && (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3 font-mono text-xs">
                          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                            <div className="flex items-center gap-2">
                              <Terminal className="h-4 w-4 text-teal-400" />
                              <span className="font-bold text-white">Implementation Example</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setSelectedCodeTab({ ...selectedCodeTab, [cipher.id]: 'js' })
                                }
                                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                                  activeLang === 'js'
                                    ? 'bg-teal-500/20 text-teal-300'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                              >
                                JavaScript
                              </button>
                              <button
                                onClick={() =>
                                  setSelectedCodeTab({ ...selectedCodeTab, [cipher.id]: 'python' })
                                }
                                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                                  activeLang === 'python'
                                    ? 'bg-teal-500/20 text-teal-300'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                              >
                                Python
                              </button>
                            </div>
                          </div>

                          <pre className="overflow-x-auto text-teal-300 p-2 leading-relaxed">
                            {activeLang === 'js' ? sampleCode.javascript : sampleCode.python}
                          </pre>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
