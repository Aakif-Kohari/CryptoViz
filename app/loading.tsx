import Navbar from '@/components/layout/Navbar'

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <main
        aria-label="Loading content"
        className="flex-1 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center justify-center"
      >
        <div role="status" className="flex flex-col items-center space-y-4 text-center">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
          </div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 animate-pulse">
            Loading CryptoViz...
          </p>
          <span className="sr-only">Loading page content...</span>
        </div>
      </main>
    </div>
  )
}
