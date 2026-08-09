import type { CipherDefinition } from '../../lib/cipher/registry'
import type { CipherResult } from '../../lib/cipher/types'

interface SandboxTraceProps {
  activeTab: "result" | "history"
  setActiveTab: (tab: "result" | "history") => void
  cipher: CipherDefinition
  result: CipherResult | null
  loading: boolean
}

export default function SandboxTrace({
  activeTab,
  setActiveTab,
  cipher,
  result,
  loading,
}: SandboxTraceProps) {
  return (
    <>
      <div className="flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800/80">
        <button
          onClick={() => setActiveTab("result")}
          className={`flex-1 rounded-md py-1.5 text-center text-xs font-semibold transition-all duration-200 active:scale-95 ${
            activeTab === "result"
              ? "bg-white text-zinc-950 shadow dark:bg-zinc-900 dark:text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          Result
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 rounded-md py-1.5 text-center text-xs font-semibold transition-all duration-200 active:scale-95 ${
            activeTab === "history"
              ? "bg-white text-zinc-950 shadow dark:bg-zinc-900 dark:text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          History
        </button>
      </div>

      {activeTab === "result" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <span className="text-2xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {cipher.category === "hash"
              ? "Generated Hash Digest"
              : "Output Result"}
          </span>
          <div className="mt-2 min-h-[48px] rounded-lg bg-zinc-50 p-3 font-mono text-sm leading-relaxed break-all text-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200">
            {loading ? (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-teal-500" />
                Computing...
              </span>
            ) : result ? (
              result.output
            ) : (
              <span className="flex flex-col gap-1">
                <span className="italic text-zinc-400">No output yet</span>
                <span className="text-xs text-zinc-400/70 not-italic">
                  Run a computation to see the encrypted / decrypted result.
                </span>
              </span>
            )}
          </div>
          {result && result.durationMs !== undefined && (
            <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
              <span>Off-thread Execution time</span>
              <span className="font-mono">
                {result.durationMs.toFixed(2)} ms
              </span>
            </div>
          )}
        </div>
      )}
    </>
  )
}
