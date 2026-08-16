import type { Metadata } from 'next'

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/footer';
import CryptoAuditSandbox from '@/components/security/CryptoAuditSandbox'
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cryptographic Code Audit Sandbox | CryptoViz',
  description:
    'Interactive cryptographic code misuse auditing challenges covering predictable randomness, static IVs, timing leaks, raw RSA, and unauthenticated encryption.',
}

export default function AuditSandboxPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 dark:bg-[#060816] dark:text-white">
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
            Audit Sandbox
          </span>
        </nav>

        <div className="border-b border-zinc-200/70 bg-white/70 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/70">
          <div className="mx-auto max-w-7xl py-10">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-teal-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
                Security Lab
            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Real-World Cryptographic Code Audit
            </h1>

            <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Find cryptographic implementation mistakes, understand how they
              can be abused, fix the code, and verify your remediation with
              automated security checks.
            </p>
          </div>
        </div>
      </div>

      <CryptoAuditSandbox />
    </main>
    <Footer />
    </div>
  )
}