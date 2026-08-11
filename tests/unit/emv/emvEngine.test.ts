import { describe, it, expect } from 'vitest';
import {
  computeKeyHierarchy,
  deriveUniqueCardKey,
  deriveSessionKey,
  amountToBCDHex,
  generateApplicationCryptogram,
  generateARPC,
  executeEMVTransaction,
  runEMVFraudSimulation,
  EMVCardData,
  EMVTerminalData,
} from '@/lib/emv/emvEngine';

describe('EMV Payment Cryptography Engine', () => {
  const defaultCard: EMVCardData = {
    pan: '4532015899123456',
    psn: '01',
    cardholderName: 'ALEX SMITH',
    expiryDate: '2812',
    issuerMasterKeyHex: '0123456789ABCDEF0123456789ABCDEF',
    cardAuthenticationMethod: 'DDA',
  };

  const defaultTerminal: EMVTerminalData = {
    terminalId: 'POS-TERM-8841',
    merchantName: 'Metro Coffee Shop',
    amount: 49.99,
    currencyCode: '0840',
    countryCode: '0840',
    unpredictableNumberHex: '8A9B0C1D',
    transactionDate: '260807',
  };

  it('converts transaction amounts to 12-digit BCD hex correctly', () => {
    expect(amountToBCDHex(49.99)).toBe('000000004999');
    expect(amountToBCDHex(100.0)).toBe('000000010000');
    expect(amountToBCDHex(0.5)).toBe('000000000050');
  });

  it('derives UDK_AC and SK_AC key hierarchy accurately', () => {
    const { udkHex, divData } = deriveUniqueCardKey(defaultCard.issuerMasterKeyHex, defaultCard.pan, defaultCard.psn);
    expect(udkHex).toHaveLength(32);
    expect(divData).toContain('01');

    const { skHex, atcData } = deriveSessionKey(udkHex, 142);
    expect(skHex).toHaveLength(32);
    expect(atcData).toBe('008E');

    const fullHierarchy = computeKeyHierarchy(defaultCard.issuerMasterKeyHex, defaultCard.pan, defaultCard.psn, 142);
    expect(fullHierarchy.sessionKeyHex).toBe(skHex);
  });

  it('generates ARQC, ARPC, and Settlement TC cryptograms', () => {
    const keys = computeKeyHierarchy(defaultCard.issuerMasterKeyHex, defaultCard.pan, defaultCard.psn, 101);

    const txData = {
      atc: 101,
      amountHex: amountToBCDHex(49.99),
      currencyHex: '0840',
      countryHex: '0840',
      unpredictableNumberHex: '11223344',
      cvrHex: '03A00000',
    };

    const arqc = generateApplicationCryptogram(keys.sessionKeyHex, 'ARQC', txData);
    expect(arqc.type).toBe('ARQC');
    expect(arqc.cryptogramHex).toHaveLength(16);

    const arpc = generateARPC(keys.sessionKeyHex, arqc.cryptogramHex, '00');
    expect(arpc.arpcHex).toHaveLength(16);
    expect(arpc.responseCode).toBe('00');
  });

  it('executes complete 7-step EMV payment transaction workflow', () => {
    const summary = executeEMVTransaction(defaultCard, defaultTerminal, 142);

    expect(summary.isApproved).toBe(true);
    expect(summary.steps).toHaveLength(7);
    expect(summary.arqc.cryptogramHex).toBeDefined();
    expect(summary.arpc.arpcHex).toBeDefined();
    expect(summary.tc?.cryptogramHex).toBeDefined();
  });

  it('simulates payment fraud detection in Issuer HSM', () => {
    const summary = executeEMVTransaction(defaultCard, defaultTerminal, 142);

    // Replay Attack
    const replayRes = runEMVFraudSimulation(summary, 'REPLAY_ATTACK');
    expect(replayRes.arqcVerified).toBe(false);
    expect(replayRes.transactionStatus).toBe('DECLINED_BY_ISSUER_HSM');
    expect(replayRes.hsmStatusMessage).toContain('Duplicate ATC');

    // Amount Fraud
    const amountRes = runEMVFraudSimulation(summary, 'AMOUNT_FRAUD');
    expect(amountRes.arqcVerified).toBe(false);
    expect(amountRes.hsmStatusMessage).toContain('Amount altered');

    // Forged Chip Key
    const forgedRes = runEMVFraudSimulation(summary, 'FORGED_CHIP_KEY');
    expect(forgedRes.arqcVerified).toBe(false);
    expect(forgedRes.hsmStatusMessage).toContain('Invalid Card Master Key');
  });
});
