import EMVExplorer from '@/components/emv/EMVExplorer';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/footer';

export const metadata = {
  title: 'EMV Payment Cryptography Explorer | ARQC & Card Auth | CryptoViz',
  description:
    'Explore applied payment cryptography powering global chip-and-PIN transactions. Understand ARQC, ARPC, TC cryptograms, key diversification (MK -> UDK -> SK), DDA, and HSM validation.',
};

export default function EMVPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#060816] text-zinc-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10"
      >
        <EMVExplorer />
      </main>

      <Footer />
    </div>
  );
}
