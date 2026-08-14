import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/footer'

export default function CipherSandboxLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-[#060816] dark:text-white transition-colors duration-300">
      <Navbar />

      <main
        id="main-content"
        aria-label="Loading cipher sandbox"
        className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12"
      >
        <div role="status" className="sr-only">
          <span>Loading cipher sandbox environment...</span>
        </div>

        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <span className="text-zinc-400">/</span>
          <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>

        {/* Hero Header Skeleton */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent p-8 sm:p-12 backdrop-blur-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="h-6 w-64 rounded-full bg-teal-500/20 dark:bg-teal-500/30 animate-pulse" />
            <div className="h-10 w-3/4 sm:w-2/3 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-5 w-full sm:w-5/6 rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse" />
          </div>
        </section>

        {/* Sandbox Workspace Grid Skeleton */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8" aria-label="Loading sandbox builder">
          <div className="lg:col-span-5 h-[500px] rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/60 animate-pulse" />
          <div className="lg:col-span-7 h-[500px] rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 animate-pulse" />
        </section>

        {/* Educational Section Skeleton */}
        <section className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/60 space-y-6">
          <div className="h-8 w-80 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 animate-pulse"
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
