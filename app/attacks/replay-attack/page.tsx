import ReplayAttackSimulator from '../../../components/attacks/ReplayAttackSimulator'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/footer'

export const metadata = {
  title: 'Replay Attack Simulator | CryptoViz',
  description: 'Simulate packet interception and retransmission in authenticated network protocols.',
}

export default function ReplayAttackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#060816] text-zinc-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <main id="main-content" className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        <ReplayAttackSimulator />
      </main>
      <Footer />
    </div>
  )
}
