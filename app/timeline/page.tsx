import CryptoTimeline from '../../components/timeline/CryptoTimeline'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/footer'

export const metadata = {
  title: 'Cryptography Timeline | CryptoViz',
  description:
    'Explore the evolution of cryptography from ancient hand ciphers (Caesar, Atbash) to post-quantum lattice-based cryptography (Kyber, Dilithium). Interactive historical timeline with technical details and visualizer links.',
}

export default function TimelinePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#060816] text-zinc-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10"
      >
        <CryptoTimeline />
      </main>

      <Footer />
    </div>
  )
}
