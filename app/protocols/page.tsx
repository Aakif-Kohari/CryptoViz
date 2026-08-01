import ProtocolExplorer from '@/components/protocols/ProtocolExplorer'
import Footer from '@/components/layout/footer'

export const metadata = {
  title: 'Interactive Protocol Explorer — CryptoViz',
  description: 'Visualize and understand modern cryptographic protocols like TLS, SSH, Signal, JWT, and HTTPS.',
}

export default function ProtocolsPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 flex flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex-1">
        <header className="mb-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
            Real-world usage
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl text-zinc-900 dark:text-white">
            Protocol Explorer
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Algorithms like AES and RSA rarely operate alone. They are combined into robust protocols to secure the internet. Explore how the most common protocols work step by step.
          </p>
        </header>

        <ProtocolExplorer />
      </div>
      
      <Footer />
    </main>
  )
}
