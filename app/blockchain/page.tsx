import BlockchainExplorer from '@/components/blockchain/BlockchainExplorer';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/footer';

export const metadata = {
  title: 'Blockchain Transaction Signature Explorer | ECDSA, Schnorr, ecrecover | CryptoViz',
  description:
    'Visualize blockchain transaction signatures. Understand secp256k1 ECDSA (r, s, v), Ethereum ecrecover precompile, Bitcoin BIP-340 Taproot Schnorr, Nonce Reuse Attacks, and Signature Malleability.',
};

export default function BlockchainPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#060816] text-zinc-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10"
      >
        <BlockchainExplorer />
      </main>

      <Footer />
    </div>
  );
}
