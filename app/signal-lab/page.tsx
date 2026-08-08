import SignalMessagingLab from '@/components/signal/SignalMessagingLab';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/footer';

export const metadata = {
  title: 'Signal Secure Messaging Lab | Double Ratchet & X3DH | CryptoViz',
  description:
    'Interactive Signal Protocol simulator. Explore KDF Chain Ratchets, Diffie-Hellman Key Refreshes, X3DH Pre-Key Agreements, Forward Secrecy, and Break-in Recovery Self-Healing.',
};

export default function SignalLabPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#060816] text-zinc-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10"
      >
        <SignalMessagingLab />
      </main>

      <Footer />
    </div>
  );
}
