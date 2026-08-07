'use client';

import React, { useState, useMemo } from 'react';
import {
  Coins,
  Shield,
  Lock,
  Key,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  BookOpen,
  RefreshCw,
  Zap,
  Cpu,
  ShieldAlert,
  Sliders,
  Send,
  Eye,
  Flame,
} from 'lucide-react';
import {
  BlockchainNetwork,
  BlockchainKeyPair,
  EthereumTxInput,
  BitcoinTxInput,
  SignedBlockchainTx,
  generateBlockchainKeyPair,
  createAndSignEthereumTx,
  createAndSignBitcoinTx,
  ecrecover,
  simulateNonceReuseAttack,
  simulateSignatureMalleability,
} from '@/lib/blockchain/blockchainEngine';

const ETHEREUM_TX_PRESET: EthereumTxInput = {
  nonce: 12,
  gasPriceGwei: 28.5,
  gasLimit: 21000,
  toAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  valueEth: 1.5,
  dataPayloadHex: '00',
  chainId: 1,
};

const BITCOIN_TX_PRESET: BitcoinTxInput = {
  version: 2,
  inputTxHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
  inputVout: 0,
  outputAddress: 'bc1p0xlxvlhemja6w4dqv2uf2wak2jchd2e2qqx92v',
  valueBtc: 0.5,
  feeBtc: 0.00015,
  locktime: 0,
};

const PRESETS = [
  {
    name: 'Ethereum Mainnet Transfer (secp256k1 ECDSA)',
    network: 'Ethereum' as BlockchainNetwork,
    ethTx: ETHEREUM_TX_PRESET,
  },
  {
    name: 'Bitcoin Taproot Transfer (BIP-340 Schnorr)',
    network: 'Bitcoin' as BlockchainNetwork,
    btcTx: BITCOIN_TX_PRESET,
  },
];

export default function BlockchainExplorer() {
  const [activeTab, setActiveTab] = useState<'builder' | 'ecrecover' | 'math' | 'attack' | 'theory'>('builder');
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>('Ethereum');
  const [seed, setSeed] = useState<string>('alice_wallet');
  const [useSchnorr, setUseSchnorr] = useState<boolean>(true);
  const [attackMode, setAttackMode] = useState<'NONE' | 'NONCE_REUSE' | 'MALLEABILITY' | 'TAMPER'>('NONE');

  // KeyPair state
  const keyPair: BlockchainKeyPair = useMemo(() => {
    return generateBlockchainKeyPair(selectedNetwork, seed);
  }, [selectedNetwork, seed]);

  // Tx Inputs state
  const [ethInput, setEthInput] = useState<EthereumTxInput>(ETHEREUM_TX_PRESET);
  const [btcInput, setBtcInput] = useState<BitcoinTxInput>(BITCOIN_TX_PRESET);

  // Signed Tx computation
  const signedTx: SignedBlockchainTx = useMemo(() => {
    if (selectedNetwork === 'Ethereum') {
      return createAndSignEthereumTx(keyPair, ethInput);
    } else {
      return createAndSignBitcoinTx(keyPair, btcInput, useSchnorr);
    }
  }, [selectedNetwork, keyPair, ethInput, btcInput, useSchnorr]);

  // Nonce Reuse Attack result
  const nonceAttackResult = useMemo(() => {
    return simulateNonceReuseAttack(keyPair);
  }, [keyPair]);

  // Malleability result
  const malleabilityResult = useMemo(() => {
    if (signedTx.scheme.includes('ECDSA')) {
      return simulateSignatureMalleability(signedTx.signature as any);
    }
    return null;
  }, [signedTx]);

  const handleNetworkSwitch = (net: BlockchainNetwork) => {
    setSelectedNetwork(net);
    setAttackMode('NONE');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-amber-950/50 via-zinc-900 to-purple-950/50 border border-amber-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              <Coins className="w-4 h-4 text-amber-400" />
              Ethereum (secp256k1) & Bitcoin (Taproot Schnorr) Standards
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Blockchain Transaction Signature Explorer
            </h2>
            <p className="mt-2 text-zinc-300 max-w-3xl leading-relaxed text-sm sm:text-base">
              Explore elliptic curve transaction cryptography. Understand <b>secp256k1 ECDSA (r, s, v)</b>, Ethereum&apos;s <b>ecrecover precompile</b>, BIP-340 Schnorr signatures, and Nonce Reuse Private Key extraction attacks.
            </p>
          </div>

          {/* Network Selector Buttons */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            {(['Ethereum', 'Bitcoin'] as BlockchainNetwork[]).map(net => (
              <button
                key={net}
                onClick={() => handleNetworkSwitch(net)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                  selectedNetwork === net
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700/80 hover:text-white'
                }`}
              >
                {net} Network
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 scrollbar-hide">
        {[
          { id: 'builder', label: 'Tx Builder & Signer', icon: Send },
          { id: 'ecrecover', label: 'ecrecover Key Recovery', icon: Eye },
          { id: 'math', label: 'secp256k1 & Schnorr Math', icon: Sliders },
          { id: 'attack', label: 'Nonce Reuse & Attack Lab', icon: Flame },
          { id: 'theory', label: 'Standards & Security Theory', icon: BookOpen },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: TX BUILDER & SIGNER */}
      {activeTab === 'builder' && (
        <div className="space-y-8">
          {/* KeyPair & Wallet Header */}
          <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                Active Wallet Identity ({selectedNetwork})
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-medium">Seed:</span>
                <input
                  type="text"
                  value={seed}
                  onChange={e => setSeed(e.target.value)}
                  className="px-3 py-1 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-amber-500 font-bold block uppercase">Signer Private Key ($d$)</span>
                <p className="text-zinc-900 dark:text-white break-all">{keyPair.privateKeyHex}</p>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-amber-500 font-bold block uppercase">Derived Wallet Address</span>
                <p className="text-zinc-900 dark:text-white break-all font-bold">{keyPair.address}</p>
              </div>
            </div>
          </div>

          {/* Transaction Parameters & Signing Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Inputs */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  {selectedNetwork} Transaction Fields
                </h3>

                {selectedNetwork === 'Ethereum' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Recipient Address (to)
                      </label>
                      <input
                        type="text"
                        value={ethInput.toAddress}
                        onChange={e => setEthInput({ ...ethInput, toAddress: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Amount (ETH)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={ethInput.valueEth}
                          onChange={e => setEthInput({ ...ethInput, valueEth: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Nonce
                        </label>
                        <input
                          type="number"
                          value={ethInput.nonce}
                          onChange={e => setEthInput({ ...ethInput, nonce: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Output Address (Recipient)
                      </label>
                      <input
                        type="text"
                        value={btcInput.outputAddress}
                        onChange={e => setBtcInput({ ...btcInput, outputAddress: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="schnorrCheck"
                        checked={useSchnorr}
                        onChange={e => setUseSchnorr(e.target.checked)}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
                      />
                      <label htmlFor="schnorrCheck" className="text-xs font-bold text-amber-400">
                        Use Taproot Schnorr Signature (BIP-340)
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Output Inspector */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    Signed Transaction Cryptographic Output
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Inspect RLP / Raw tx payload, Tx hash digest, and signature parameters.
                  </p>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500 font-bold uppercase block">1. Transaction Hash Digest</span>
                    <p className="text-amber-500 font-bold mt-1 break-all">{signedTx.txHashHex}</p>
                  </div>

                  {signedTx.scheme.includes('ECDSA') ? (
                    <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <span className="text-amber-500 font-bold uppercase block">2. ECDSA Signature Components (r, s, v)</span>
                      <p className="text-zinc-300 break-all">r: {(signedTx.signature as any).rHex}</p>
                      <p className="text-zinc-300 break-all">s: {(signedTx.signature as any).sHex}</p>
                      <p className="text-zinc-300">v (Recovery ID): {(signedTx.signature as any).v}</p>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <span className="text-amber-500 font-bold uppercase block">2. Schnorr Signature Components (R, s)</span>
                      <p className="text-zinc-300 break-all">R (Point): {(signedTx.signature as any).rPointHex}</p>
                      <p className="text-zinc-300 break-all">s (Scalar): {(signedTx.signature as any).sScalarHex}</p>
                    </div>
                  )}

                  {signedTx.recoveredAddress && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-emerald-400 font-bold block uppercase text-[10px]">
                          EVM ecrecover Verification
                        </span>
                        <p className="text-zinc-200 font-bold text-xs">{signedTx.recoveredAddress}</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ECRECOVER KEY RECOVERY INSPECTOR */}
      {activeTab === 'ecrecover' && (
        <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-500" />
              Ethereum `ecrecover` EVM Precompile Inspector
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Ethereum transactions do NOT include the sender&apos;s public key in the payload to save gas. Instead, EVM nodes use <b>ecrecover(h, v, r, s)</b> to mathematically compute the public key directly!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h4 className="text-sm font-bold text-amber-500 uppercase">1. Why `ecrecover` is Useful</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                In standard ECDSA verification, you need $(m, r, s, Q)$. In Ethereum, because the curve point $R = (r, y)$ can be reconstructed using $v$, nodes solve for public key $Q$:
              </p>
              <p className="font-mono text-xs p-3 bg-zinc-100 dark:bg-zinc-900 text-amber-400 rounded-xl">
                Q = r^-1 * (s * R - H(m) * G)
              </p>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h4 className="text-sm font-bold text-emerald-400 uppercase">2. Address Derivation Step</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Once public key $Q$ (64 bytes) is recovered, the EVM hashes $Q$ with Keccak-256 and takes the last 20 bytes to verify the `from` address:
              </p>
              <p className="font-mono text-xs p-3 bg-zinc-100 dark:bg-zinc-900 text-emerald-400 rounded-xl">
                Address = Keccak256(Q)[12..31]
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CURVE MATH & SIGNATURE LAB */}
      {activeTab === 'math' && (
        <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              secp256k1 Curve Math & Schnorr vs ECDSA
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Both Bitcoin and Ethereum use the <b>secp256k1 Koblitz curve</b> ($y^2 = x^3 + 7 \pmod p$).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-bold uppercase text-amber-500">secp256k1 Curve Parameters</span>
              <p className="text-xs text-zinc-300 font-mono">Equation: y^2 = x^3 + 7 (mod p)</p>
              <p className="text-xs text-zinc-400 mt-1">p: 2^256 - 2^32 - 977 (256-bit prime)</p>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-bold uppercase text-amber-500">ECDSA Signature Equations</span>
              <p className="text-xs text-zinc-300 font-mono">r = (k * G)_x mod n</p>
              <p className="text-xs text-zinc-300 font-mono">s = k^-1 * (m + d*r) mod n</p>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-bold uppercase text-amber-500">BIP-340 Schnorr Signatures</span>
              <p className="text-xs text-zinc-300 font-mono">R = k * G</p>
              <p className="text-xs text-zinc-300 font-mono">s = k + H(R || Q || m) * d</p>
              <p className="text-xs text-emerald-400 mt-1">Allows linear signature aggregation!</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NONCE REUSE & ATTACK LAB */}
      {activeTab === 'attack' && (
        <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              Nonce Reuse Attack & Signature Malleability Lab
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Demonstrate famous blockchain vulnerabilities: reusing ephemeral nonce $k$ in ECDSA allows an attacker to instantly extract the private key!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setAttackMode('NONCE_REUSE')}
              className={`p-4 rounded-xl border text-left transition-all ${
                attackMode === 'NONCE_REUSE'
                  ? 'bg-rose-500 text-zinc-950 border-rose-400 font-bold shadow-lg shadow-rose-500/20'
                  : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <div className="text-xs font-extrabold uppercase">1. Nonce Reuse Attack (Extract Private Key)</div>
              <div className="text-xs text-zinc-500 mt-1">Simulate reused $k$ across Tx1 and Tx2</div>
            </button>

            <button
              onClick={() => setAttackMode('MALLEABILITY')}
              className={`p-4 rounded-xl border text-left transition-all ${
                attackMode === 'MALLEABILITY'
                  ? 'bg-rose-500 text-zinc-950 border-rose-400 font-bold shadow-lg shadow-rose-500/20'
                  : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <div className="text-xs font-extrabold uppercase">2. Signature Malleability Test</div>
              <div className="text-xs text-zinc-500 mt-1">Flip $s \rightarrow n - s$ (Low-S check)</div>
            </button>
          </div>

          {/* Attack Output Box */}
          {attackMode === 'NONCE_REUSE' && (
            <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-base font-bold text-rose-400">CATASTROPHIC VULNERABILITY: Private Key Extracted</h4>
                  <p className="text-xs text-zinc-300 mt-1">{nonceAttackResult.explanation}</p>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl font-mono text-xs space-y-1 border border-rose-500/30">
                <p className="text-zinc-400">Reused Nonce k: {nonceAttackResult.reusedNonceHex.slice(0, 32)}...</p>
                <p className="text-rose-400 font-bold">Extracted Victim Private Key d: {nonceAttackResult.extractedPrivateKeyHex}</p>
              </div>
            </div>
          )}

          {attackMode === 'MALLEABILITY' && malleabilityResult && (
            <div className="p-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-amber-500 uppercase">ECDSA Signature Malleability Demonstration</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{malleabilityResult.explanation}</p>
              <div className="font-mono text-xs space-y-1">
                <p className="text-zinc-400">Original S: {malleabilityResult.originalS}</p>
                <p className="text-amber-400 font-bold">Malleable Alternate S (n - s): {malleabilityResult.malleableS}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: THEORY & STANDARDS HUB */}
      {activeTab === 'theory' && (
        <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              Blockchain Transaction Standards Guide
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Overview of EIPs, BIPs, and cryptographic best practices securing modern decentralized networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="text-sm font-bold text-amber-400">1. EIP-155: Replay Protection</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                EIP-155 encodes the chain ID directly into the v component of the ECDSA signature. This prevents a valid transaction signed on Ethereum Mainnet from being replayed on Ethereum Classic or Polygon!
              </p>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="text-sm font-bold text-amber-400">2. BIP-340: Taproot Schnorr Signatures</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Introduced in Bitcoin&apos;s Taproot upgrade, Schnorr signatures replace legacy ECDSA. Schnorr offers 64-byte linear signatures that support multi-signature aggregation (MuSig) where multiple signers merge public keys into a single public key!
              </p>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="text-sm font-bold text-amber-400">3. RFC 6979: Deterministic Nonces</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                To eliminate Nonce Reuse Attacks caused by bad random number generators (RNGs), RFC 6979 derives an ephemeral nonce deterministically, ensuring it is always unique per message without relying on system entropy.
              </p>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="text-sm font-bold text-amber-400">4. Hardware Wallet Security (Ledger / Trezor)</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Hardware wallets isolate the private key inside a Secure Element (SE) chip. The raw transaction payload is sent over USB/Bluetooth to the hardware wallet, which displays transaction details for physical button confirmation before signing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
