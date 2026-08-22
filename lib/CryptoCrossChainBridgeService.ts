import {
  CrossChainBridgeOpportunity,
  CrossChainBridgeAuditRecord,
  BridgeFilterOptions,
  CrossChainBridgeDomainState,
} from './CryptoCrossChainBridgeModel';

const INITIAL_BRIDGE_OPPORTUNITIES: CrossChainBridgeOpportunity[] = [
  {
    id: 'bridge-101',
    sourceChain: 'Ethereum',
    targetChain: 'Arbitrum',
    assetSymbol: 'USDC',
    transferAmountUsd: 250000,
    protocol: 'Stargate',
    routes: [
      { step: 1, bridgeName: 'Stargate', sourceChain: 'Ethereum', targetChain: 'Arbitrum', estimatedTimeSeconds: 90, bridgeFeePercent: 0.06, relayerFeeUsd: 12 },
    ],
    estimatedTotalFeeUsd: 162,
    estimatedNetReceivedUsd: 249838,
    estimatedCompletionMinutes: 1.5,
    availableBridgeLiquidityUsd: 8500000,
    executionRisk: 'low',
    status: 'ACTIVE_MONITORING',
    detectedTimestamp: '10s ago',
    maxAllowedSlippagePercent: 0.5,
    maxAllowedGasFeeUsd: 300,
  },
  {
    id: 'bridge-102',
    sourceChain: 'Optimism',
    targetChain: 'Polygon',
    assetSymbol: 'WETH',
    transferAmountUsd: 120000,
    protocol: 'Across',
    routes: [
      { step: 1, bridgeName: 'Across', sourceChain: 'Optimism', targetChain: 'Polygon', estimatedTimeSeconds: 120, bridgeFeePercent: 0.04, relayerFeeUsd: 8 },
    ],
    estimatedTotalFeeUsd: 56,
    estimatedNetReceivedUsd: 119944,
    estimatedCompletionMinutes: 2,
    availableBridgeLiquidityUsd: 3200000,
    executionRisk: 'low',
    status: 'ACTIVE_MONITORING',
    detectedTimestamp: '45s ago',
    maxAllowedSlippagePercent: 0.3,
    maxAllowedGasFeeUsd: 150,
  },
  {
    id: 'bridge-103',
    sourceChain: 'Avalanche',
    targetChain: 'Ethereum',
    assetSymbol: 'USDT',
    transferAmountUsd: 500000,
    protocol: 'Hop Protocol',
    routes: [
      { step: 1, bridgeName: 'Hop Protocol', sourceChain: 'Avalanche', targetChain: 'Ethereum', estimatedTimeSeconds: 300, bridgeFeePercent: 0.12, relayerFeeUsd: 45 },
    ],
    estimatedTotalFeeUsd: 645,
    estimatedNetReceivedUsd: 499355,
    estimatedCompletionMinutes: 5,
    availableBridgeLiquidityUsd: 150000, // Low liquidity will trigger simulation failure
    executionRisk: 'high',
    status: 'ACTIVE_MONITORING',
    detectedTimestamp: '2m ago',
    maxAllowedSlippagePercent: 0.8,
    maxAllowedGasFeeUsd: 500,
  },
];

const INITIAL_BRIDGE_AUDIT_RECORDS: CrossChainBridgeAuditRecord[] = [
  {
    id: 'AUD-BRIDGE-9901',
    opportunityId: 'bridge-101',
    sourceChain: 'Ethereum',
    targetChain: 'Arbitrum',
    assetSymbol: 'USDC',
    transferAmountUsd: 250000,
    netReceivedUsd: 249838,
    totalFeePaidUsd: 162,
    executionTxHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    executedTimestamp: 'Aug 20, 2026',
    status: 'BRIDGE_EXECUTED',
  },
];

export class CrossChainBridgeEngine {
  public static evaluate(
    opp: CrossChainBridgeOpportunity,
    params?: { transferAmountUsd?: number; maxAllowedSlippagePercent?: number; maxAllowedGasFeeUsd?: number }
  ): { success: boolean; failureReason?: string; netReceivedUsd: number; totalFeeUsd: number } {
    const amount = params?.transferAmountUsd ?? opp.transferAmountUsd;
    const maxSlippage = params?.maxAllowedSlippagePercent ?? opp.maxAllowedSlippagePercent;
    const maxGas = params?.maxAllowedGasFeeUsd ?? opp.maxAllowedGasFeeUsd;

    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(maxSlippage) || !Number.isFinite(maxGas)) {
      return { success: false, failureReason: 'INVALID_BRIDGE_PARAMS', netReceivedUsd: 0, totalFeeUsd: 0 };
    }

    if (opp.availableBridgeLiquidityUsd < amount) {
      return { success: false, failureReason: 'INSUFFICIENT_BRIDGE_LIQUIDITY', netReceivedUsd: 0, totalFeeUsd: opp.estimatedTotalFeeUsd };
    }

    if (opp.estimatedTotalFeeUsd > maxGas) {
      return { success: false, failureReason: 'BRIDGE_GAS_EXCEEDED', netReceivedUsd: 0, totalFeeUsd: opp.estimatedTotalFeeUsd };
    }

    const netReceived = amount - opp.estimatedTotalFeeUsd;
    return { success: true, netReceivedUsd: Number(netReceived.toFixed(2)), totalFeeUsd: opp.estimatedTotalFeeUsd };
  }
}

export class CrossChainBridgeServiceHandler {
  private static domainState: CrossChainBridgeDomainState = new CrossChainBridgeDomainState(
    INITIAL_BRIDGE_OPPORTUNITIES,
    INITIAL_BRIDGE_AUDIT_RECORDS
  );

  public static getDomainState(): CrossChainBridgeDomainState {
    return this.domainState;
  }

  public static fetchOpportunities(filters?: Partial<BridgeFilterOptions>): CrossChainBridgeOpportunity[] {
    return this.domainState.getOpportunities(filters);
  }

  public static fetchAuditRecords(): CrossChainBridgeAuditRecord[] {
    return this.domainState.getAuditRecords();
  }

  public static registerOpportunity(
    payload: Omit<CrossChainBridgeOpportunity, 'id' | 'status' | 'detectedTimestamp'>
  ): CrossChainBridgeOpportunity {
    return this.domainState.registerOpportunity(payload);
  }

  public static executeBridgeSimulation(
    opportunityId: string,
    customParams?: { transferAmountUsd?: number; maxAllowedSlippagePercent?: number; maxAllowedGasFeeUsd?: number }
  ): CrossChainBridgeAuditRecord {
    const existing = this.domainState.getExistingRecord(opportunityId);
    if (existing) return existing;

    const opp = this.domainState.getOpportunityById(opportunityId);
    if (!opp) throw new Error(`Bridge opportunity ${opportunityId} not found.`);

    this.domainState.updateStatus(opportunityId, 'ROUTING_SIMULATION');
    const result = CrossChainBridgeEngine.evaluate(opp, customParams);

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const record: CrossChainBridgeAuditRecord = {
      id: `AUD-BRIDGE-${crypto.randomUUID()}`,
      opportunityId,
      sourceChain: opp.sourceChain,
      targetChain: opp.targetChain,
      assetSymbol: opp.assetSymbol,
      transferAmountUsd: customParams?.transferAmountUsd ?? opp.transferAmountUsd,
      netReceivedUsd: result.netReceivedUsd,
      totalFeePaidUsd: result.totalFeeUsd,
      executionTxHash: txHash,
      executedTimestamp: 'Just now',
      status: result.success ? 'BRIDGE_EXECUTED' : 'BRIDGE_REVERTED',
      failureReason: result.failureReason,
    };

    this.domainState.updateStatus(opportunityId, result.success ? 'BRIDGE_EXECUTED' : 'BRIDGE_REVERTED', result.failureReason, txHash);
    this.domainState.recordExecution(record);
    return record;
  }
}
