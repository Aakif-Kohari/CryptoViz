import WorkspaceLayout from '@/components/layout/WorkspaceLayout'

export default function CipherVisualizerLoading() {
  return (
    <WorkspaceLayout>
      <div
        className="min-w-0 flex-1 bg-white dark:bg-zinc-900/10"
        aria-label="Loading cipher visualizer"
      >
        <div role="status" className="sr-only">
          <span>Loading cipher visualizer workspace...</span>
        </div>

        {/* Visualizer Workspace Skeleton */}
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8 space-y-8">
          {/* Header Banner Skeleton */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-48 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-teal-500/20 animate-pulse" />
            </div>
            <div className="h-4 w-full sm:w-3/4 rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse" />
          </div>

          {/* Interactive Input/Controls Panel Skeleton */}
          <div className="h-56 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50 animate-pulse" />

          {/* Step Evolution / Animation Panel Skeleton */}
          <div className="h-80 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 animate-pulse" />
        </div>
      </div>
    </WorkspaceLayout>
  )
}
