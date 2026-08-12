'use client';

import React from 'react';
import type { CipherDefinition } from '@/lib/cipher/registry';

export type SecurityStatus = CipherDefinition['securityStatus'];

// ─── Visual Configuration ──────────────────────────────────────────────────

interface BadgeConfig {
  label: string;
  /** Tailwind colour classes applied to the badge pill */
  className: string;
  /** Short prose shown inside tooltips / info popovers */
  description: string;
  /** Icon symbol (emoji kept dependency-free for the badge itself) */
  icon: string;
}

export const BADGE_CONFIG: Record<SecurityStatus, BadgeConfig> = {
  recommended: {
    label: 'Recommended',
    icon: '✦',
    description:
      'Actively recommended by NIST or equivalent standards bodies for new systems.',
    className:
      'border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
  },
  secure: {
    label: 'Secure',
    icon: '●',
    description:
      'No known practical attacks. Suitable for production use in current systems.',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400',
  },
  experimental: {
    label: 'Experimental',
    icon: '⬡',
    description:
      'Standardised but not yet widely deployed; may see parameter or API changes.',
    className:
      'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-400',
  },
  legacy: {
    label: 'Legacy',
    icon: '◇',
    description:
      'No longer recommended for new systems but still in use for interoperability.',
    className:
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400',
  },
  deprecated: {
    label: 'Deprecated',
    icon: '▲',
    description:
      'Officially deprecated. Migrate away; support may be withdrawn in future tooling.',
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400',
  },
  broken: {
    label: 'Broken',
    icon: '✕',
    description:
      'Practical attacks exist. Do NOT use for security-sensitive purposes.',
    className:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400',
  },
};

// ─── Size variants ─────────────────────────────────────────────────────────

const SIZE_CLASSES = {
  xs: 'px-2 py-0.5 text-[9px] gap-1',
  sm: 'px-2.5 py-0.5 text-[10px] gap-1',
  md: 'px-3 py-1 text-xs gap-1.5',
  lg: 'px-3.5 py-2.5 text-sm gap-2',
} as const;

type BadgeSize = keyof typeof SIZE_CLASSES;

// ─── Props ─────────────────────────────────────────────────────────────────

export interface CipherLifecycleBadgeProps {
  status: SecurityStatus;
  /** Controls pill sizing. Defaults to 'sm'. */
  size?: BadgeSize;
  /** When true the icon is omitted, useful in tight spaces. */
  hideIcon?: boolean;
  /** Extra Tailwind classes appended to the pill */
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * CipherLifecycleBadge
 *
 * A fully-accessible, design-system-integrated status pill that conveys the
 * cryptographic lifecycle stage of an algorithm: Recommended, Secure,
 * Experimental, Legacy, Deprecated, or Broken.
 *
 * Usage:
 *   <CipherLifecycleBadge status={cipher.securityStatus} />
 *   <CipherLifecycleBadge status="broken" size="lg" />
 */
export default function CipherLifecycleBadge({
  status,
  size = 'sm',
  hideIcon = false,
  className = '',
}: CipherLifecycleBadgeProps) {
  const cfg = BADGE_CONFIG[status];

  return (
    <span
      role="status"
      aria-label={`Security lifecycle: ${cfg.label}. ${cfg.description}`}
      title={cfg.description}
      className={[
        'inline-flex items-center rounded-full border font-bold uppercase tracking-wide',
        SIZE_CLASSES[size],
        cfg.className,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {!hideIcon && (
        <span aria-hidden="true" className="shrink-0 leading-none">
          {cfg.icon}
        </span>
      )}
      {cfg.label}
    </span>
  );
}
