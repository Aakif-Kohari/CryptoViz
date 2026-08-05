"use client";

import { getDocBySlug, getDocSlug } from "../data";

interface RecommendedNextLinksProps {
  recommendedNext: string[] | undefined;
  completedSlugs: Set<string>;
  onSelectDoc: (title: string) => void;
}

export function RecommendedNextLinks({
  recommendedNext,
  completedSlugs,
  onSelectDoc,
}: RecommendedNextLinksProps) {
  if (!recommendedNext || recommendedNext.length === 0) {
    return null;
  }

  const docs = recommendedNext
    .map((slug) => getDocBySlug(slug))
    .filter((doc): doc is NonNullable<typeof doc> => doc !== undefined);

  if (docs.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="recommended-next-title"
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <h2
        id="recommended-next-title"
        className="text-sm font-bold text-zinc-900 dark:text-white mb-3"
      >
        Recommended Next
      </h2>

      <div className="space-y-2">
        {docs.map((doc) => {
          const slug = getDocSlug(doc.title);
          const isCompleted = completedSlugs.has(slug);

          return (
            <button
              key={slug}
              type="button"
              onClick={() => onSelectDoc(doc.title)}
              className="w-full text-left rounded-lg border border-zinc-200 px-3 py-2.5 text-xs font-semibold transition-all hover:border-teal-300 hover:bg-teal-50 dark:border-zinc-700 dark:hover:border-teal-700 dark:hover:bg-teal-950/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-zinc-900 dark:text-white">{doc.title}</span>
                {isCompleted && (
                  <span
                    className="text-emerald-600 dark:text-emerald-400"
                    aria-label="Completed"
                  >
                    ✓
                  </span>
                )}
              </div>
              <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {doc.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
