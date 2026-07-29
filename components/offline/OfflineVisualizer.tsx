'use client';

import React, { useState } from 'react';
import { Play, Copy, Check, RefreshCw, Cpu } from 'lucide-react';

export default function OfflineVisualizer() {
  const [selectedAlgo, setSelectedAlgo] = useState<'caesar' | 'rot13' | 'vigenere' | 'atbash' | 'sha256'>('caesar');
  const [inputText, setInputText] = useState('CryptoViz Offline Visualizer Playground!');
  const [keyInput, setKeyInput] = useState('3');
  const [isDecrypt, setIsDecrypt] = useState(false);
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCompute = async () => {
    if (selectedAlgo === 'caesar') {
      const shift = parseInt(keyInput, 10) || 0;
      const finalShift = isDecrypt ? (26 - (shift % 26)) % 26 : (shift % 26);
      const res = inputText.replace(/[a-zA-Z]/g, c => {
        const code = c.charCodeAt(0);
        const base = code >= 97 ? 97 : 65;
        return String.fromCharCode(((code - base + finalShift) % 26) + base);
      });
      setOutputText(res);
    } else if (selectedAlgo === 'rot13') {
      const res = inputText.replace(/[a-zA-Z]/g, c => {
        const code = c.charCodeAt(0);
        const base = code >= 97 ? 97 : 65;
        return String.fromCharCode(((code - base + 13) % 26) + base);
      });
      setOutputText(res);
    } else if (selectedAlgo === 'vigenere') {
      let res = '';
      let keyIdx = 0;
      const cleanKey = keyInput.toUpperCase().replace(/[^A-Z]/g, '');
      if (!cleanKey) {
        setOutputText(inputText);
        return;
      }
      for (let i = 0; i < inputText.length; i++) {
        const char = inputText[i];
        if (/[a-zA-Z]/.test(char)) {
          const isUpper = char === char.toUpperCase();
          const base = isUpper ? 65 : 97;
          const textVal = char.toUpperCase().charCodeAt(0) - 65;
          const keyVal = cleanKey[keyIdx % cleanKey.length].charCodeAt(0) - 65;
          const shift = isDecrypt ? (26 - keyVal) % 26 : keyVal;
          const resVal = (textVal + shift) % 26;
          res += String.fromCharCode(resVal + base);
          keyIdx++;
        } else {
          res += char;
        }
      }
      setOutputText(res);
    } else if (selectedAlgo === 'atbash') {
      const res = inputText.replace(/[a-zA-Z]/g, c => {
        const code = c.charCodeAt(0);
        const base = code >= 97 ? 97 : 65;
        return String.fromCharCode(base + (25 - (code - base)));
      });
      setOutputText(res);
    } else if (selectedAlgo === 'sha256') {
      try {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
          const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(inputText));
          const hash = Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          setOutputText(hash);
        } else {
          setOutputText('Web Crypto API not available in current execution context');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setOutputText(`SHA-256 computation error: ${errorMessage}`);
      }
    }
  };

  const copyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-teal-500/5">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Embedded Offline Interactive Visualizer
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                100% Client-Side
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Run cryptographic operations locally without sending data over the network.
            </p>
          </div>
        </div>

        {/* Algorithm Select Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          {(['caesar', 'vigenere', 'atbash', 'sha256'] as const).map(algo => (
            <button
              key={algo}
              onClick={() => {
                setSelectedAlgo(algo);
                if (algo === 'vigenere' && keyInput === '3') setKeyInput('KEYWORD');
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedAlgo === algo
                  ? 'bg-teal-500 text-black shadow-md shadow-teal-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {algo.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Column */}
        <div className="space-y-4">
          <div>
            <label htmlFor="offlineInput" className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Input Plaintext / Raw Message:
            </label>
            <textarea
              id="offlineInput"
              rows={3}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Enter text to encrypt or hash..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
            />
          </div>

          {selectedAlgo !== 'atbash' && selectedAlgo !== 'sha256' && selectedAlgo !== 'rot13' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="offlineKey" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {selectedAlgo === 'caesar' ? 'Shift Value (0-25):' : 'Key Keyword:'}
                </label>
                <input
                  id="offlineKey"
                  type="text"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Mode:
                </label>
                <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
                  <button
                    onClick={() => setIsDecrypt(false)}
                    className={`flex-1 rounded-lg py-1 text-xs font-semibold ${
                      !isDecrypt ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'text-zinc-400'
                    }`}
                  >
                    Encrypt
                  </button>
                  <button
                    onClick={() => setIsDecrypt(true)}
                    className={`flex-1 rounded-lg py-1 text-xs font-semibold ${
                      isDecrypt ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-zinc-400'
                    }`}
                  >
                    Decrypt
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleCompute}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-black font-bold py-3 text-sm shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.01]"
          >
            <Play className="h-4 w-4 fill-current" />
            Compute Offline Result
          </button>
        </div>

        {/* Result Column */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-400 tracking-wider uppercase">
                Output Ciphertext / Hash Digest
              </span>
              {outputText && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="min-h-[120px] rounded-lg border border-zinc-800/80 bg-black/60 p-3.5 text-sm font-mono text-emerald-400 word-break break-all">
              {outputText || <span className="text-zinc-600 italic">Click "Compute Offline Result" to run algorithm...</span>}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-900 pt-3">
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> Zero Server Latency
            </span>
            <span>Algorithm: {selectedAlgo.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
