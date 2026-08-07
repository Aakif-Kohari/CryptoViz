"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Compass, Sparkles, BookOpenCheck } from "lucide-react";

export function StartHereSection() {
  const [lastVisited, setLastVisited] = useState<string | null>(null);

  useEffect(() => {
    // Basic session/progress tracking
    const saved = localStorage.getItem("cryptoviz_last_path");
    if (saved) setLastVisited(saved);
  }, []);

  const handleTrackClick = (pathKey: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cryptoviz_last_path", pathKey);
    }
  };

  const tracks = [
    {
      id: "caesar",
      title: "Beginner Path",
      level: "Step 01",
      description: "Start from scratch with historical substitution ciphers and foundational mechanics.",
      link: "/visualizer/caesar/?ref=onboarding",
      action: lastVisited === "caesar" ? "Continue Caesar Cipher" : "Start Caesar Cipher",
      icon: <Compass className="h-5 w-5 text-[#00C2AE]" />,
    },
    {
      id: "aes",
      title: "Practical Security",
      level: "Step 02",
      description: "Learn how modern web encryption operates under the hood with symmetric standards.",
      link: "/visualizer/aes/?ref=onboarding",
      action: lastVisited === "aes" ? "Continue AES Standard" : "Explore AES Standard",
      icon: <Sparkles className="h-5 w-5 text-[#00C2AE]" />,
    },
    {
      id: "rsa",
      title: "Public Key Systems",
      level: "Step 03",
      description: "Understand asymmetric key exchanges, digital signatures, and mathematical foundations.",
      link: "/visualizer/rsa/?ref=onboarding",
      action: lastVisited === "rsa" ? "Continue RSA Algorithm" : "Try RSA Algorithm",
      icon: <BookOpenCheck className="h-5 w-5 text-[#00C2AE]" />,
    },
  ];

  return (
    <section className="w-full py-16 bg-white dark:bg-[#09090B] border-b border-zinc-200 dark:border-[#2A2A31] font-sans">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00C2AE] bg-[#00C2AE]/10 border border-[#00C2AE]/20 rounded-full mb-3">
            <span>Guided Onboarding</span>
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-[#F5F5F5]">
            New to Cryptography? Start Here.
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-[#B3B3B8] max-w-lg mx-auto">
            Select an entry point based on your experience level to begin interactive exploration.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 w-full md:grid-cols-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="group relative flex flex-col justify-between rounded-xl border border-zinc-200 dark:border-[#2A2A31] bg-white dark:bg-[#16161A] p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#00C2AE]/50 hover:shadow-[0_0_25px_rgba(0,194,174,0.1)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-50 dark:bg-[#101013] border border-zinc-200 dark:border-[#2A2A31]">
                    {track.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8A8A94] bg-zinc-50 dark:bg-[#101013] border border-zinc-200 dark:border-[#2A2A31] px-2.5 py-1 rounded">
                    {track.level}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-[#F5F5F5] group-hover:text-[#00C2AE] transition-colors">
                  {track.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-[#B3B3B8] leading-relaxed">
                  {track.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-[#2A2A31] flex items-center justify-between">
                <Link
                  href={track.link}
                  onClick={() => handleTrackClick(track.id)}
                  className="inline-flex items-center text-xs font-semibold text-[#00C2AE] hover:text-[#14D8C2] transition-colors focus-visible:outline-2 focus-visible:outline-[#009689] focus-visible:outline-offset-2 rounded"
                >
                  {track.action}
                </Link>
                <Link href={track.link}
                 onClick={() => handleTrackClick(track.id)}>
                <ArrowRight
                  size={14}
                  className="text-[#00C2AE] transition-transform duration-200 group-hover:translate-x-1"
                />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}