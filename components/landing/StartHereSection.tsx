"use client";

import Link from "next/link";
import { useSyncExternalStore, useCallback } from "react";
import {
  ArrowRight,
  BookOpen,
  Cpu,
  FlaskConical,
  Play,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const STORAGE_KEY = "cryptoviz_learning_journey_v2";

type JourneyState = {
  activePathId: string | null;
  stepProgress: Record<string, number>;
};

function readState(): JourneyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as JourneyState;
  } catch {
    // ignore
  }
  return { activePathId: null, stepProgress: {} };
}

function writeState(s: JourneyState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("storage"));
}

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
const getClientSnapshot = () => localStorage.getItem(STORAGE_KEY) ?? null;
const getServerSnapshot = () => null;

type Step = { label: string; href: string; description: string };
type Path = {
  id: string;
  title: string;
  subtitle: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  color: { badge: string; border: string; glow: string; icon: string; progress: string };
  icon: React.ReactNode;
  steps: Step[];
};

const PATHS: Path[] = [
  {
    id: "classical",
    title: "Classical Cryptography",
    subtitle: "Start from the historical roots of secret communication.",
    level: "Beginner",
    duration: "~30 min",
    color: {
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      border: "hover:border-emerald-500/50",
      glow: "hover:shadow-[0_0_30px_rgba(52,211,153,0.12)]",
      icon: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      progress: "bg-emerald-500",
    },
    icon: <BookOpen className="h-5 w-5" />,
    steps: [
      { label: "Caesar Cipher", href: "/visualizer/caesar/?ref=learning-journey", description: "Simple letter-shift substitution cipher" },
      { label: "Vigenère Cipher", href: "/visualizer/vigenere/?ref=learning-journey", description: "Polyalphabetic substitution using a keyword" },
      { label: "Rail Fence Transposition", href: "/visualizer/railfence/?ref=learning-journey", description: "Rearrange plaintext across zigzag rails" },
      { label: "Cipher Timeline", href: "/timeline/?ref=learning-journey", description: "See how ciphers evolved through history" },
    ],
  },
  {
    id: "modern",
    title: "Modern Cryptography",
    subtitle: "Explore the algorithms protecting today's internet.",
    level: "Intermediate",
    duration: "~45 min",
    color: {
      badge: "bg-[#00C2AE]/15 text-[#00C2AE] border-[#00C2AE]/30",
      border: "hover:border-[#00C2AE]/50",
      glow: "hover:shadow-[0_0_30px_rgba(0,194,174,0.12)]",
      icon: "bg-[#00C2AE]/10 border-[#00C2AE]/20 text-[#00C2AE]",
      progress: "bg-[#00C2AE]",
    },
    icon: <Cpu className="h-5 w-5" />,
    steps: [
      { label: "AES Block Cipher", href: "/visualizer/aes/?ref=learning-journey", description: "The world-standard 128/256-bit block cipher" },
      { label: "RSA Public Key", href: "/visualizer/rsa/?ref=learning-journey", description: "Asymmetric encryption & key exchange" },
      { label: "SHA-256 Hash", href: "/visualizer/sha256/?ref=learning-journey", description: "Collision-resistant cryptographic hash" },
      { label: "Key Size Estimator", href: "/key-size/?ref=learning-journey", description: "Compare security across algorithm families" },
    ],
  },
  {
    id: "practice",
    title: "Practice Mode",
    subtitle: "Apply your knowledge with challenges & real-world scenarios.",
    level: "Advanced",
    duration: "~60 min",
    color: {
      badge: "bg-violet-500/15 text-violet-400 border-violet-500/30",
      border: "hover:border-violet-500/50",
      glow: "hover:shadow-[0_0_30px_rgba(167,139,250,0.12)]",
      icon: "bg-violet-500/10 border-violet-500/20 text-violet-400",
      progress: "bg-violet-500",
    },
    icon: <FlaskConical className="h-5 w-5" />,
    steps: [
      { label: "Cipher Advisor", href: "/advisor/?ref=learning-journey", description: "Find the right cipher for your use-case" },
      { label: "Avalanche Effect", href: "/avalanche/?ref=learning-journey", description: "See how a single bit flip cascades" },
      { label: "Attack Simulations", href: "/attacks/?ref=learning-journey", description: "Brute force, birthday, and more" },
      { label: "Full Learning Paths", href: "/learning-paths/?ref=learning-journey", description: "Structured quizzes & progress tracking" },
    ],
  },
];

const LEVEL_COLOR: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Intermediate: "text-[#00C2AE] bg-[#00C2AE]/10 border-[#00C2AE]/20",
  Advanced: "text-violet-400 bg-violet-500/10 border-violet-500/20",
};

export function StartHereSection() {
  useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const state =
    typeof window !== "undefined"
      ? readState()
      : { activePathId: null, stepProgress: {} };

  const handleStartPath = useCallback((pathId: string) => {
    const s = readState();
    writeState({ ...s, activePathId: pathId });
  }, []);

  const handleMarkStep = useCallback((pathId: string, stepIndex: number) => {
    const s = readState();
    const current = s.stepProgress[pathId] ?? -1;
    if (stepIndex >= current) {
      writeState({ ...s, stepProgress: { ...s.stepProgress, [pathId]: stepIndex } });
    }
  }, []);

  const handleReset = useCallback(() => {
    writeState({ activePathId: null, stepProgress: {} });
  }, []);

  const activePath = PATHS.find((p) => p.id === state.activePathId) ?? null;
  const lastStepIdx = activePath ? (state.stepProgress[activePath.id] ?? -1) : -1;
  const nextStep = activePath ? (activePath.steps[lastStepIdx + 1] ?? null) : null;

  return (
    <section
      id="start-here"
      aria-labelledby="start-here-heading"
      className="w-full py-24 bg-white dark:bg-[#09090B] border-b border-zinc-200 dark:border-[#2A2A31] font-sans"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00C2AE] bg-[#00C2AE]/10 border border-[#00C2AE]/20 rounded-full">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Guided Learning Journey</span>
          </div>
          <h2
            id="start-here-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-[#F5F5F5]"
          >
            New to Cryptography?{" "}
            <span className="bg-gradient-to-r from-[#00C2AE] to-[#14D8C2] bg-clip-text text-transparent">
              Start Here.
            </span>
          </h2>
          <p className="max-w-xl text-sm text-zinc-500 dark:text-[#B3B3B8] leading-relaxed">
            Pick a curated learning path based on your experience level. Your progress is saved — pick up exactly where you left off.
          </p>
        </div>

        {/* Continue Banner */}
        {activePath && (
          <div className="relative overflow-hidden rounded-2xl border border-[#00C2AE]/30 bg-[#00C2AE]/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#00C2AE]/10 blur-3xl" aria-hidden="true" />
            <div className="relative z-10 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#00C2AE]">Continue Learning</p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-[#F5F5F5]">{activePath.title}</h3>
              {nextStep ? (
                <p className="text-sm text-zinc-500 dark:text-[#B3B3B8]">
                  Next up: <span className="font-medium text-zinc-800 dark:text-[#F5F5F5]">{nextStep.label}</span> — {nextStep.description}
                </p>
              ) : (
                <p className="text-sm text-emerald-500 font-semibold">✓ Path complete! Try the next level.</p>
              )}
            </div>
            <div className="relative z-10 flex items-center gap-3">
              {nextStep && (
                <Link
                  href={nextStep.href}
                  onClick={() => handleMarkStep(activePath.id, lastStepIdx + 1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00C2AE] hover:bg-[#14D8C2] text-[#09090B] font-bold text-sm shadow-lg shadow-[#00C2AE]/20 transition-all hover:-translate-y-0.5"
                >
                  <Play className="h-3.5 w-3.5 fill-[#09090B]" aria-hidden="true" />
                  Continue
                </Link>
              )}
              <button
                onClick={handleReset}
                title="Reset all learning progress"
                aria-label="Reset all learning progress"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-[#2A2A31] bg-white dark:bg-[#16161A] hover:bg-zinc-50 dark:hover:bg-[#1A1A1F] text-zinc-500 dark:text-[#8A8A94] hover:text-rose-500 text-xs font-medium transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        )}

        {/* Path Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3" role="list" aria-label="Learning paths">
          {PATHS.map((path) => {
            const completedCount = state.stepProgress[path.id] !== undefined ? state.stepProgress[path.id] + 1 : 0;
            const pct = Math.round((completedCount / path.steps.length) * 100);
            const isActive = state.activePathId === path.id;

            return (
              <div
                key={path.id}
                role="listitem"
                className={`group relative flex flex-col rounded-2xl border transition-all duration-300 bg-white dark:bg-[#16161A] overflow-hidden ${
                  isActive
                    ? "border-[#00C2AE]/50 shadow-[0_0_25px_rgba(0,194,174,0.12)]"
                    : `border-zinc-200 dark:border-[#2A2A31] ${path.color.border} ${path.color.glow}`
                }`}
              >
                {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00C2AE] to-[#14D8C2]" aria-hidden="true" />}

                <div className="p-6 flex-1 flex flex-col gap-4">
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${path.color.icon}`} aria-hidden="true">
                      {path.icon}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${LEVEL_COLOR[path.level]}`}>
                        {path.level}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-[#8A8A94]">{path.duration}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-[#F5F5F5] group-hover:text-[#00C2AE] transition-colors">{path.title}</h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-[#8A8A94] leading-relaxed">{path.subtitle}</p>
                  </div>

                  {/* Progress bar */}
                  {completedCount > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-[#8A8A94]">
                        <span>Progress</span>
                        <span>{completedCount} / {path.steps.length} steps</span>
                      </div>
                      <div
                        className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-[#2A2A31] overflow-hidden"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${path.title} progress`}
                      >
                        <div className={`h-full rounded-full transition-all duration-700 ${path.color.progress}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Step list */}
                  <ol className="mt-1 space-y-2.5" aria-label={`Steps in ${path.title}`}>
                    {path.steps.map((step, i) => {
                      const done = i < completedCount;
                      const isCurrent = i === completedCount && isActive;
                      return (
                        <li key={step.href} className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold border transition-colors ${
                              done
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                : isCurrent
                                ? "bg-[#00C2AE]/15 border-[#00C2AE]/40 text-[#00C2AE]"
                                : "bg-zinc-50 dark:bg-[#1A1A1F] border-zinc-200 dark:border-[#2A2A31] text-zinc-400"
                            }`}
                          >
                            {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : i + 1}
                          </span>
                          <Link
                            href={step.href}
                            onClick={() => { handleStartPath(path.id); handleMarkStep(path.id, i); }}
                            aria-label={`${step.label}: ${step.description}${done ? " (completed)" : ""}`}
                            className={`group/step flex-1 min-w-0 text-xs transition-colors ${
                              done
                                ? "text-zinc-400 dark:text-[#8A8A94] line-through"
                                : isCurrent
                                ? "font-semibold text-[#00C2AE]"
                                : "text-zinc-700 dark:text-[#D4D4D8] hover:text-[#00C2AE]"
                            }`}
                          >
                            <span className="block font-medium truncate">{step.label}</span>
                            <span className="block text-[10px] text-zinc-400 dark:text-[#8A8A94] truncate">{step.description}</span>
                          </Link>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-300 dark:text-[#3A3A41] transition-colors" aria-hidden="true" />
                        </li>
                      );
                    })}
                  </ol>
                </div>

                {/* Card footer */}
                <div className="border-t border-zinc-100 dark:border-[#2A2A31] p-4 flex items-center justify-between">
                  <Link
                    href={isActive && nextStep ? nextStep.href : path.steps[0].href}
                    onClick={() => { handleStartPath(path.id); if (!isActive) handleMarkStep(path.id, 0); }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00C2AE] hover:text-[#14D8C2] transition-colors focus-visible:outline-2 focus-visible:outline-[#00C2AE] focus-visible:outline-offset-2 rounded"
                    aria-label={`${isActive ? "Continue" : "Start"} ${path.title}`}
                  >
                    {isActive ? "Continue Path" : "Start Path"}
                  </Link>
                  <ArrowRight size={14} className="text-[#00C2AE] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/learning-paths/?ref=learning-journey"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00C2AE] hover:bg-[#14D8C2] text-[#09090B] font-bold text-sm shadow-md shadow-[#00C2AE]/20 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#00C2AE] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#09090B]"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            View All Learning Paths
            <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
          </Link>
          <Link
            href="/visualizer/caesar/?ref=learning-journey"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-200 dark:border-[#2A2A31] bg-white dark:bg-[#16161A] hover:bg-zinc-50 dark:hover:bg-[#1A1A1F] text-zinc-700 dark:text-[#D4D4D8] font-semibold text-sm transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#00C2AE] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#09090B]"
          >
            Open Playground
          </Link>
        </div>

      </div>
    </section>
  );
}
