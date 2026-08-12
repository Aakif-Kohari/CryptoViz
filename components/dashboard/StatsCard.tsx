import { type LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  accent?: boolean
}

export default function StatsCard({ label, value, sub, icon: Icon, accent }: StatsCardProps) {
  return (
    <div className={`relative rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${accent ? 'border-teal-500/30 bg-teal-500/5 dark:bg-teal-500/10' : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className={`mt-2 text-3xl font-bold tabular-nums ${accent ? 'text-teal-500' : 'text-zinc-900 dark:text-zinc-50'}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${accent ? 'bg-teal-500/15' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
          <Icon size={18} className={accent ? 'text-teal-500' : 'text-zinc-500 dark:text-zinc-400'} />
        </div>
      </div>
    </div>
  )
}
