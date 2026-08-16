import WebAuthnDemo from '@/components/protocols/WebAuthnDemo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/footer';

export const metadata = {
  title: 'WebAuthn & Passkeys Playground | CryptoViz',
  description:
    'Interactive FIDO2/WebAuthn playground. Explore credential registration, biometric/PIN user verification, P-256 ECC public-key generation, and origin-bound phishing protection.',
};

export default function WebAuthnPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#060816] text-zinc-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10"
      >
        <header className="mb-6 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00C2AE]">
            Protocols & Authentication
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl text-zinc-900 dark:text-white">
            WebAuthn & Passkeys Lab
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-[#B3B3B8]">
            Traditional passwords rely on shared secrets that are vulnerable to server breaches and phishing. WebAuthn introduces asymmetric public-key cryptography to secure authentication.
          </p>
        </header>

        <WebAuthnDemo />
      </main>

      <Footer />
    </div>
  );
}
