"use client";

interface ReadingTimeProps {
  minutes: number | undefined;
}

export function ReadingTime({ minutes }: ReadingTimeProps) {
  if (!minutes) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {minutes} min read
    </span>
  );
}
