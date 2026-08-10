'use client'

import React from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/footer'
import PracticePageTemplate from "@/components/layout/LearnPageTemplate";
import CipherSandbox from '@/components/cipher-sandbox/CipherSandbox'
import { Sparkles, Sliders, ShieldCheck, Cpu } from 'lucide-react'

export default function CipherSandboxPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-[#060816] dark:text-white transition-colors duration-300">
      <Navbar />

        <PracticePageTemplate
        title="Build Your Own Cipher Sandbox"
        description="Design, test, and analyze custom ciphers by chaining substitution (confusion) and permutation (diffusion) layers. Observe state evolutions step-by-step, verify invertibility, and calculate avalanche metrics in real-time."
        eyebrow="INTERACTIVE CRYPTOGRAPHY LABORATORY"
        breadcrumbs={[
          {
            label: "Practice",
            href: "/visualizer/caesar/",
          },
          {
            label: "Cipher Sandbox",
          },
        ]}
      >
        {/* Hero Header */}
        <section aria-labelledby="sandbox-hero-title" className="relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent p-8 sm:p-12 backdrop-blur-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-bold text-teal-600 dark:text-teal-400">
              <Sparkles className="h-3.5 w-3.5" />
              INTERACTIVE CRYPTOGRAPHY LABORATORY
            </div>
            <h1 id="sandbox-hero-title" className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Build Your Own Cipher Sandbox
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
              Design, test, and analyze custom ciphers by chaining substitution (confusion) and permutation (diffusion) layers. Observe state evolutions step-by-step, verify invertibility, and calculate avalanche metrics in real-time.
            </p>
          </div>
        </section>

        {/* Interactive Cipher Sandbox Workspace */}
        <CipherSandbox />

        {/* Educational Deep Dive Section */}
        <section className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/60 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Understanding Substitution & Permutation Networks
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl">
              Claude Shannon identified two primary fundamental principles that modern block ciphers rely on to thwart cryptanalysis:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
              <div className="inline-flex rounded-xl bg-teal-500/10 p-3 text-teal-600 dark:text-teal-400">
                <Sliders className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Substitution (Confusion)
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Substitution layers map plaintext units to ciphertext units, masking the mathematical relationship between the secret key and the ciphertext. Examples include S-Boxes, Caesar shifts, Affine transforms, and XOR layers.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
              <div className="inline-flex rounded-xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-400">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Permutation (Diffusion)
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Permutation layers reorder character or bit positions across the state, spreading statistical structure of the input across the output. Examples include P-Boxes, columnar transpositions, block swaps, and cyclic shifts.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
              <div className="inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Multi-Round Iteration
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                A single substitution or permutation layer is easily broken. Modern block ciphers like AES and DES repeat alternating substitution-permutation rounds to achieve optimal Avalanche Effect (flipping 1 bit changes ~50% of output bits).
              </p>
            </div>
          </div>
        </section>
      </PracticePageTemplate>
      <Footer />
    </div>
  )
}
