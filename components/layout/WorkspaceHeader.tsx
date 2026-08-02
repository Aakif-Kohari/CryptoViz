'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { CIPHER_REGISTRY } from '../../lib/cipher/registry'

interface WorkspaceHeaderProps {
  activeCipherId?: string
}

export default function WorkspaceHeader({ activeCipherId }: WorkspaceHeaderProps) {
  const pathname = usePathname()
  
  const cipher = activeCipherId 
    ? CIPHER_REGISTRY.find(c => c.id === activeCipherId)
    : undefined

  // Compute links with query parameters if a cipher is active
  const compareHref = activeCipherId ? `/compare?left=${activeCipherId}` : '/compare'
  const benchmarkHref = activeCipherId ? `/benchmark?algorithms=${activeCipherId}` : '/benchmark'
  const challengeHref = activeCipherId ? `/challenge?cipher=${activeCipherId}` : '/challenge'

  return (
    <header className="border-b border-zinc-200 bg-white/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-[88px] z-40 backdrop-blur-md">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
          Workspace
        </h2>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          {cipher ? cipher.name : 'Crypto Workspace'}
        </h1>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={compareHref}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors border ${
            pathname.startsWith('/compare')
              ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-900/50'
              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
          }`}
        >
          Compare Algorithms
        </Link>
        <Link
          href={benchmarkHref}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors border ${
            pathname.startsWith('/benchmark')
              ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-900/50'
              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
          }`}
        >
          Benchmark Performance
        </Link>
        <Link
          href={challengeHref}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors border ${
            pathname.startsWith('/challenge')
              ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-900/50'
              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
          }`}
        >
          Start Challenge
        </Link>
      </div>
    </header>
  )
}
