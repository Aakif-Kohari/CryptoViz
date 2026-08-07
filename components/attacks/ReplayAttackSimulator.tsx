'use client';

import React, { useState } from 'react';
import { ShieldAlert, Play, RefreshCw, Send, CheckCircle2, XCircle, Clock, KeyRound } from 'lucide-react';

export default function ReplayAttackSimulator() {
  const [useNonce, setUseNonce] = useState<boolean>(false);
  const [transactionAmount, setTransactionAmount] = useState<number>(500);
  const [capturedPayload, setCapturedPayload] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{ step: string; status: 'legit' | 'attack' | 'rejected'; text: string }>>([]);

  const handleSendLegitTransaction = () => {
    const nonce = useNonce ? `&nonce=${Math.floor(Math.random() * 1000000)}&ts=${Date.now()}` : '';
    const payload = `action=TRANSFER&amount=$${transactionAmount}&to=BOB${nonce}`;
    setCapturedPayload(payload);

    setLogs((prev) => [
      ...prev,
      {
        step: '1. Legitimate Transmission',
        status: 'legit',
        text: `Alice sent payload to Bank: "${payload}" → ACCEPTED`,
      },
    ]);
  };

  const handleReplayAttack = () => {
    if (!capturedPayload) return;

    if (useNonce) {
      setLogs((prev) => [
        ...prev,
        {
          step: '2. Replay Attack Intercepted',
          status: 'rejected',
          text: `Attacker replayed "${capturedPayload}" → REJECTED (Duplicate nonce / Expired timestamp)`,
        },
      ]);
    } else {
      setLogs((prev) => [
        ...prev,
        {
          step: '2. Replay Attack Success',
          status: 'attack',
          text: `Attacker replayed "${capturedPayload}" → ACCEPTED! Additional $${transactionAmount} transferred illegally!`,
        },
      ]);
    }
  };

  const handleReset = () => {
    setCapturedPayload(null);
    setLogs([]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-500/10 via-rose-500/5 to-transparent p-8 backdrop-blur-2xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400">
          <ShieldAlert className="h-3.5 w-3.5" />
          REPLAY ATTACK SIMULATION
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
          Network Protocol Replay Attack
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
          Demonstrates how an eavesdropping malicious actor can intercept valid encrypted or signed transmission payloads and re-send them to duplicate transactions, unless cryptographic nonces or timestamps are enforced.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scenario Settings */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            1. Configure Protocol Protections
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-zinc-900 dark:text-white">Enable Nonce & Timestamp Mitigation</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Appends one-time nonce tokens to prevent message replay.</div>
            </div>
            <button
              onClick={() => setUseNonce((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useNonce ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useNonce ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleSendLegitTransaction}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-md"
            >
              <Send className="h-4 w-4" />
              1. Alice Sends $500
            </button>
            <button
              onClick={handleReplayAttack}
              disabled={!capturedPayload}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-40 transition-colors shadow-md"
            >
              <ShieldAlert className="h-4 w-4" />
              2. Attacker Replays Message
            </button>
          </div>
        </div>

        {/* Captured Payload Box */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-purple-500" />
              Intercepted Network Packet
            </h3>
            {logs.length > 0 && (
              <button onClick={handleReset} className="text-xs font-semibold text-zinc-400 hover:text-zinc-600">
                Clear Simulation
              </button>
            )}
          </div>

          <div className="rounded-xl bg-zinc-950 p-4 font-mono text-xs text-emerald-400 min-h-[90px] break-all border border-zinc-800 flex items-center">
            {capturedPayload ? capturedPayload : '(No packet captured on network tap yet...)'}
          </div>
        </div>
      </div>

      {/* Log Output */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          Server Audit Log & Protection Response
        </h3>

        {logs.length === 0 ? (
          <p className="text-xs text-zinc-400">Click "Alice Sends $500" to initiate transaction flow.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-3 ${
                  log.status === 'legit'
                    ? 'border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-300'
                    : log.status === 'attack'
                    ? 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300'
                    : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {log.status === 'legit' && <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />}
                {log.status === 'attack' && <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
                {log.status === 'rejected' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                <div>
                  <div className="font-bold">{log.step}</div>
                  <div className="font-mono text-[11px] mt-0.5">{log.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
