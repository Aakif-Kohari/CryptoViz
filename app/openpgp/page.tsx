import OpenPGPExplorer from '@/components/openpgp/OpenPGPExplorer';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/footer';

export const metadata = {
  title: 'OpenPGP Workflow Explorer | Sign → Compress → Encrypt | CryptoViz',
  description:
    'Visualize and analyze the RFC 4880 & RFC 9580 OpenPGP pipeline. Understand how signing, DEFLATE compression, AES session key encryption, and packet trees operate together.',
};

export default function OpenPGPPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#060816] text-zinc-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10"
      >
        <OpenPGPExplorer />
      </main>

      <Footer />
    </div>
  );
}
