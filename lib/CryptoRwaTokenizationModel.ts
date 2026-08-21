/**
 * Real-World Asset (RWA) Tokenization & Treasury Analytics Domain Model.
 * Provides data contracts for asset tokenization, yields, proof of reserves, and audit logs.
 */

export type RwaAssetCategory = 'US Treasury Bills' | 'Private Credit' | 'Commercial Real Estate' | 'Precious Metals';
export type RwaStatus = 'MONITORING' | 'SIMULATING_REBALANCE' | 'TOKENIZED_VERIFIED' | 'COMPLIANCE_REVERT';

export interface ProofOfReserveAudit {
  attestationId: string;
  auditorName: string;
  verifiedReserveBalanceUsd: number;
  onChainSupplyTokens: number;
  reserveRatioPercentage: number;
  lastAuditTimestamp: string;
}

export interface RealWorldAssetTokenizationOpportunity {
  id: string;
  assetName: string;
  assetCategory: RwaAssetCategory;
  tokenSymbol: string;
  issuingProtocol: string;
  totalVaultTvUsd: number;
  tokenPriceUsd: number;
  annualizedYieldPercent: number;
  proofOfReserve: ProofOfReserveAudit;
  minimumInvestmentUsd: number;
  liquidityPoolUsd: number;
  riskRating: 'AAA' | 'AA' | 'A' | 'BBB';
  status: RwaStatus;
  detectedTimestamp: string;
}

export interface RwaExecutionAuditRecord {
  id: string;
  opportunityId: string;
  assetName: string;
  tokenSymbol: string;
  investmentAmountUsd: number;
  tokensIssued: number;
  yieldGeneratedUsd: number;
  executionTxHash: string;
  executedTimestamp: string;
  status: 'TOKENIZED_VERIFIED' | 'COMPLIANCE_REVERT';
  failureReason?: string;
}

export interface RwaFilterOptions {
  assetCategory: string;
  issuingProtocol: string;
  riskRating: string;
  searchQuery: string;
}

export class RealWorldAssetDomainState {
  private opportunities: Map<string, RealWorldAssetTokenizationOpportunity>;
  private auditRecords: Map<string, RwaExecutionAuditRecord>;
  private opportunityAuditMap: Map<string, RwaExecutionAuditRecord>;

  constructor(
    initialOpps: RealWorldAssetTokenizationOpportunity[] = [],
    initialRecords: RwaExecutionAuditRecord[] = []
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

  public getOpportunities(filters?: Partial<RwaFilterOptions>): RealWorldAssetTokenizationOpportunity[] {
    let result = Array.from(this.opportunities.values());
    if (!filters) return result;

    if (filters.assetCategory && filters.assetCategory !== 'All') {
      result = result.filter((o) => o.assetCategory === filters.assetCategory);
    }
    if (filters.issuingProtocol && filters.issuingProtocol !== 'All') {
      result = result.filter((o) => o.issuingProtocol === filters.issuingProtocol);
    }
    if (filters.riskRating && filters.riskRating !== 'All') {
      result = result.filter((o) => o.riskRating === filters.riskRating);
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.assetName.toLowerCase().includes(q) ||
          o.tokenSymbol.toLowerCase().includes(q) ||
          o.issuingProtocol.toLowerCase().includes(q)
      );
    }
    return result;
  }

  public getOpportunityById(id: string): RealWorldAssetTokenizationOpportunity | undefined {
    const opp = this.opportunities.get(id);
    return opp ? { ...opp } : undefined;
  }

  public registerOpportunity(
    opp: Omit<RealWorldAssetTokenizationOpportunity, 'id' | 'status' | 'detectedTimestamp'>
  ): RealWorldAssetTokenizationOpportunity {
    const id = `rwa-vault-${crypto.randomUUID()}`;
    const newOpp: RealWorldAssetTokenizationOpportunity = {
      ...opp,
      id,
      status: 'MONITORING',
      detectedTimestamp: 'Just now',
    };
    this.opportunities.set(id, newOpp);
    return { ...newOpp };
  }

  public updateStatus(id: string, status: RwaStatus, failureReason?: string): void {
    const opp = this.opportunities.get(id);
    if (!opp) throw new Error(`RWA Opportunity ${id} not found.`);
    opp.status = status;
    this.opportunities.set(id, opp);
  }

  public getAuditRecords(): RwaExecutionAuditRecord[] {
    return Array.from(this.auditRecords.values());
  }

  public getExistingRecord(opportunityId: string): RwaExecutionAuditRecord | undefined {
    return this.opportunityAuditMap.get(opportunityId);
  }

  public recordExecution(record: RwaExecutionAuditRecord): void {
    this.auditRecords.set(record.id, record);
    this.opportunityAuditMap.set(record.opportunityId, record);
  }
}
