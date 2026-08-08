import React from 'react'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import type { Metadata } from 'next'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/footer'
import CipherRecommendationAssistant from '../../components/advisor/CipherRecommendationAssistant'

export const metadata: Metadata = {
  title: 'Cipher Recommendation Assistant | CryptoViz',
  description: 'An interactive recommendation assistant to help you choose the right cryptographic algorithm based on real-world use cases, environment constraints, and security requirements.',
}

export default function AdvisorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-950 dark:bg-[#060816] dark:text-zinc-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        <Breadcrumbs items={[{ label: "Practice", href: "/visualizer/caesar/" }, { label: "Cipher Recommendation Assistant" }]} />

        <header className="mx-auto max-w-3xl text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
            Interactive Recommendation Guide
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Cipher Recommendation Assistant
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Select a real-world use case scenario (Web APIs, Password Hashing, IoT/Embedded, Post-Quantum, File Storage) or answer a step-by-step decision tree to discover recommended algorithms, security trade-offs, and implementation code snippets.
          </p>
        </header>

        <section aria-label="Cipher Recommendation Assistant">
          <CipherRecommendationAssistant />
        </section>
      </main>

      <Footer />
    </div>
  )
}
