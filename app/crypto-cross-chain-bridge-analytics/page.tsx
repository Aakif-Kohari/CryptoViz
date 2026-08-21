'use client';

import React, { useState, useEffect } from 'react';
import { CrossChainBridgeServiceHandler } from '../../lib/CryptoCrossChainBridgeService';
import {
  CrossChainBridgeOpportunity,
  CrossChainBridgeAuditRecord,
  BridgeFilterOptions,
  BridgeProtocolName,
} from '../../lib/CryptoCrossChainBridgeModel';
import { CryptoCrossChainBridgeCard } from '../../components/bridge/CryptoCrossChainBridgeCard';
import { CryptoCrossChainBridgeTimeline } from '../../components/bridge/CryptoCrossChainBridgeTimeline';
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

export default function CryptoCrossChainBridgeAnalyticsPage() {
  const [opportunities, setOpportunities] = useState<CrossChainBridgeOpportunity[]>([]);
  const [records, setRecords] = useState<CrossChainBridgeAuditRecord[]>([]);

  const [filters, setFilters] = useState<BridgeFilterOptions>({
    sourceChain: 'All',
    targetChain: 'All',
    assetSymbol: 'All',
    protocol: 'All',
    searchQuery: '',
  });

  const [selectedOpportunity, setSelectedOpportunity] = useState<CrossChainBridgeOpportunity | null>(null);
  const [simulationResult, setSimulationResult] = useState<CrossChainBridgeAuditRecord | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newSourceChain, setNewSourceChain] = useState<string>('Ethereum');
  const [newTargetChain, setNewTargetChain] = useState<string>('Polygon');
  const [newAsset, setNewAsset] = useState<string>('USDC');
  const [newProtocol, setNewProtocol] = useState<BridgeProtocolName>('Stargate');
  const [newAmount, setNewAmount] = useState<string>('150000');
  const [newFee, setNewFee] = useState<string>('120');
  const [newTime, setNewTime] = useState<string>('2');
  const [newLiquidity, setNewLiquidity] = useState<string>('2500000');
  const [newRisk, setNewRisk] = useState<'low' | 'moderate' | 'high' | 'extreme'>('low');

  useEffect(() => {
    setOpportunities(CrossChainBridgeServiceHandler.fetchOpportunities(filters));
    setRecords(CrossChainBridgeServiceHandler.fetchAuditRecords());
  }, []);

  const applyFilterChanges = (updatedFilters: Partial<BridgeFilterOptions>) => {
    const nextFilters = { ...filters, ...updatedFilters };
    setFilters(nextFilters);
    setOpportunities(CrossChainBridgeServiceHandler.fetchOpportunities(nextFilters));
  };

  const handleRunSimulationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpportunity) return;

    setIsSimulating(true);

    setTimeout(() => {
      const record = CrossChainBridgeServiceHandler.executeBridgeSimulation(selectedOpportunity.id);
      setSimulationResult(record);
      setOpportunities(CrossChainBridgeServiceHandler.fetchOpportunities(filters));
      setRecords(CrossChainBridgeServiceHandler.fetchAuditRecords());
      setIsSimulating(false);
    }, 600);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newAmount);
    const fee = parseFloat(newFee);
    const time = parseFloat(newTime);
    const liquidity = parseFloat(newLiquidity);

    if (!Number.isFinite(amount) || !Number.isFinite(fee) || !Number.isFinite(time) || !Number.isFinite(liquidity)) {
      alert('Please enter valid numerical values for bridge parameters.');
      return;
    }

    CrossChainBridgeServiceHandler.registerOpportunity({
      sourceChain: newSourceChain,
      targetChain: newTargetChain,
      assetSymbol: newAsset,
      transferAmountUsd: amount,
      protocol: newProtocol,
      routes: [
        { step: 1, bridgeName: newProtocol, sourceChain: newSourceChain, targetChain: newTargetChain, estimatedTimeSeconds: time * 60, bridgeFeePercent: 0.05, relayerFeeUsd: fee },
      ],
      estimatedTotalFeeUsd: fee,
      estimatedNetReceivedUsd: amount - fee,
      estimatedCompletionMinutes: time,
      availableBridgeLiquidityUsd: liquidity,
      executionRisk: newRisk,
      maxAllowedSlippagePercent: 0.5,
      maxAllowedGasFeeUsd: fee * 2,
    });

    setOpportunities(CrossChainBridgeServiceHandler.fetchOpportunities(filters));
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Cross-Chain Bridge Liquidity & Route Optimizing Suite
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Cross-Chain Bridge Analytics Suite
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Track cross-chain bridge liquidity, optimize multi-hop relayer routes, and evaluate cross-chain execution constraints in real time.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 text-sm"
              >
                <PlusCircle className="w-5 h-5 fill-current" />
                Register Bridge Route Node
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
                placeholder="Search by chain, asset (USDC, WETH), or protocol (Stargate, Across)..."
                value={filters.searchQuery}
                onChange={(e) => applyFilterChanges({ searchQuery: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filters.assetSymbol}
                onChange={(e) => applyFilterChanges({ assetSymbol: e.target.value })}
                className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-semibold focus:outline-none focus:border-cyan-500/50"
              >
                <option value="All">All Assets</option>
                <option value="USDC">USDC</option>
                <option value="WETH">WETH</option>
                <option value="USDT">USDT</option>
              </select>

              <select
                value={filters.protocol}
                onChange={(e) => applyFilterChanges({ protocol: e.target.value })}
                className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-semibold focus:outline-none focus:border-cyan-500/50"
              >
                <option value="All">All Protocols</option>
                <option value="Stargate">Stargate</option>
                <option value="Across">Across</option>
                <option value="Hop Protocol">Hop Protocol</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-extrabold text-2xl text-white flex items-center gap-2 tracking-tight">
            <Zap className="w-6 h-6 text-cyan-400 fill-cyan-400" />
            Cross-Chain Liquidity Routes ({opportunities.length})
          </h2>

          {opportunities.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">No active bridge routes found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.map((opp) => (
                <CryptoCrossChainBridgeCard
                  key={opp.id}
                  opportunity={opp}
                  onExecuteClick={(o) => {
                    setSelectedOpportunity(o);
                    setSimulationResult(null);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <CryptoCrossChainBridgeTimeline records={records} />

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
                  {simulationResult.status === 'BRIDGE_EXECUTED' ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                      <h3 className="text-2xl font-black text-white">BRIDGE_EXECUTED</h3>
                      <p className="text-sm text-slate-300">
                        Bridge transfer succeeded! Net received: ${simulationResult.netReceivedUsd.toLocaleString()} USD.
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
                      <h3 className="text-2xl font-black text-white">BRIDGE_REVERTED</h3>
                      <p className="text-sm text-rose-400 font-semibold">
                        Reason: {simulationResult.failureReason || 'BRIDGE_FAILED'}
                      </p>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedOpportunity(null)}
                    className="w-full bg-slate-800 text-white font-bold py-3 rounded-2xl hover:bg-slate-700 text-sm"
                  >
                    Return to Bridge Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRunSimulationSubmit} className="space-y-5">
                  <div>
                    <h3 className="font-black text-white text-2xl">
                      {selectedOpportunity.sourceChain} ➔ {selectedOpportunity.targetChain}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Protocol: {selectedOpportunity.protocol} | Asset: {selectedOpportunity.assetSymbol}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSimulating}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold py-3.5 rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    {isSimulating ? 'Simulating Bridge Route...' : 'Confirm & Execute Bridge Transfer'}
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
                <h3 className="text-2xl font-black text-white">Register Bridge Route Node</h3>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Source Chain</label>
                    <input type="text" required value={newSourceChain} onChange={(e) => setNewSourceChain(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Target Chain</label>
                    <input type="text" required value={newTargetChain} onChange={(e) => setNewTargetChain(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Asset</label>
                    <input type="text" required value={newAsset} onChange={(e) => setNewAsset(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Amount ($)</label>
                    <input type="text" required value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg">
                  Register Route Node
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
