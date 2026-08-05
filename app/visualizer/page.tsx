import Navbar from '../../components/layout/Navbar'
import PinnedCiphers from '../../components/cipher/PinnedCiphers'
import RecentlyViewedCiphers from '../../components/cipher/RecentlyViewedCiphers'
import VisualizerDiscoveryFlow from '../../components/cipher/VisualizerDiscoveryFlow'
import { CIPHER_REGISTRY } from '../../lib/cipher/registry'

export default function VisualizerIndex() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
            Cipher visualizer
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Explore cryptography step by step
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Choose your learning level, pick an algorithm family, and launch an interactive visualizer to see how each operation works.
          </p>
        </header>

        <PinnedCiphers ciphers={CIPHER_REGISTRY} />
        <RecentlyViewedCiphers ciphers={CIPHER_REGISTRY} />

        <VisualizerDiscoveryFlow />
      </main>
    </div>
  )
}
