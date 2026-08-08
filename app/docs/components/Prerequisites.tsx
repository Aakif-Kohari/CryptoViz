"use client";

import { getDocBySlug, getDocSlug } from "../data";

interface PrerequisitesProps {
  prerequisites: string[] | undefined;
  completedSlugs: Set<string>;
  onSelectDoc: (title: string) => void;
}

export function Prerequisites({
  prerequisites,
  completedSlugs,
  onSelectDoc,
}: PrerequisitesProps) {
  if (!prerequisites || prerequisites.length === 0) {
    return null;
  }

  const docs = prerequisites
    .map((slug) => getDocBySlug(slug))
    .filter((doc): doc is NonNullable<typeof doc> => doc !== undefined);

  if (docs.length === 0) {
    return null;
  }

  const allCompleted = docs.every((doc) => completedSlugs.has(getDocSlug(doc.title)));

  return (
    <div
      className={`rounded-lg border p-3 ${
        allCompleted
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
          : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-zinc-900 dark:text-white">
          Prerequisites:
        </span>
        {allCompleted ? (
          <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
            ✓ All completed
          </span>
        ) : (
          <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
          {docs.filter((doc) => completedSlugs.has(getDocSlug(doc.title))).length} of {docs.length} completed
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {docs.map((doc) => {
          const slug = getDocSlug(doc.title);
          const isCompleted = completedSlugs.has(slug);

          return (
            <button
              key={slug}
              type="button"
              onClick={() => onSelectDoc(doc.title)}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-all ${
                isCompleted
                  ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300 hover:border-amber-400 dark:hover:border-amber-600"
              }`}
            >
              {isCompleted && <span>✓</span>}
              {doc.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
