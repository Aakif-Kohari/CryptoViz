'use client'

import Link from 'next/link'
import Navbar from '../layout/Navbar'
import { CASE_STUDIES, type CaseStudy } from '../../lib/case-studies/data'

interface Props {
  study: CaseStudy
}

export default function CaseStudyDetail({ study }: Props) {
  const currentIndex = CASE_STUDIES.findIndex((s) => s.id === study.id)
  const prevStudy = CASE_STUDIES[currentIndex - 1] || CASE_STUDIES[CASE_STUDIES.length - 1]
  const nextStudy = CASE_STUDIES[currentIndex + 1] || CASE_STUDIES[0]

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Navigation Back */}
        <div className="mb-6">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
          >
            ← Back to Case Studies Hub
          </Link>
        </div>

        {/* Article Header */}
        <article className="space-y-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-10">
          <header className="space-y-4 border-b border-zinc-100 pb-8 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-600 dark:bg-teal-400/10 dark:text-teal-400">
                {study.category}
              </span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                Year: {study.year}
              </span>
              <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:bg-rose-400/10 dark:text-rose-400">
                Severity: {study.severity}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              {study.title}
            </h1>

            <p className="text-lg font-medium text-zinc-600 dark:text-zinc-300">
              {study.subtitle}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {study.affectedAlgorithms.map((algo) => (
                <span
                  key={algo}
                  className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  #{algo}
                </span>
              ))}
            </div>
          </header>

          {/* Overview & Impact */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Incident Overview
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              {study.summary}
            </p>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 dark:border-rose-900/40 dark:bg-rose-950/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Real-World Impact
              </h3>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-rose-900 dark:text-rose-200">
                {study.impact}
              </p>
            </div>
          </section>

          {/* Technical Root Cause */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Technical Root Cause Analysis
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              {study.rootCause}
            </p>

            <ul className="space-y-2.5 pl-2">
              {study.technicalBreakdown.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Code or Math Snippet */}
          {study.codeSnippet && (
            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {study.codeSnippet.title}
              </h3>
              <pre className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-xs font-mono leading-relaxed text-zinc-100">
                <code>{study.codeSnippet.code}</code>
              </pre>
            </section>
          )}

          {/* Key Timeline */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Incident Timeline
            </h2>
            <div className="space-y-3">
              {study.timeline.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-3.5 dark:border-zinc-800/60 dark:bg-zinc-900/60"
                >
                  <span className="rounded-lg bg-teal-500/10 px-2.5 py-1 text-xs font-bold text-teal-600 dark:bg-teal-400/10 dark:text-teal-400">
                    {t.year}
                  </span>
                  <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {t.event}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Takeaways & Defensive Guidance */}
          <section className="rounded-2xl border border-teal-200 bg-teal-50/50 p-6 dark:border-teal-900/40 dark:bg-teal-950/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Key Engineering Takeaway & Defensive Guidance
            </h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-teal-950 dark:text-teal-200">
              {study.keyTakeaway}
            </p>
          </section>

          {/* Prev / Next Footer */}
          <footer className="flex items-center justify-between border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <Link
              href={`/case-studies/${prevStudy.id}`}
              className="text-xs font-bold text-zinc-500 hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
            >
              ← {prevStudy.title}
            </Link>

            <Link
              href={`/case-studies/${nextStudy.id}`}
              className="text-xs font-bold text-zinc-500 hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
            >
              {nextStudy.title} →
            </Link>
          </footer>
        </article>
      </main>
    </div>
  )
}
