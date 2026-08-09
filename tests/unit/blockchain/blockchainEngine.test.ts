import { describe, it, expect } from 'vitest';
import {
  generateBlockchainKeyPair,
  serializeEthereumTx,
  serializeBitcoinTx,
  signECDSA,
  signSchnorr,
  ecrecover,
  createAndSignEthereumTx,
  createAndSignBitcoinTx,
  simulateNonceReuseAttack,
  simulateSignatureMalleability,
} from '@/lib/blockchain/blockchainEngine';

describe('Blockchain Transaction Cryptography Engine', () => {
  it('generates valid keypairs and wallet addresses across Ethereum, Bitcoin, and Solana', () => {
    const ethKeys = generateBlockchainKeyPair('Ethereum', 'seed1');
    expect(ethKeys.address).toMatch(/^0x/);
    expect(ethKeys.privateKeyHex).toHaveLength(64);

    const btcKeys = generateBlockchainKeyPair('Bitcoin', 'seed1');
    expect(btcKeys.address).toMatch(/^bc1q/);

    const solKeys = generateBlockchainKeyPair('Solana', 'seed1');
    expect(solKeys.address).toBeDefined();
  });

  it('serializes Ethereum RLP transaction and computes Keccak-256 hash', () => {
    const ethTx = {
      nonce: 5,
      gasPriceGwei: 25.5,
      gasLimit: 21000,
      toAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      valueEth: 1.5,
      dataPayloadHex: '00',
      chainId: 1,
    };

    const { rlpEncodedHex, txHashHex } = serializeEthereumTx(ethTx);
    expect(rlpEncodedHex).toContain('f8');
    expect(txHashHex).toHaveLength(64);
  });

  it('serializes Bitcoin transaction and computes Double SHA-256 SigHash', () => {
    const btcTx = {
      version: 2,
      inputTxHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
      inputVout: 0,
      outputAddress: 'bc1qtestaddress123456789',
      valueBtc: 0.25,
      feeBtc: 0.0001,
      locktime: 0,
    };

    const { rawTxHex, sigHashHex } = serializeBitcoinTx(btcTx);
    expect(rawTxHex).toBeDefined();
    expect(sigHashHex).toHaveLength(64);
  });

  it('signs transaction with secp256k1 ECDSA and recovers address via ecrecover', () => {
    const keys = generateBlockchainKeyPair('Ethereum', 'alice');
    const ethTx = {
      nonce: 1,
      gasPriceGwei: 20,
      gasLimit: 21000,
      toAddress: '0x1111111111111111111111111111111111111111',
      valueEth: 0.5,
      dataPayloadHex: '00',
      chainId: 1,
    };

    const signedTx = createAndSignEthereumTx(keys, ethTx);
    expect(signedTx.signature.fullSigHex).toBeDefined();

    const sig = signedTx.signature as any;
    const rec = ecrecover(signedTx.txHashHex, sig, keys.address, keys.publicKeyHex);
    expect(rec.recoveredAddress).toBe(keys.address);
    expect(rec.isValid).toBe(true);
  });

  it('signs transaction with Schnorr (BIP-340) for Bitcoin', () => {
    const keys = generateBlockchainKeyPair('Bitcoin', 'satoshi');
    const btcTx = {
      version: 2,
      inputTxHash: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      inputVout: 1,
      outputAddress: 'bc1qrecipient',
      valueBtc: 1.0,
      feeBtc: 0.0002,
      locktime: 0,
    };

    const signedTx = createAndSignBitcoinTx(keys, btcTx, true);
    expect(signedTx.scheme).toBe('Schnorr (BIP-340)');
    expect((signedTx.signature as any).rPointHex).toHaveLength(64);
  });

  it('simulates Nonce Reuse Attack and extracts private key', () => {
    const keys = generateBlockchainKeyPair('Ethereum', 'victim');
    const attackRes = simulateNonceReuseAttack(keys);

    expect(attackRes.isPrivateKeyExtracted).toBe(true);
    expect(attackRes.extractedPrivateKeyHex).toBe(keys.privateKeyHex);
    expect(attackRes.explanation).toContain('VULNERABILITY CONFIRMED');
  });

  it('simulates Signature Malleability ((r, s) vs (r, n - s))', () => {
    const sig = signECDSA('1234', 'hash1234');
    const mallRes = simulateSignatureMalleability(sig);

    expect(mallRes.malleableS).not.toBe(sig.sHex);
    expect(mallRes.explanation).toContain('Low-S checks');
  });
});
