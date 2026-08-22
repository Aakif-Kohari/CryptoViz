import {
  RealWorldAssetTokenizationOpportunity,
  RwaExecutionAuditRecord,
  RwaFilterOptions,
  RealWorldAssetDomainState,
} from './CryptoRwaTokenizationModel';

const INITIAL_RWA_OPPORTUNITIES: RealWorldAssetTokenizationOpportunity[] = [
  {
    id: 'rwa-101',
    assetName: 'US Short-Term Treasury Bill Vault',
    assetCategory: 'US Treasury Bills',
    tokenSymbol: 'bIB01',
    issuingProtocol: 'Ondo Finance',
    totalVaultTvUsd: 145000000,
    tokenPriceUsd: 102.45,
    annualizedYieldPercent: 5.15,
    proofOfReserve: {
      attestationId: 'ATT-ONDO-20260815',
      auditorName: 'Grant Thornton LLP',
      verifiedReserveBalanceUsd: 145200000,
      onChainSupplyTokens: 1417276,
      reserveRatioPercentage: 100.14,
      lastAuditTimestamp: '2 days ago',
    },
    minimumInvestmentUsd: 5000,
    liquidityPoolUsd: 12000000,
    riskRating: 'AAA',
    status: 'MONITORING',
    detectedTimestamp: '10m ago',
  },
  {
    id: 'rwa-102',
    assetName: 'Institutional Senior Private Credit Fund',
    assetCategory: 'Private Credit',
    tokenSymbol: 'CF-USDC',
    issuingProtocol: 'Centrifuge',
    totalVaultTvUsd: 82000000,
    tokenPriceUsd: 1.08,
    annualizedYieldPercent: 9.40,
    proofOfReserve: {
      attestationId: 'ATT-CF-20260818',
      auditorName: 'Deloitte',
      verifiedReserveBalanceUsd: 82500000,
      onChainSupplyTokens: 76388888,
      reserveRatioPercentage: 100.61,
      lastAuditTimestamp: 'Yesterday',
    },
    minimumInvestmentUsd: 10000,
    liquidityPoolUsd: 4500000,
    riskRating: 'A',
    status: 'MONITORING',
    detectedTimestamp: '25m ago',
  },
  {
    id: 'rwa-103',
    assetName: 'London Prime Commercial Real Estate Trust',
    assetCategory: 'Commercial Real Estate',
    tokenSymbol: 'PROP-LDN',
    issuingProtocol: 'RealT',
    totalVaultTvUsd: 35000000,
    tokenPriceUsd: 50.00,
    annualizedYieldPercent: 7.80,
    proofOfReserve: {
      attestationId: 'ATT-REALT-20260810',
      auditorName: 'PwC',
      verifiedReserveBalanceUsd: 1200000, // Trigger low reserve ratio failure
      onChainSupplyTokens: 700000,
      reserveRatioPercentage: 3.42,
      lastAuditTimestamp: '10 days ago',
    },
    minimumInvestmentUsd: 1000,
    liquidityPoolUsd: 800000,
    riskRating: 'BBB',
    status: 'MONITORING',
    detectedTimestamp: '1h ago',
  },
];

const INITIAL_RWA_AUDIT_RECORDS: RwaExecutionAuditRecord[] = [
  {
    id: 'AUD-RWA-5501',
    opportunityId: 'rwa-101',
    assetName: 'US Short-Term Treasury Bill Vault',
    tokenSymbol: 'bIB01',
    investmentAmountUsd: 50000,
    tokensIssued: 488.04,
    yieldGeneratedUsd: 2575,
    executionTxHash: '0x99887766554433221100aabbccddeeff99887766554433221100aabbccddeeff',
    executedTimestamp: 'Aug 19, 2026',
    status: 'TOKENIZED_VERIFIED',
  },
];

export class RwaSimulationEngine {
  public static evaluate(
    opp: RealWorldAssetTokenizationOpportunity,
    params?: { investmentAmountUsd?: number }
  ): { success: boolean; failureReason?: string; tokensIssued: number; estimatedYieldUsd: number } {
    const amount = params?.investmentAmountUsd ?? opp.minimumInvestmentUsd;

    if (!Number.isFinite(amount) || amount < opp.minimumInvestmentUsd) {
      return { success: false, failureReason: 'BELOW_MINIMUM_INVESTMENT_THRESHOLD', tokensIssued: 0, estimatedYieldUsd: 0 };
    }

    if (opp.proofOfReserve.reserveRatioPercentage < 98.0) {
      return { success: false, failureReason: 'PROOF_OF_RESERVES_ATTESTATION_FAILED', tokensIssued: 0, estimatedYieldUsd: 0 };
    }

    const tokensIssued = Number((amount / opp.tokenPriceUsd).toFixed(4));
    const estimatedYieldUsd = Number(((amount * opp.annualizedYieldPercent) / 100).toFixed(2));

    return { success: true, tokensIssued, estimatedYieldUsd };
  }
}

export class RealWorldAssetServiceHandler {
  private static domainState: RealWorldAssetDomainState = new RealWorldAssetDomainState(
    INITIAL_RWA_OPPORTUNITIES,
    INITIAL_RWA_AUDIT_RECORDS
  );

  public static getDomainState(): RealWorldAssetDomainState {
    return this.domainState;
  }

  public static fetchOpportunities(filters?: Partial<RwaFilterOptions>): RealWorldAssetTokenizationOpportunity[] {
    return this.domainState.getOpportunities(filters);
  }

  public static fetchAuditRecords(): RwaExecutionAuditRecord[] {
    return this.domainState.getAuditRecords();
  }

  public static registerOpportunity(
    payload: Omit<RealWorldAssetTokenizationOpportunity, 'id' | 'status' | 'detectedTimestamp'>
  ): RealWorldAssetTokenizationOpportunity {
    return this.domainState.registerOpportunity(payload);
  }

  public static executeTokenizationSimulation(
    opportunityId: string,
    customParams?: { investmentAmountUsd?: number }
  ): RwaExecutionAuditRecord {
    const existing = this.domainState.getExistingRecord(opportunityId);
    if (existing) return existing;

    const opp = this.domainState.getOpportunityById(opportunityId);
    if (!opp) throw new Error(`RWA Vault ${opportunityId} not found.`);

    this.domainState.updateStatus(opportunityId, 'SIMULATING_REBALANCE');
    const result = RwaSimulationEngine.evaluate(opp, customParams);

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const record: RwaExecutionAuditRecord = {
      id: `AUD-RWA-${crypto.randomUUID()}`,
      opportunityId,
      assetName: opp.assetName,
      tokenSymbol: opp.tokenSymbol,
      investmentAmountUsd: customParams?.investmentAmountUsd ?? opp.minimumInvestmentUsd,
      tokensIssued: result.tokensIssued,
      yieldGeneratedUsd: result.estimatedYieldUsd,
      executionTxHash: txHash,
      executedTimestamp: 'Just now',
      status: result.success ? 'TOKENIZED_VERIFIED' : 'COMPLIANCE_REVERT',
      failureReason: result.failureReason,
    };

    this.domainState.updateStatus(opportunityId, result.success ? 'TOKENIZED_VERIFIED' : 'COMPLIANCE_REVERT', result.failureReason);
    this.domainState.recordExecution(record);
    return record;
  }
}
