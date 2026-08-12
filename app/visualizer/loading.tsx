import Navbar from '../../components/layout/Navbar'

export default function VisualizerLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />

      <main
        aria-label="Loading visualizers"
        className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8"
      >
        {/* Status element for accessibility */}
        <div role="status" className="sr-only">
          <span>Loading visualizers hub...</span>
        </div>

        {/* Hero Header Skeleton */}
        <header className="max-w-3xl space-y-3">
          <div className="h-4 w-36 rounded-full bg-teal-500/20 dark:bg-teal-500/30 animate-pulse" />
          <div className="h-10 w-3/4 sm:w-2/3 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-full sm:w-5/6 rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse" />
        </header>

        {/* Pinned Ciphers Section Skeleton */}
        <section className="space-y-4" aria-label="Loading pinned ciphers">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-6 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="h-5 w-16 rounded-full bg-teal-500/20 animate-pulse" />
                  </div>
                  <div className="h-6 w-3/4 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="space-y-2 pt-2">
                    <div className="h-3 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
                    <div className="h-3 w-4/5 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Discovery Flow Section Skeleton */}
        <section className="space-y-6 pt-4" aria-label="Loading discovery flow">
          <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-9 w-28 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60 animate-pulse"
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
