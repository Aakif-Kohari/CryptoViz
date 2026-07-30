"use client"

import { useMemo, useState } from "react"
import {
  DEFAULT_VIDEO_LIBRARY_FILTER,
  buildVideoLibraryManualChecklist,
  buildVideoLibraryResult,
  type VideoDifficulty,
  type VideoLibraryFilter,
} from "../../lib/resources/cryptographyVideoLibrary"

export default function CryptographyVideoLibrary() {
  const [filters, setFilters] = useState<VideoLibraryFilter>(DEFAULT_VIDEO_LIBRARY_FILTER)

  const result = useMemo(() => buildVideoLibraryResult(filters), [filters])
  const manualChecklist = buildVideoLibraryManualChecklist()

  function updateFilter<K extends keyof VideoLibraryFilter>(key: K, value: VideoLibraryFilter[K]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
          <div className="relative isolate px-6 py-10 sm:px-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_32%)]" />
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Learning resources
            </p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Curated Cryptography Video Library
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                  Browse educational cryptography videos by topic, difficulty, and tag.
                  Use embedded previews to decide what to watch before leaving CryptoViz.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <Metric label="Videos" value={result.summary.total} />
                <Metric label="Beginner" value={result.summary.beginner} />
                <Metric label="Intermediate" value={result.summary.intermediate} />
                <Metric label="Advanced" value={result.summary.advanced} />
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black text-white">Filters</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Narrow the library by topic, difficulty, tag, or keyword.
            </p>

            <label className="mt-6 block text-sm font-bold text-slate-200">Search</label>
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search RSA, hashing, side channels..."
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 placeholder:text-slate-600 focus:ring-2"
            />

            <label className="mt-5 block text-sm font-bold text-slate-200">Topic</label>
            <select
              value={filters.topic}
              onChange={(event) => updateFilter("topic", event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
            >
              {result.topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>

            <label className="mt-5 block text-sm font-bold text-slate-200">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(event) =>
                updateFilter("difficulty", event.target.value as VideoLibraryFilter["difficulty"])
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
            >
              {result.difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>

            <label className="mt-5 block text-sm font-bold text-slate-200">Tag</label>
            <select
              value={filters.tag}
              onChange={(event) => updateFilter("tag", event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring-2"
            >
              {result.tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setFilters(DEFAULT_VIDEO_LIBRARY_FILTER)}
              className="mt-6 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-100"
            >
              Reset filters
            </button>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Featured preview</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {result.featuredVideo
                    ? result.featuredVideo.title
                    : "No video matches the selected filters."}
                </p>
              </div>
              <p className="text-sm font-bold text-cyan-100">
                {result.videos.length} result{result.videos.length === 1 ? "" : "s"}
              </p>
            </div>

            {result.featuredVideo ? (
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                <div className="aspect-video">
                  <iframe
                    className="h-full w-full"
                    src={result.featuredVideo.embedUrl}
                    title={result.featuredVideo.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="p-5">
                  <p className="text-xl font-black text-white">{result.featuredVideo.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {result.featuredVideo.description}
                  </p>
                  <a
                    href={result.featuredVideo.watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-xl border border-cyan-300/40 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/10"
                  >
                    Watch externally
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm text-amber-100">
                No videos match these filters. Reset filters or try a broader search.
              </div>
            )}
          </section>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black text-white">Video cards</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Each card includes tags, topic, difficulty, an embedded preview, and the suggested learning use case.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {result.videos.map((video) => (
              <article key={video.id} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
                <div className="aspect-video bg-slate-950">
                  <iframe
                    className="h-full w-full"
                    src={video.embedUrl}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                        {video.topic}
                      </p>
                      <h3 className="mt-2 text-xl font-black text-white">{video.title}</h3>
                    </div>
                    <DifficultyBadge difficulty={video.difficulty} />
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-300">{video.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {video.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => updateFilter("tag", tag)}
                        className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-bold text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-100"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm leading-6 text-slate-400">
                    <span className="font-bold text-slate-200">Best for:</span>{" "}
                    {video.recommendedFor}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-400">{video.duration}</span>
                    <a
                      href={video.watchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-cyan-100 hover:text-cyan-200"
                    >
                      Open video
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black text-white">Manual testing checklist</h2>
          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            {manualChecklist.map((item, index) => (
              <li key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm leading-6 text-slate-300">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-slate-950">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function DifficultyBadge({ difficulty }: { difficulty: VideoDifficulty }) {
  const className =
    difficulty === "Advanced"
      ? "border-red-300/40 bg-red-300/10 text-red-100"
      : difficulty === "Intermediate"
        ? "border-amber-300/40 bg-amber-300/10 text-amber-100"
        : "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"

  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-black ${className}`}>
      {difficulty}
    </span>
  )
}
