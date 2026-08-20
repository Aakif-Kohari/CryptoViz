import React from 'react'
import type { CipherDefinition, CipherOptionValue } from '@/lib/cipher/registry'

interface CipherOptionsPanelProps {
  cipher: CipherDefinition
  optionsState: Record<string, CipherOptionValue>
  onChange: (optionId: string, value: CipherOptionValue) => void
}

export function CipherOptionsPanel({
  cipher,
  optionsState,
  onChange,
}: CipherOptionsPanelProps) {
  if (!cipher.options || cipher.options.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Algorithm Parameters &amp; Options
      </h3>
      <div className="flex flex-col gap-3">
        {cipher.options.map((opt) => {
          const val = optionsState[opt.id] ?? opt.default

          if (opt.type === 'boolean') {
            return (
              <div
                key={opt.id}
                className="flex items-center justify-between border-t border-zinc-100 pt-2.5 first:border-0 first:pt-0 dark:border-zinc-800/60"
              >
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {opt.name}
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(val)}
                  onChange={(e) => onChange(opt.id, e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>
            )
          }

          if (opt.type === 'select') {
            return (
              <div key={opt.id} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {opt.name}
                </label>
                <select
                  value={String(val)}
                  onChange={(e) => {
                    const rawVal = e.target.value
                    // If default is number, cast back to number
                    const parsedVal =
                      typeof opt.default === 'number' ? Number(rawVal) : rawVal
                    onChange(opt.id, parsedVal)
                  }}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 font-mono text-xs text-zinc-900 outline-none transition-all focus:border-teal-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-teal-400"
                >
                  {opt.choices?.map((c) => (
                    <option key={String(c.value)} value={String(c.value)}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          }

          if (opt.type === 'number') {
            return (
              <div key={opt.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {opt.name}
                  </label>
                  <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                    {String(val)}
                  </span>
                </div>
                <input
                  type="number"
                  value={Number(val)}
                  onChange={(e) => onChange(opt.id, Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 font-mono text-xs text-zinc-900 outline-none transition-all focus:border-teal-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-teal-400"
                />
              </div>
            )
          }

          // text
          return (
            <div key={opt.id} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {opt.name}
              </label>
              <input
                type="text"
                value={String(val)}
                onChange={(e) => onChange(opt.id, e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 font-mono text-xs text-zinc-900 outline-none transition-all focus:border-teal-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-teal-400"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
