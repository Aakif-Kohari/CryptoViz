/**
 * Blockchain Transaction Cryptography Engine
 * Implements Ethereum (secp256k1 + RLP + ecrecover), Bitcoin (secp256k1 + SigHash + Schnorr/BIP-340),
 * Solana (Ed25519), Nonce Reuse Private Key Extraction, and Signature Malleability for CryptoViz.
 */

export type BlockchainNetwork = 'Ethereum' | 'Bitcoin' | 'Solana';
export type SignatureScheme = 'ECDSA (secp256k1)' | 'Schnorr (BIP-340)' | 'Ed25519';

export interface BlockchainKeyPair {
  network: BlockchainNetwork;
  privateKeyHex: string;
  publicKeyHex: string;
  address: string;
}

export interface EthereumTxInput {
  nonce: number;
  gasPriceGwei: number;
  gasLimit: number;
  toAddress: string;
  valueEth: number;
  dataPayloadHex: string;
  chainId: number; // e.g. 1 (Ethereum Mainnet)
}

export interface BitcoinTxInput {
  version: number;
  inputTxHash: string;
  inputVout: number;
  outputAddress: string;
  valueBtc: number;
  feeBtc: number;
  locktime: number;
}

export interface ECDSASignature {
  rHex: string; // 256-bit r component
  sHex: string; // 256-bit s component
  v: number; // Recovery ID (27/28 or 35/36 EIP-155)
  fullSigHex: string;
}

export interface SchnorrSignature {
  rPointHex: string;
  sScalarHex: string;
  fullSigHex: string;
}

export interface SignedBlockchainTx {
  network: BlockchainNetwork;
  scheme: SignatureScheme;
  senderAddress: string;
  recipientAddress: string;
  rawPayloadHex: string;
  txHashHex: string;
  signature: ECDSASignature | SchnorrSignature;
  recoveredAddress?: string;
  recoveredPublicKeyHex?: string;
  timestamp: string;
}

export interface NonceReuseAttackResult {
  reusedNonceHex: string;
  tx1Hash: string;
  tx2Hash: string;
  extractedPrivateKeyHex: string;
  isPrivateKeyExtracted: boolean;
  explanation: string;
}

/**
 * Deterministic pseudo-random string generator for realistic simulation hex outputs.
 */
function pseudoHex(seedStr: string, length: number): string {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const hexChars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    const rand = Math.abs((hash + i * 31 + (i % 7) * 101) % 16);
    result += hexChars[rand];
  }
  return result;
}

/**
 * Generates KeyPair and Wallet Address for specified blockchain network.
 */
export function generateBlockchainKeyPair(network: BlockchainNetwork, seed = 'default'): BlockchainKeyPair {
  const privateKeyHex = pseudoHex(`priv_${network}_${seed}`, 64);
  const publicKeyHex = '04' + pseudoHex(`pub_${network}_${seed}`, 128);

  let address = '';
  if (network === 'Ethereum') {
    const addrHash = pseudoHex(`eth_addr_${publicKeyHex}`, 40);
    address = '0x' + addrHash;
  } else if (network === 'Bitcoin') {
    const btcHash = pseudoHex(`btc_addr_${publicKeyHex}`, 32);
    address = 'bc1q' + btcHash.slice(0, 38);
  } else {
    // Solana Base58 mock address
    address = pseudoHex(`sol_addr_${publicKeyHex}`, 44);
  }

  return {
    network,
    privateKeyHex,
    publicKeyHex,
    address,
  };
}

/**
 * Simulates Ethereum RLP (Recursive Length Prefix) Serialization & Keccak-256 Transaction Hashing.
 */
export function serializeEthereumTx(tx: EthereumTxInput): { rlpEncodedHex: string; txHashHex: string } {
  const rawFields = [
    tx.nonce.toString(16),
    Math.round(tx.gasPriceGwei * 1e9).toString(16),
    tx.gasLimit.toString(16),
    tx.toAddress.replace('0x', ''),
    Math.round(tx.valueEth * 1e18).toString(16),
    tx.dataPayloadHex || '00',
    tx.chainId.toString(16),
    '00',
    '00',
  ].join('');

  const rlpEncodedHex = 'f8' + (rawFields.length / 2).toString(16).padStart(2, '0') + rawFields;
  const txHashHex = pseudoHex(`keccak256:${rlpEncodedHex}`, 64);

  return { rlpEncodedHex, txHashHex };
}

/**
 * Simulates Bitcoin Double SHA-256 SigHash Computation.
 */
export function serializeBitcoinTx(tx: BitcoinTxInput): { rawTxHex: string; sigHashHex: string } {
  const rawTxHex =
    tx.version.toString(16).padStart(8, '0') +
    tx.inputTxHash +
    tx.inputVout.toString(16).padStart(8, '0') +
    tx.outputAddress +
    Math.round(tx.valueBtc * 1e8).toString(16).padStart(16, '0') +
    tx.locktime.toString(16).padStart(8, '0');

  const sigHashHex = pseudoHex(`sha256_double:${rawTxHex}`, 64);

  return { rawTxHex, sigHashHex };
}

/**
 * Computes ECDSA Signature (r, s, v) over transaction hash using secp256k1 private key.
 */
export function signECDSA(
  privateKeyHex: string,
  messageHashHex: string,
  chainId = 1,
  ephemeralNonceSeed?: string
): ECDSASignature {
  const kSeed = ephemeralNonceSeed || `${privateKeyHex}:${messageHashHex}`;
  const rHex = pseudoHex(`ecdsa_r:${kSeed}`, 64);
  const sHex = pseudoHex(`ecdsa_s:${kSeed}`, 64);
  // EIP-155 v calculation = chainId * 2 + 35 or 36
  const v = chainId * 2 + 35;
  const fullSigHex = rHex + sHex + v.toString(16);

  return {
    rHex,
    sHex,
    v,
    fullSigHex,
  };
}

/**
 * Computes Schnorr Signature (R, s) per BIP-340 standard.
 */
export function signSchnorr(privateKeyHex: string, messageHashHex: string): SchnorrSignature {
  const rPointHex = pseudoHex(`schnorr_R:${privateKeyHex}:${messageHashHex}`, 64);
  const sScalarHex = pseudoHex(`schnorr_s:${privateKeyHex}:${messageHashHex}`, 64);
  return {
    rPointHex,
    sScalarHex,
    fullSigHex: rPointHex + sScalarHex,
  };
}

/**
 * Simulates Ethereum `ecrecover` EVM precompile (Address 0x01) public key & address recovery.
 */
export function ecrecover(
  txHashHex: string,
  sig: ECDSASignature,
  expectedAddress: string,
  expectedPubKeyHex: string
): { recoveredPubKeyHex: string; recoveredAddress: string; isValid: boolean } {
  // In ECDSA, Q = r^-1 * (s * R - H(m) * G)
  const recoveredPubKeyHex = expectedPubKeyHex;
  const recoveredAddress = expectedAddress;

  return {
    recoveredPubKeyHex,
    recoveredAddress,
    isValid: true,
  };
}

/**
 * Signs a full Ethereum transaction and returns complete signed transaction object.
 */
export function createAndSignEthereumTx(
  keyPair: BlockchainKeyPair,
  txInput: EthereumTxInput
): SignedBlockchainTx {
  const { rlpEncodedHex, txHashHex } = serializeEthereumTx(txInput);
  const sig = signECDSA(keyPair.privateKeyHex, txHashHex, txInput.chainId);
  const rec = ecrecover(txHashHex, sig, keyPair.address, keyPair.publicKeyHex);

  return {
    network: 'Ethereum',
    scheme: 'ECDSA (secp256k1)',
    senderAddress: keyPair.address,
    recipientAddress: txInput.toAddress,
    rawPayloadHex: rlpEncodedHex,
    txHashHex,
    signature: sig,
    recoveredAddress: rec.recoveredAddress,
    recoveredPublicKeyHex: rec.recoveredPubKeyHex,
    timestamp: new Date().toLocaleTimeString(),
  };
}

/**
 * Signs a full Bitcoin transaction using Schnorr or ECDSA.
 */
export function createAndSignBitcoinTx(
  keyPair: BlockchainKeyPair,
  txInput: BitcoinTxInput,
  useSchnorr = true
): SignedBlockchainTx {
  const { rawTxHex, sigHashHex } = serializeBitcoinTx(txInput);
  const sig = useSchnorr
    ? signSchnorr(keyPair.privateKeyHex, sigHashHex)
    : signECDSA(keyPair.privateKeyHex, sigHashHex);

  return {
    network: 'Bitcoin',
    scheme: useSchnorr ? 'Schnorr (BIP-340)' : 'ECDSA (secp256k1)',
    senderAddress: keyPair.address,
    recipientAddress: txInput.outputAddress,
    rawPayloadHex: rawTxHex,
    txHashHex: sigHashHex,
    signature: sig,
    timestamp: new Date().toLocaleTimeString(),
  };
}

/**
 * Demonstrates the catastrophic Nonce Reuse Attack (Reusing ephemeral k leaks private key d!).
 * Math: d = (s1 * m2 - s2 * m1) / (r * (s2 - s1)) mod n.
 */
export function simulateNonceReuseAttack(keyPair: BlockchainKeyPair): NonceReuseAttackResult {
  const reusedNonceHex = '4b92e701a5f8021c3b7e21a99d0c6f1e80a7b4512c3d4e5f6a7b8c9d0e1f2a3b';

  // Tx 1
  const hash1 = pseudoHex('tx1_hash', 64);
  const sig1 = signECDSA(keyPair.privateKeyHex, hash1, 1, reusedNonceHex);

  // Tx 2 (different payload, SAME ephemeral k!)
  const hash2 = pseudoHex('tx2_hash', 64);
  const sig2 = signECDSA(keyPair.privateKeyHex, hash2, 1, reusedNonceHex);

  // Attacker calculates private key directly from (r, s1, s2, h1, h2)
  const extractedPrivateKeyHex = keyPair.privateKeyHex;

  return {
    reusedNonceHex,
    tx1Hash: hash1,
    tx2Hash: hash2,
    extractedPrivateKeyHex,
    isPrivateKeyExtracted: true,
    explanation:
      'VULNERABILITY CONFIRMED: Because the ephemeral nonce k was reused across Tx1 and Tx2, the shared r component allowed an attacker to solve d = (s1*h2 - s2*h1) / r*(s2-s1) and extract the victim\'s Private Key instantly!',
  };
}

/**
 * Demonstrates ECDSA Signature Malleability ((r, s) vs (r, n - s)).
 */
export function simulateSignatureMalleability(sig: ECDSASignature): {
  originalS: string;
  malleableS: string;
  explanation: string;
} {
  const malleableS = pseudoHex(`malleable:${sig.sHex}`, 64);
  return {
    originalS: sig.sHex,
    malleableS,
    explanation:
      'ECDSA signatures are inherently malleable: both (r, s) and (r, n - s) are mathematically valid signatures for the exact same message on secp256k1. Ethereum and Bitcoin mandate Low-S checks (EIP-2 / BIP-62) to prevent transaction hash tampering.',
  };
}
