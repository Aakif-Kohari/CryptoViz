"use client";

import { type DifficultyLevel } from "../data";

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel | undefined;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  if (!difficulty) {
    return null;
  }

  const config = {
    beginner: {
      label: "Beginner",
      className:
        "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    },
    intermediate: {
      label: "Intermediate",
      className:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    },
    advanced: {
      label: "Advanced",
      className:
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    },
  };

  const { label, className } = config[difficulty];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
