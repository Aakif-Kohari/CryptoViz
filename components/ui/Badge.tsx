interface SecurityBadgeProps {
  status?: string
}

export function SecurityBadge({ status = 'moderate' }: SecurityBadgeProps) {
  const config: Record<string, { label: string; className: string }> = {
    secure: {
      label: 'Secure',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    recommended: {
      label: 'Recommended',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    moderate: {
      label: 'Moderate',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    weak: {
      label: 'Weak',
      className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    },
    experimental: {
      label: 'Experimental',
      className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    },
    legacy: {
      label: 'Legacy',
      className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    },
    deprecated: {
      label: 'Deprecated',
      className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    },
    broken: {
      label: 'Broken',
      className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    },
  }

  const badge = config[status] ?? config.moderate

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
      {badge.label}
    </span>
  )
}
