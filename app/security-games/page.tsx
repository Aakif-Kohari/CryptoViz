'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/footer';
import SecurityGameSimulator from '@/components/learning/SecurityGameSimulator';

const LESSONS = [
  {
    number: '01',
    title: 'IND-CPA',
    text: 'Can the adversary distinguish which of two chosen messages was encrypted?',
  },
  {
    number: '02',
    title: 'IND-CCA1',
    text: 'What changes when the adversary gets access to a decryption oracle before the challenge?',
  },
  {
    number: '03',
    title: 'IND-CCA2',
    text: 'Why does adaptive decryption access make ciphertext integrity essential?',
  },
  {
    number: '04',
    title: 'EUF-CMA',
    text: 'Can an adversary create a valid authentication value for a message it never queried?',
  },
];

export default function SecurityGamesPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#060816] dark:text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"
        >
          <Link
            href="/"
            className="transition-colors hover:text-teal-500"
          >
            Home
          </Link>

          <ArrowRight className="h-3.5 w-3.5" />

          <span className="font-semibold text-zinc-700 dark:text-zinc-200">
            Security Games
          </span>
        </nav>

        <section className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Interactive provable security
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
            Security Game Simulator
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Play the adversary in formal cryptographic security games. Choose
            messages, query permitted oracles, receive a challenge, and measure
            your empirical advantage over repeated experiments.
          </p>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LESSONS.map((lesson) => (
            <div
              key={lesson.number}
              className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/50"
            >
              <span className="text-xs font-black text-teal-500">
                {lesson.number}
              </span>

              <h2 className="mt-2 font-bold text-zinc-900 dark:text-white">
                {lesson.title}
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {lesson.text}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/20 sm:p-6">
          <SecurityGameSimulator />
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
            <GraduationCap className="h-5 w-5 text-teal-500" />

            <h2 className="mt-3 font-bold">Think like the adversary</h2>

            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Security is not demonstrated by showing that encryption works.
              It is demonstrated by showing that a permitted adversary cannot
              gain a useful advantage.
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
            <BookOpen className="h-5 w-5 text-indigo-500" />

            <h2 className="mt-3 font-bold">Read the formal game</h2>

            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              The simulator follows the game-based structure: adversary,
              challenger, oracle access, challenge, guess, and empirical
              advantage.
            </p>

            <Link
              href="/glossary"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:underline dark:text-teal-400"
            >
              Open glossary
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />

            <h2 className="mt-3 font-bold">Interpret the advantage</h2>

            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              A random guess has an expected advantage near zero. A structural
              distinguishing attack produces a visibly larger empirical
              advantage.
            </p>
          </article>
        </section>

        <div className="mt-8">
          <Link
            href="/glossary"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to glossary
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}