import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/footer";
import RainbowTableDemo from "@/components/rainbowTable/rainbowTableDemo";
import {
  ShieldCheck,
  Zap,
  Lock,
  Database,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Rainbow Table Attack Simulator & Visualizer — CryptoViz",
  description:
    "Interactive demonstration of precomputed rainbow table attacks, hash reduction chains, O(1) password cracking, and why cryptographic salting defeats rainbow tables.",
  keywords: [
    "rainbow table",
    "password cracking",
    "hash attack",
    "salting",
    "cryptography",
    "security",
    "hash chain",
    "bcrypt",
    "argon2",
  ],
  openGraph: {
    title: "Rainbow Table Attack Simulator — CryptoViz",
    description:
      "Interactive demonstration of precomputed rainbow table attacks and cryptographic salting defense.",
    type: "website",
  },
};

export default function RainbowTablePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-7xl w-full space-y-10 px-4 py-10 sm:px-6 lg:px-8">
          {/* HEADER */}
          <header className="max-w-4xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
                Cryptanalysis & Password Security
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                Interactive Attack Simulator
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-zinc-900 dark:text-white">
              Rainbow Table Attack Visualizer
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              A <strong>rainbow table</strong> is a massive precomputed lookup table of password hashes
              that trades offline storage space for instant online attack execution. Stolen password
              hashes can be cracked in milliseconds via O(1) lookups. Explore how hash lookup tables operate
              — and why adding a random <strong>salt</strong> renders rainbow tables completely ineffective.
            </p>
          </header>

          {/* INTERACTIVE DEMO */}
          <RainbowTableDemo />

          {/* EDUCATIONAL DEEP DIVE CONTENT */}
          <section className="space-y-8 text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800/80 pt-10">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Understanding Rainbow Table Mechanics & Defense
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* How Rainbow Tables Work */}
              <article className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 p-6 sm:p-8 shadow-sm backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold">How Rainbow Tables Work</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  Rainbow tables are precomputed mappings between hashes and plaintext passwords. Attackers compute
                  hashes for millions of password variations offline. Instead of storing every pair raw (which takes
                  terabytes), rainbow tables use <strong>reduction functions</strong> to condense chains of hashes:
                </p>
                <div className="bg-zinc-900 text-zinc-200 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-800 space-y-1">
                  <p className="text-teal-400 font-semibold">// Hash Chain Reduction Sequence:</p>
                  <p>P₀ → H(P₀) → R₁(H₀) → P₁ → H(P₁) → R₂(H₁) → P₂ ... → H(Pₖ)</p>
                  <p className="text-zinc-500 pt-1">// Only starting plaintext P₀ & final hash Hₖ are stored in the table!</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-900 dark:text-blue-200 space-y-2">
                  <p className="font-semibold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                    <Zap className="w-4 h-4" /> O(1) Attack Execution Flow:
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Attacker obtains a database of unsalted password hashes</li>
                    <li>Attacker passes the target hash through table lookup index</li>
                    <li>If matched in table, chain is recomputed from starting password to reveal plaintext</li>
                    <li>Password is cracked instantly without brute-forcing every candidate on the fly</li>
                  </ol>
                </div>
              </article>

              {/* Why Salting Defeats Rainbow Tables */}
              <article className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 p-6 sm:p-8 shadow-sm backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold">Why Salting Defeats Rainbow Tables</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  A <strong>cryptographic salt</strong> is random data generated per password and prepended before hashing.
                  Even if two users pick identical passwords (e.g. <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-xs">"password"</code>),
                  their unique salts force completely different hash outputs.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-900 dark:text-red-300 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-red-700 dark:text-red-400">
                      <XCircle className="w-4 h-4 shrink-0" /> Unsalted (Vulnerable)
                    </div>
                    <p>Password: <code className="bg-red-500/20 px-1 rounded">password</code></p>
                    <p>Hash: <code className="bg-red-500/20 px-1 rounded font-mono text-[10px] break-all">5baa61e4...</code></p>
                    <p className="text-[11px] text-red-600 dark:text-red-400">⚠️ Exists in precomputed tables. Instantly cracked!</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> Salted (Protected)
                    </div>
                    <p>Salt: <code className="bg-emerald-500/20 px-1 rounded font-mono">e9a1b87f</code></p>
                    <p>Hash: <code className="bg-emerald-500/20 px-1 rounded font-mono text-[10px] break-all">9f23b4d7...</code></p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">✓ Unique hash. Precomputed table lookup fails!</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed">
                  With a 128-bit salt, an attacker would need 2<sup>128</sup> (approx 3.4 × 10<sup>38</sup>) separate rainbow tables — requiring more physical storage than exists in the observable universe.
                </p>
              </article>
            </div>

            {/* Real World Recommendations */}
            <article className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 p-6 sm:p-8 shadow-sm backdrop-blur-sm space-y-6">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" />
                Production Standards & Best Practices
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5 space-y-3 text-sm">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Insecure Practices to Avoid
                  </h4>
                  <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                    <li>Using un-salted single fast hashes (MD5, SHA-1, SHA-256) for password storage</li>
                    <li>Reusing a single global salt ("static salt" or "pepper only") across all users</li>
                    <li>Short or low-entropy salts (less than 128 bits)</li>
                    <li>User-controlled or predictable salt values</li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3 text-sm">
                  <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Modern Security Recommendations
                  </h4>
                  <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                    <li><strong>Argon2id</strong>: Memory-hard Password Hashing Competition winner</li>
                    <li><strong>bcrypt</strong>: Time-tested key stretching algorithm with built-in salting</li>
                    <li><strong>scrypt</strong>: Memory-hard primitive designed to hinder hardware ASICs</li>
                    <li>Unique cryptographic random salt (minimum 16 bytes / 128 bits) per user account</li>
                  </ul>
                </div>
              </div>

              {/* Key References */}
              <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-6 space-y-3">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Key Standards & Documentation:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <a
                    href="https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    <span>OWASP Password Cheat Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://www.nist.gov/publications/detail/sp-800-63-3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    <span>NIST SP 800-63 Standards</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://en.wikipedia.org/wiki/Rainbow_table"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    <span>Wikipedia: Rainbow Table</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://blog.cloudflare.com/how-to-build-secure-password-hashing-in-go"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    <span>Cloudflare Hashing Guide</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}