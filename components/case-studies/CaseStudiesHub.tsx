'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '../layout/Navbar'
import {
  CASE_STUDIES,
  type CaseStudyCategory,
  type CaseStudySeverity,
} from '../../lib/case-studies/data'

const CATEGORY_LABELS: Record<CaseStudyCategory | 'All', string> = {
  All: 'All Categories',
  'RNG Flaw': 'RNG Flaws',
  'Implementation Bug': 'Implementation Bugs',
  'Cryptanalytic Attack': 'Cryptanalysis',
  'Malware / Ransomware': 'Malware & Ransomware',
  'CA / PKI Compromise': 'CA & PKI Breaches',
  'Nonce Reuse': 'Nonce Reuse',
}

const SEVERITY_BADGES: Record<CaseStudySeverity, { bg: string }> = {
  Critical: {
    bg: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
  },
  High: {
    bg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
  },
  Medium: {
    bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  },
  Historical: {
    bg: 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400',
  },
}


export default function CaseStudiesHub() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] =
    useState<CaseStudyCategory | 'All'>('All')
  const [selectedSeverity, setSelectedSeverity] =
    useState<CaseStudySeverity | 'All'>('All')

  const filteredStudies = useMemo(() => {
    return CASE_STUDIES.filter((study) => {
      if (selectedCategory !== 'All' && study.category !== selectedCategory) {
        return false
      }
      if (selectedSeverity !== 'All' && study.severity !== selectedSeverity) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = study.title.toLowerCase().includes(q)
        const matchSub = study.subtitle.toLowerCase().includes(q)
        const matchDesc = study.summary.toLowerCase().includes(q)
        const matchCat = study.category.toLowerCase().includes(q)
        const matchYear = study.year.toString().includes(q)
        const matchAlgos = study.affectedAlgorithms.some((a) =>
          a.toLowerCase().includes(q),
        )
        if (!matchTitle && !matchSub && !matchDesc && !matchCat && !matchYear && !matchAlgos) {
          return false
        }
      }
      return true
    })
  }, [selectedCategory, selectedSeverity, searchQuery])

  const criticalCount = useMemo(
    () => CASE_STUDIES.filter((s) => s.severity === 'Critical').length,
    [],
  )

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedSeverity('All')
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-teal-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:bg-teal-400/10 dark:text-teal-400">
              REAL-WORLD ANALYSIS
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Security Failures & Historical Breaches
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Cryptographic Case Studies
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Deep-dive technical breakdowns of famous real-world cryptographic failures, implementation vulnerabilities, PRNG collapses, PKI compromises, and historical cryptanalysis milestones.
          </p>

          {/* Metrics Banner */}
          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4 lg:max-w-4xl">
            <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Case Studies</div>
              <div className="mt-1 text-2xl font-black text-teal-600 dark:text-teal-400">{CASE_STUDIES.length}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Critical Incidents</div>
              <div className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">{criticalCount}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Historical Milestones</div>
              <div className="mt-1 text-2xl font-black text-cyan-600 dark:text-cyan-400">WWII - Modern</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Attack Domains</div>
              <div className="mt-1 text-2xl font-black text-zinc-900 dark:text-white">6 Categories</div>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <section className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40" aria-label="Search and Filter Case Studies">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative min-w-0 flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <svg className="h-4 w-4 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case studies by name, vulnerability (e.g. Heartbleed, PS3, Enigma, OpenSSL)..."
                aria-label="Search case studies"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-10 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500 dark:focus:border-teal-400 dark:focus:bg-zinc-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="severity-filter" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Severity:
              </label>
              <select
                id="severity-filter"
                aria-label="Filter by severity"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as CaseStudySeverity | 'All')}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-800 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Historical">Historical</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800" role="tablist" aria-label="Case Study Categories">
            {(Object.keys(CATEGORY_LABELS) as (CaseStudyCategory | 'All')[]).map((cat) => {
              const isActive = selectedCategory === cat
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/30 dark:bg-teal-400 dark:text-zinc-950'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              )
            })}
          </div>
        </section>

        {/* Results Info */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {selectedCategory === 'All' ? 'All Case Studies' : CATEGORY_LABELS[selectedCategory]}
          </h2>

          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Showing <span className="font-bold text-teal-600 dark:text-teal-400">{filteredStudies.length}</span> case studies
          </div>
        </div>

        {/* Cards Grid */}
        {filteredStudies.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudies.map((study) => {
              const severityStyle = SEVERITY_BADGES[study.severity]

              return (
                <article
                  key={study.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-teal-700"
                >
                  <div>
                    {/* Header: Title + Year */}
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/case-studies/${study.id}`}
                        className="min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                      >
                        <h3 className="text-lg font-bold text-zinc-900 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                          {study.title}
                        </h3>
                      </Link>

                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {study.year}
                      </span>
                    </div>

                    {/* Subtitle */}
                    <p className="mt-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {study.subtitle}
                    </p>

                    {/* Badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${severityStyle.bg}`}
                      >
                        {study.severity}
                      </span>

                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {study.category}
                      </span>
                    </div>

                    {/* Impact summary */}
                    <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {study.impact}
                    </p>

                    {/* Affected algorithms */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {study.affectedAlgorithms.map((algo) => (
                        <span
                          key={algo}
                          className="rounded-md bg-zinc-50 border border-zinc-200/80 px-2 py-0.5 text-[11px] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
                        >
                          #{algo}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
                    <Link
                      href={`/case-studies/${study.id}`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-teal-600 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
                    >
                      Read Full Technical Analysis →
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/20">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              No case studies found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              No case studies match your current search query "{searchQuery}" or selected category/severity.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 dark:bg-teal-400 dark:text-zinc-950 dark:hover:bg-teal-300"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
