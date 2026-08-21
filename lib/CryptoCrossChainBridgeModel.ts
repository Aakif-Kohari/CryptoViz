/**
 * Cross-Chain Bridge Liquidity & Route Optimization Domain Model.
 * Data structures, route definitions, bridge protocol interfaces, and domain state.
 */

export type BridgeProtocolName = 'Stargate' | 'Hop Protocol' | 'Synapse' | 'Across' | 'Celer cBridge';
export type CrossChainStatus = 'ACTIVE_MONITORING' | 'ROUTING_SIMULATION' | 'BRIDGE_EXECUTED' | 'BRIDGE_REVERTED';
export type BridgeExecutionRisk = 'low' | 'moderate' | 'high' | 'extreme';

export interface BridgeHopRoute {
  step: number;
  bridgeName: BridgeProtocolName;
  sourceChain: string;
  targetChain: string;
  estimatedTimeSeconds: number;
  bridgeFeePercent: number;
  relayerFeeUsd: number;
}

export interface CrossChainBridgeOpportunity {
  id: string;
  sourceChain: string;
  targetChain: string;
  assetSymbol: string;
  transferAmountUsd: number;
  protocol: BridgeProtocolName;
  routes: BridgeHopRoute[];
  estimatedTotalFeeUsd: number;
  estimatedNetReceivedUsd: number;
  estimatedCompletionMinutes: number;
  availableBridgeLiquidityUsd: number;
  executionRisk: BridgeExecutionRisk;
  status: CrossChainStatus;
  detectedTimestamp: string;
  maxAllowedSlippagePercent: number;
  maxAllowedGasFeeUsd: number;
  failureReason?: string;
  bridgeTxHash?: string;
}

export interface CrossChainBridgeAuditRecord {
  id: string;
  opportunityId: string;
  sourceChain: string;
  targetChain: string;
  assetSymbol: string;
  transferAmountUsd: number;
  netReceivedUsd: number;
  totalFeePaidUsd: number;
  executionTxHash: string;
  executedTimestamp: string;
  status: 'BRIDGE_EXECUTED' | 'BRIDGE_REVERTED';
  failureReason?: string;
}

export interface BridgeFilterOptions {
  sourceChain: string;
  targetChain: string;
  assetSymbol: string;
  protocol: string;
  searchQuery: string;
}

export class CrossChainBridgeDomainState {
  private opportunities: Map<string, CrossChainBridgeOpportunity>;
  private auditRecords: Map<string, CrossChainBridgeAuditRecord>;
  private opportunityAuditMap: Map<string, CrossChainBridgeAuditRecord>;

  constructor(
    initialOpps: CrossChainBridgeOpportunity[] = [],
    initialRecords: CrossChainBridgeAuditRecord[] = []
  ) {
    this.opportunities = new Map();
    this.auditRecords = new Map();
    this.opportunityAuditMap = new Map();

    initialOpps.forEach((o) => this.opportunities.set(o.id, { ...o }));
    initialRecords.forEach((r) => {
      this.auditRecords.set(r.id, { ...r });
      this.opportunityAuditMap.set(r.opportunityId, { ...r });
    });
  }

  public getOpportunities(filters?: Partial<BridgeFilterOptions>): CrossChainBridgeOpportunity[] {
    let result = Array.from(this.opportunities.values());
    if (!filters) return result;

    if (filters.sourceChain && filters.sourceChain !== 'All') {
      result = result.filter((o) => o.sourceChain === filters.sourceChain);
    }
    if (filters.targetChain && filters.targetChain !== 'All') {
      result = result.filter((o) => o.targetChain === filters.targetChain);
    }
    if (filters.assetSymbol && filters.assetSymbol !== 'All') {
      result = result.filter((o) => o.assetSymbol === filters.assetSymbol);
    }
    if (filters.protocol && filters.protocol !== 'All') {
      result = result.filter((o) => o.protocol === filters.protocol);
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.sourceChain.toLowerCase().includes(q) ||
          o.targetChain.toLowerCase().includes(q) ||
          o.assetSymbol.toLowerCase().includes(q) ||
          o.protocol.toLowerCase().includes(q)
      );
    }
    return result;
  }

  public getOpportunityById(id: string): CrossChainBridgeOpportunity | undefined {
    const opp = this.opportunities.get(id);
    return opp ? { ...opp } : undefined;
  }

  public registerOpportunity(
    opp: Omit<CrossChainBridgeOpportunity, 'id' | 'status' | 'detectedTimestamp'>
  ): CrossChainBridgeOpportunity {
    const id = `bridge-node-${crypto.randomUUID()}`;
    const newOpp: CrossChainBridgeOpportunity = {
      ...opp,
      id,
      status: 'ACTIVE_MONITORING',
      detectedTimestamp: 'Just now',
    };
    this.opportunities.set(id, newOpp);
    return { ...newOpp };
  }

  public updateStatus(id: string, status: CrossChainStatus, failureReason?: string, txHash?: string): void {
    const opp = this.opportunities.get(id);
    if (!opp) throw new Error(`Bridge opportunity ${id} not found.`);
    opp.status = status;
    if (failureReason) opp.failureReason = failureReason;
    if (txHash) opp.bridgeTxHash = txHash;
    this.opportunities.set(id, opp);
  }

  public getAuditRecords(): CrossChainBridgeAuditRecord[] {
    return Array.from(this.auditRecords.values());
  }

  public getExistingRecord(opportunityId: string): CrossChainBridgeAuditRecord | undefined {
    return this.opportunityAuditMap.get(opportunityId);
  }

  public recordExecution(record: CrossChainBridgeAuditRecord): void {
    this.auditRecords.set(record.id, record);
    this.opportunityAuditMap.set(record.opportunityId, record);
  }
}
