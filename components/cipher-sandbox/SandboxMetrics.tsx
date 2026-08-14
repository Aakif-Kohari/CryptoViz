import type { CipherResult } from '../../lib/cipher/types'

interface SandboxMetricsProps {
  result: CipherResult | null
}

export default function SandboxMetrics({ result }: SandboxMetricsProps) {
  if (!result) {
    return null
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
      <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Execution Metrics
      </span>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Duration</span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">
            {result.durationMs !== undefined ? `${result.durationMs.toFixed(2)} ms` : 'N/A'}
          </span>
        </div>
        {result.steps && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Steps</span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300">
              {result.steps.length}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
