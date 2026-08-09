import type { CipherDefinition } from '../../lib/cipher/registry'

interface SandboxInputsProps {
  cipher: CipherDefinition
  input: string
  setInput: (value: string) => void
  key: string
  setKey: (value: string) => void
  action: "encrypt" | "decrypt"
  hexInput: boolean
  setHexInput: (value: boolean) => void
  rounds: number
  setRounds: (value: number) => void
  demoMode: boolean
  setDemoMode: (value: boolean) => void
  bobSecret: string
  setBobSecret: (value: string) => void
  aesMode: string
  setAesMode: (value: string) => void
  padding: boolean
  setPadding: (value: boolean) => void
}

const KEYLESS_CIPHERS = ['atbash', 'rot13', 'sha256','sha512','md5','xxhash32','bloomfilter', 'bloom-filter']

export default function SandboxInputs({
  cipher,
  input,
  setInput,
  key,
  setKey,
  action,
  hexInput,
  setHexInput,
  rounds,
  setRounds,
  demoMode,
  setDemoMode,
  bobSecret,
  setBobSecret,
  aesMode,
  setAesMode,
  padding,
  setPadding,
}: SandboxInputsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      {/* Input message */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {cipher.id === "ecc" && action === "decrypt"
            ? "Original Message (to verify)"
            : "Plaintext / Input Message"}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[90px] w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2.5 font-mono text-sm leading-relaxed text-zinc-900 outline-none transition-all focus:border-teal-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-teal-400 dark:focus:bg-zinc-950"
          placeholder="Enter input here..."
        />
      </div>

      {/* Key Field or Keyless Notice */}
      {KEYLESS_CIPHERS.includes(cipher.id) ? (
        <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            No key required for this cipher
          </span>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            This algorithm operates using a fixed transformation or deterministic digest rule.
          </p>
        </div>
      ) : cipher.defaultKey !== undefined && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {cipher.id === "ecc"
              ? action === "encrypt"
                ? "Private Key (Hex)"
                : "Signature, Public Key (comma separated)"
              : cipher.id === "dh"
                ? "Alice Private Secret (a) & Public Parameters (p, g)"
                : "Cryptographic Key / Shift"}
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2.5 font-mono text-sm text-zinc-900 outline-none transition-all focus:border-teal-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-teal-400 dark:focus:bg-zinc-950"
            placeholder={cipher.keyPlaceholder || "Enter key..."}
          />
        </div>
      )}

      {/* Specific algorithm options */}
      {cipher.id === "bcrypt" && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Bcrypt Rounds (Cost Factor)
            </label>
            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
              {rounds}
            </span>
          </div>
          <input
            type="range"
            min="4"
            max="12"
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-700 accent-teal-600 dark:accent-teal-400"
          />
        </div>
      )}

      {cipher.id === "dh" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Bob Private Secret (b)
          </label>
          <input
            type="text"
            value={bobSecret}
            onChange={(e) => setBobSecret(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2.5 font-mono text-sm text-zinc-900 outline-none transition-all focus:border-teal-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-teal-400"
          />
        </div>
      )}

      {cipher.id === "rsa" && (
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Demo Mode (Square & Multiply walkthrough)
          </span>
          <input
            type="checkbox"
            checked={demoMode}
            onChange={(e) => setDemoMode(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
      )}

      {["des", "3des", "aes", "camellia"].includes(cipher.id) && (
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Input / Key in Hex Format
          </span>
          <input
            type="checkbox"
            checked={hexInput}
            onChange={(e) => setHexInput(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
      )}

      {(cipher.id === "aes" || cipher.id === "camellia") && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Mode of Operation
          </label>
          <select
            value={aesMode}
            onChange={(e) => setAesMode(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-2.5 font-mono text-sm text-zinc-900 outline-none transition-all focus:border-teal-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-teal-400"
          >
            <option value="ECB">ECB (Electronic Codebook)</option>
            <option value="CBC">CBC (Cipher Block Chaining)</option>
            {cipher.id === "aes" && (
              <>
                <option value="CTR">CTR (Counter)</option>
                <option value="CFB">CFB (Cipher Feedback)</option>
                <option value="OFB">OFB (Output Feedback)</option>
              </>
            )}
          </select>
          {cipher.id === "aes" && (
            <p className="text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">
              <a href="/modes/" className="text-teal-600 hover:underline dark:text-teal-400">
                Explore the modes lab
              </a>{" "}
              to see how each mode propagates a one-byte change.
            </p>
          )}
        </div>
      )}

      {cipher.id === "camellia" && (
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            PKCS#7 Padding
          </span>
          <input
            type="checkbox"
            checked={padding}
            onChange={(e) => setPadding(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </div>
      )}
    </div>
  )
}
