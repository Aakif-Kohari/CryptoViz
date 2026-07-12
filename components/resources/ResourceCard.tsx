"use client";

import { ExternalLink } from "lucide-react";
import { LearningResource } from "@/lib/resources";

interface Props {
  resource: LearningResource;
}

const categoryColors: Record<string, string> = {
  Book:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Research Paper":
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  RFC:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  NIST:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Video:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Website:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
};

const difficultyColors: Record<string, string> = {
  Beginner:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  Intermediate:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  Advanced:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function ResourceCard({ resource }: Props) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              categoryColors[resource.category]
            }`}
          >
            {resource.category}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              difficultyColors[resource.difficulty]
            }`}
          >
            {resource.difficulty}
          </span>
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {resource.title}
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          {resource.author}
        </p>

        <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {resource.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
      >
        Open Resource
        <ExternalLink size={16} />
      </a>
    </div>
  );
}