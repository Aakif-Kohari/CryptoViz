'use client';

import React from 'react';
import { CrossChainBridgeOpportunity } from '../../lib/CryptoCrossChainBridgeModel';
import { ArrowRight, Zap, ShieldAlert, CheckCircle2, Clock, DollarSign } from 'lucide-react';

interface CardProps {
  opportunity: CrossChainBridgeOpportunity;
  onExecuteClick: (opp: CrossChainBridgeOpportunity) => void;
}

export const CryptoCrossChainBridgeCard: React.FC<CardProps> = ({ opportunity, onExecuteClick }) => {
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'moderate':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'high':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE_MONITORING':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'ROUTING_SIMULATION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
      case 'BRIDGE_EXECUTED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'BRIDGE_REVERTED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            {opportunity.protocol}
          </span>
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getStatusBadge(opportunity.status)}`}>
            {opportunity.status}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight group-hover:text-cyan-400 transition-colors">
              {opportunity.assetSymbol} Transfer
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Detected {opportunity.detectedTimestamp} • Liquidity ${opportunity.availableBridgeLiquidityUsd.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-cyan-400 block tracking-tight">
              ${opportunity.transferAmountUsd.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Est. Net Rec. (${opportunity.estimatedNetReceivedUsd.toLocaleString()})
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 mb-4 text-xs">
          <div className="flex items-center justify-between text-slate-200 font-bold mb-2">
            <span className="text-indigo-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              {opportunity.sourceChain}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="text-purple-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              {opportunity.targetChain}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Est. Time: {opportunity.estimatedCompletionMinutes} min
            </div>
            <div className="flex items-center gap-1 justify-end">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Bridge Fee: ${opportunity.estimatedTotalFeeUsd}
            </div>
          </div>
        </div>

        <div className="bg-slate-950/40 rounded-2xl p-3.5 mb-5 space-y-2 text-xs border border-slate-800/40">
          <div className="flex justify-between">
            <span className="text-slate-400">Execution Risk Profile:</span>
            <span className={`font-extrabold uppercase px-2 py-0.5 rounded border text-[10px] ${getRiskBadge(opportunity.executionRisk)}`}>
              {opportunity.executionRisk} Risk
            </span>
          </div>
          {opportunity.failureReason && (
            <div className="flex justify-between border-t border-rose-500/20 pt-2 text-rose-400 font-bold">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Revert Reason:
              </span>
              <span>{opportunity.failureReason}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onExecuteClick(opportunity)}
        disabled={opportunity.status === 'BRIDGE_EXECUTED' || opportunity.status === 'BRIDGE_REVERTED'}
        className={`w-full font-extrabold text-sm py-3 px-4 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
          opportunity.status === 'BRIDGE_EXECUTED' || opportunity.status === 'BRIDGE_REVERTED'
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
        }`}
      >
        <Zap className="w-4 h-4 fill-current" />
        {opportunity.status === 'BRIDGE_EXECUTED'
          ? 'Bridge Executed'
          : opportunity.status === 'BRIDGE_REVERTED'
          ? 'Bridge Reverted'
          : 'Simulate Cross-Chain Route'}
      </button>
    </div>
  );
};
