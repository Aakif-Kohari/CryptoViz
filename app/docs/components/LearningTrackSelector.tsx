"use client";

import { learningTracks, type LearningTrack } from "../data";

interface LearningTrackSelectorProps {
  activeTrack: LearningTrack | null;
  onTrackChange: (track: LearningTrack | null) => void;
  completedSlugs: Set<string>;
}

export function LearningTrackSelector({
  activeTrack,
  onTrackChange,
  completedSlugs,
}: LearningTrackSelectorProps) {
  const getTrackProgress = (trackId: LearningTrack) => {
    const track = learningTracks.find((t) => t.id === trackId);
    if (!track) return { completed: 0, total: 0, percent: 0 };

    const completed = track.docSlugs.filter((slug) =>
      completedSlugs.has(slug),
    ).length;
    const total = track.docSlugs.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percent };
  };

  const colorClasses = {
    teal: "bg-teal-500 border-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:border-teal-600 dark:hover:bg-teal-700",
    blue: "bg-blue-500 border-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:border-blue-600 dark:hover:bg-blue-700",
    purple: "bg-purple-500 border-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:border-purple-600 dark:hover:bg-purple-700",
  };

  return (
    <section
      aria-labelledby="learning-tracks-title"
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <h2
        id="learning-tracks-title"
        className="text-sm font-bold text-zinc-900 dark:text-white mb-3"
      >
        Learning Tracks
      </h2>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onTrackChange(null)}
          className={`w-full text-left rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all ${
            activeTrack === null
              ? "border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
              : "border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <span>All Documentation</span>
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {completedSlugs.size} completed
            </span>
          </div>
        </button>

        {learningTracks.map((track) => {
          const progress = getTrackProgress(track.id);
          const isActive = activeTrack === track.id;
          const colorClass = colorClasses[track.color as keyof typeof colorClasses];

          return (
            <button
              key={track.id}
              type="button"
              onClick={() => onTrackChange(track.id)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? colorClass + " text-white"
                  : "border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-2">
                  <span className="text-lg">{track.icon}</span>
                  <span>{track.name}</span>
                </span>
                <span
                  className={`${
                    isActive ? "text-white/80" : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {progress.percent}%
                </span>
              </div>
              <div
                className={`h-1.5 overflow-hidden rounded-full ${
                  isActive ? "bg-white/20" : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isActive ? "bg-white" : "bg-zinc-400 dark:bg-zinc-600"
                  }`}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p
                className={`mt-1.5 text-[10px] ${
                  isActive
                    ? "text-white/70"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {track.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
