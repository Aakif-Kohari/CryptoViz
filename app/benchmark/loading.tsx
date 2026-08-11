import WorkspaceLayout from '@/components/layout/WorkspaceLayout'

export default function BenchmarkLoading() {
  return (
    <WorkspaceLayout>
      <main
        aria-label="Loading benchmark workspace"
        className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8"
      >
        <div role="status" className="sr-only">
          <span>Loading performance benchmark workspace...</span>
        </div>

        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <span className="text-zinc-400">/</span>
          <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>

        {/* Header Skeleton */}
        <header className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="h-8 w-full sm:w-3/4 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="h-4 w-5/6 rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse" />
            </div>
            <div className="h-10 w-44 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse" />
          </div>
        </header>

        {/* Category Tabs Skeleton */}
        <section className="space-y-4" aria-label="Loading algorithm categories">
          <div className="h-6 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 w-24 sm:w-28 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse"
              />
            ))}
          </div>
        </section>

        {/* Select Algorithms Grid Skeleton */}
        <section className="space-y-4" aria-label="Loading algorithms selection">
          <div className="h-6 w-60 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse"
              />
            ))}
          </div>
        </section>

        {/* Benchmark Configuration & Hardware Info Grid */}
        <section className="space-y-4" aria-label="Loading benchmark configuration">
          <div className="h-6 w-52 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-64 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse" />
            <div className="h-64 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse" />
          </div>
        </section>
      </main>
    </WorkspaceLayout>
  )
}
