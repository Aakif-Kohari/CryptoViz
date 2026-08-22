'use client';

import React, { useState, useEffect } from 'react';
import { RealWorldAssetServiceHandler } from '../../lib/CryptoRwaTokenizationService';
import {
  RealWorldAssetTokenizationOpportunity,
  RwaExecutionAuditRecord,
  RwaFilterOptions,
  RwaAssetCategory,
} from '../../lib/CryptoRwaTokenizationModel';
import { CryptoRwaTokenizationCard } from '../../components/rwa/CryptoRwaTokenizationCard';
import { CryptoRwaTokenizationTimeline } from '../../components/rwa/CryptoRwaTokenizationTimeline';
import {
  Zap,
  Search,
  Filter,
  PlusCircle,
  ShieldCheck,
  Activity,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function CryptoRwaTokenizationAnalyticsPage() {
  const [opportunities, setOpportunities] = useState<RealWorldAssetTokenizationOpportunity[]>([]);
  const [records, setRecords] = useState<RwaExecutionAuditRecord[]>([]);

  const [filters, setFilters] = useState<RwaFilterOptions>({
    assetCategory: 'All',
    issuingProtocol: 'All',
    riskRating: 'All',
    searchQuery: '',
  });

  const [selectedOpportunity, setSelectedOpportunity] = useState<RealWorldAssetTokenizationOpportunity | null>(null);
  const [simulationResult, setSimulationResult] = useState<RwaExecutionAuditRecord | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [customInvestment, setCustomInvestment] = useState<string>('10000');

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('US Dollar Cash Yield Fund');
  const [newCategory, setNewCategory] = useState<RwaAssetCategory>('US Treasury Bills');
  const [newSymbol, setNewSymbol] = useState<string>('USDY');
  const [newProtocol, setNewProtocol] = useState<string>('Ondo Finance');
  const [newTvl, setNewTvl] = useState<string>('50000000');
  const [newPrice, setNewPrice] = useState<string>('1.00');
  const [newYield, setNewYield] = useState<string>('5.20');
  const [newMinInv, setNewMinInv] = useState<string>('1000');
  const [newRating, setNewRating] = useState<'AAA' | 'AA' | 'A' | 'BBB'>('AAA');

  useEffect(() => {
    setOpportunities(RealWorldAssetServiceHandler.fetchOpportunities(filters));
    setRecords(RealWorldAssetServiceHandler.fetchAuditRecords());
  }, []);

  const applyFilterChanges = (updatedFilters: Partial<RwaFilterOptions>) => {
    const nextFilters = { ...filters, ...updatedFilters };
    setFilters(nextFilters);
    setOpportunities(RealWorldAssetServiceHandler.fetchOpportunities(nextFilters));
  };

  const handleRunSimulationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpportunity) return;

    setIsSimulating(true);
    const amount = parseFloat(customInvestment);

    setTimeout(() => {
      const record = RealWorldAssetServiceHandler.executeTokenizationSimulation(selectedOpportunity.id, {
        investmentAmountUsd: amount,
      });
      setSimulationResult(record);
      setOpportunities(RealWorldAssetServiceHandler.fetchOpportunities(filters));
      setRecords(RealWorldAssetServiceHandler.fetchAuditRecords());
      setIsSimulating(false);
    }, 600);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tvl = parseFloat(newTvl);
    const price = parseFloat(newPrice);
    const yieldPct = parseFloat(newYield);
    const minInv = parseFloat(newMinInv);

    if (!Number.isFinite(tvl) || !Number.isFinite(price) || !Number.isFinite(yieldPct) || !Number.isFinite(minInv)) {
      alert('Please enter valid numerical values.');
      return;
    }

    RealWorldAssetServiceHandler.registerOpportunity({
      assetName: newName,
      assetCategory: newCategory,
      tokenSymbol: newSymbol,
      issuingProtocol: newProtocol,
      totalVaultTvUsd: tvl,
      tokenPriceUsd: price,
      annualizedYieldPercent: yieldPct,
      proofOfReserve: {
        attestationId: `ATT-${crypto.randomUUID().substring(0, 8)}`,
        auditorName: 'KPMG',
        verifiedReserveBalanceUsd: tvl * 1.002,
        onChainSupplyTokens: tvl / price,
        reserveRatioPercentage: 100.2,
        lastAuditTimestamp: 'Just now',
      },
      minimumInvestmentUsd: minInv,
      liquidityPoolUsd: tvl * 0.1,
      riskRating: newRating,
    });

    setOpportunities(RealWorldAssetServiceHandler.fetchOpportunities(filters));
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Real-World Asset (RWA) Tokenization & Proof-of-Reserves Suite
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              RWA Tokenization & Treasury Analytics
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Verify institutional real-world asset tokenization vaults, monitor proof-of-reserve attestations, and simulate yield generation.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 text-sm"
              >
                <PlusCircle className="w-5 h-5 fill-current" />
                Register RWA Tokenization Vault
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by RWA asset name, token symbol (bIB01, CF-USDC), or issuing protocol..."
                value={filters.searchQuery}
                onChange={(e) => applyFilterChanges({ searchQuery: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filters.assetCategory}
                onChange={(e) => applyFilterChanges({ assetCategory: e.target.value })}
                className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-semibold focus:outline-none focus:border-emerald-500/50"
              >
                <option value="All">All Categories</option>
                <option value="US Treasury Bills">US Treasury Bills</option>
                <option value="Private Credit">Private Credit</option>
                <option value="Commercial Real Estate">Commercial Real Estate</option>
              </select>

              <select
                value={filters.riskRating}
                onChange={(e) => applyFilterChanges({ riskRating: e.target.value })}
                className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-semibold focus:outline-none focus:border-emerald-500/50"
              >
                <option value="All">All Ratings</option>
                <option value="AAA">AAA Rated</option>
                <option value="AA">AA Rated</option>
                <option value="A">A Rated</option>
                <option value="BBB">BBB Rated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-extrabold text-2xl text-white flex items-center gap-2 tracking-tight">
            <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400" />
            Tokenized RWA Vaults ({opportunities.length})
          </h2>

          {opportunities.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">No tokenized RWA vaults found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.map((opp) => (
                <CryptoRwaTokenizationCard
                  key={opp.id}
                  opportunity={opp}
                  onExecuteClick={(o) => {
                    setSelectedOpportunity(o);
                    setCustomInvestment(o.minimumInvestmentUsd.toString());
                    setSimulationResult(null);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <CryptoRwaTokenizationTimeline records={records} />

        {selectedOpportunity && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              {simulationResult ? (
                <div className="text-center py-6 space-y-4">
                  {simulationResult.status === 'TOKENIZED_VERIFIED' ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                      <h3 className="text-2xl font-black text-white">TOKENIZED_VERIFIED</h3>
                      <p className="text-sm text-slate-300">
                        Tokens minted: {simulationResult.tokensIssued} {simulationResult.tokenSymbol}. Yield: +${simulationResult.yieldGeneratedUsd.toLocaleString()}/yr.
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
                      <h3 className="text-2xl font-black text-white">COMPLIANCE_REVERT</h3>
                      <p className="text-sm text-rose-400 font-semibold">
                        Reason: {simulationResult.failureReason}
                      </p>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedOpportunity(null)}
                    className="w-full bg-slate-800 text-white font-bold py-3 rounded-2xl hover:bg-slate-700 text-sm"
                  >
                    Return to RWA Treasury Suite
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRunSimulationSubmit} className="space-y-5">
                  <div>
                    <h3 className="font-black text-white text-2xl">
                      {selectedOpportunity.assetName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Protocol: {selectedOpportunity.issuingProtocol} | APY: {selectedOpportunity.annualizedYieldPercent}%
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Investment Amount ($ USD)
                    </label>
                    <input
                      type="text"
                      value={customInvestment}
                      onChange={(e) => setCustomInvestment(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSimulating}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold py-3.5 rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    {isSimulating ? 'Simulating Mint & Attestation...' : 'Simulate RWA Investment'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-black text-white">Register RWA Tokenization Vault</h3>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Asset Name</label>
                    <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Symbol</label>
                    <input type="text" required value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Protocol</label>
                    <input type="text" required value={newProtocol} onChange={(e) => setNewProtocol(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Vault TVL ($)</label>
                    <input type="text" required value={newTvl} onChange={(e) => setNewTvl(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg">
                  Register RWA Vault Node
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
