/**
 * OpenPGP Sign -> Compress -> Encrypt Pipeline Engine
 * RFC 4880 / RFC 9580 compliant simulation logic for CryptoViz
 */

export type HashAlgorithm = 'SHA-256' | 'SHA-512';
export type CompressionAlgorithm = 'ZIP' | 'ZLIB' | 'DEFLATE' | 'Uncompressed';
export type CipherAlgorithm = 'AES-256' | 'AES-128' | 'ChaCha20';
export type KeyType = 'RSA-2048' | 'Ed25519 / X25519';

export interface OpenPGPConfig {
  plaintext: string;
  signerName: string;
  signerKeyId: string;
  signerKeyType: KeyType;
  recipientName: string;
  recipientKeyId: string;
  recipientKeyType: KeyType;
  hashAlgo: HashAlgorithm;
  compressionAlgo: CompressionAlgorithm;
  cipherAlgo: CipherAlgorithm;
}

export interface PacketTreeNode {
  id: string;
  tag: number;
  name: string;
  length: number;
  description: string;
  fields: { label: string; value: string; hex?: string }[];
  children?: PacketTreeNode[];
}

export interface Stage1Input {
  plaintext: string;
  plaintextBytes: number;
  entropy: number;
  signerKeyId: string;
  recipientKeyId: string;
}

export interface Stage2Sign {
  hashAlgo: HashAlgorithm;
  hashDigestHex: string;
  signatureHex: string;
  onePassPacketHex: string;
  signaturePacketHex: string;
  literalPacketHex: string;
  signedBundleSize: number;
  signedBundleHex: string;
}

export interface Stage3Compress {
  algo: CompressionAlgorithm;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // percentage reduction e.g. 35.5%
  originalEntropy: number;
  compressedEntropy: number;
  compressedPacketHex: string;
}

export interface Stage4Encrypt {
  cipherAlgo: CipherAlgorithm;
  sessionKeyHex: string;
  pkeskHex: string; // Public Key Encrypted Session Key packet
  seipdHex: string; // Symmetrically Encrypted Integrity Protected Data packet
  ciphertextHex: string;
  ciphertextEntropy: number;
  totalBinarySize: number;
  fullPacketTree: PacketTreeNode;
}

export interface Stage5Armor {
  armoredText: string;
  versionHeader: string;
  checksumHex: string;
}

export interface Stage6Decrypt {
  decryptedSessionKeyHex: string;
  isSessionKeyDecrypted: boolean;
  isIntegrityVerified: boolean; // MDC / AEAD authentication
  isDecompressed: boolean;
  isSignatureVerified: boolean;
  recoveredPlaintext: string;
  tamperMessage?: string;
}

export interface OpenPGPPipelineResult {
  config: OpenPGPConfig;
  stage1: Stage1Input;
  stage2: Stage2Sign;
  stage3: Stage3Compress;
  stage4: Stage4Encrypt;
  stage5: Stage5Armor;
  stage6: Stage6Decrypt;
  executionTimestamp: string;
}

/**
 * Calculates Shannon Entropy H = -sum(p_i * log2(p_i)) for data string or bytes.
 * Returns value between 0.0 and 8.0 bits per byte.
 */
export function calculateShannonEntropy(input: string | Uint8Array): number {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  if (bytes.length === 0) return 0;

  const frequencies = new Map<number, number>();
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    frequencies.set(byte, (frequencies.get(byte) || 0) + 1);
  }

  let entropy = 0;
  const len = bytes.length;
  for (const count of frequencies.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return Number(entropy.toFixed(3));
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
 * Simulates Deflate / ZIP compression on text payload.
 */
function simulateCompression(text: string, algo: CompressionAlgorithm): {
  compressedSize: number;
  compressedEntropy: number;
  ratio: number;
  compressedHex: string;
} {
  const rawBytes = new TextEncoder().encode(text);
  const rawSize = rawBytes.length;

  if (algo === 'Uncompressed' || rawSize === 0) {
    return {
      compressedSize: rawSize,
      compressedEntropy: calculateShannonEntropy(text),
      ratio: 0,
      compressedHex: Array.from(rawBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
    };
  }

  // Calculate compression factor based on repetition/entropy
  const entropy = calculateShannonEntropy(text);
  // Lower entropy text compresses better
  const compressionFactor = Math.max(0.25, Math.min(0.85, (entropy / 8.0) * 0.9));
  const compressedSize = Math.max(8, Math.round(rawSize * compressionFactor));
  const ratio = Math.round(((rawSize - compressedSize) / Math.max(1, rawSize)) * 1000) / 10;

  // Generate higher entropy simulated bytes
  const compHex = pseudoHex(text + algo, compressedSize * 2);
  const compEntropy = Math.min(7.8, Number((entropy + (8.0 - entropy) * 0.45).toFixed(3)));

  return {
    compressedSize,
    compressedEntropy: compEntropy,
    ratio: Math.max(0, ratio),
    compressedHex: compHex,
  };
}

/**
 * Calculates simple CRC-24 checksum for OpenPGP Armor footers (RFC 4880 §6.1).
 */
export function calculateCRC24(dataHex: string): string {
  let crc = 0xb704ce;
  const bytes = dataHex.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || [];
  for (const byte of bytes) {
    crc ^= byte << 16;
    for (let i = 0; i < 8; i++) {
      crc <<= 1;
      if (crc & 0x1000000) {
        crc ^= 0x1864cfb;
      }
    }
  }
  crc &= 0xffffff;

  // Base64 encode 3-byte CRC
  const b1 = (crc >> 16) & 0xff;
  const b2 = (crc >> 8) & 0xff;
  const b3 = crc & 0xff;
  return btoa(String.fromCharCode(b1, b2, b3));
}

/**
 * Constructs the step-by-step OpenPGP Sign -> Compress -> Encrypt pipeline.
 */
export function runOpenPGPPipeline(config: OpenPGPConfig): OpenPGPPipelineResult {
  const textEncoder = new TextEncoder();
  const rawBytes = textEncoder.encode(config.plaintext);
  const plaintextLength = rawBytes.length;
  const initialEntropy = calculateShannonEntropy(config.plaintext);

  // STAGE 1: Input & Key Setup
  const stage1: Stage1Input = {
    plaintext: config.plaintext,
    plaintextBytes: plaintextLength,
    entropy: initialEntropy,
    signerKeyId: config.signerKeyId,
    recipientKeyId: config.recipientKeyId,
  };

  // STAGE 2: SIGN
  const hashDigest = pseudoHex(`hash:${config.hashAlgo}:${config.plaintext}`, config.hashAlgo === 'SHA-512' ? 128 : 64);
  const signatureHex = pseudoHex(`sig:${config.signerKeyId}:${hashDigest}`, 256);
  
  // OpenPGP One-Pass Signature Packet (Tag 4)
  const onePassHex = `04` + `03` + (config.hashAlgo === 'SHA-512' ? '0a' : '08') + `01` + config.signerKeyId.toLowerCase() + `01`;
  // OpenPGP Signature Packet (Tag 2)
  const sigPacketHex = `02` + `001a` + `0400` + (config.hashAlgo === 'SHA-512' ? '0a' : '08') + `01` + config.signerKeyId.toLowerCase() + signatureHex.slice(0, 64);
  // OpenPGP Literal Data Packet (Tag 11)
  const textHex = Array.from(rawBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const literalPacketHex = `0b` + textHex.length.toString(16).padStart(4, '0') + `74` + `0b6d6573736167652e747874` + `00000000` + textHex;

  const signedBundleHex = onePassHex + literalPacketHex + sigPacketHex;
  const signedBundleSize = signedBundleHex.length / 2;

  const stage2: Stage2Sign = {
    hashAlgo: config.hashAlgo,
    hashDigestHex: hashDigest,
    signatureHex: signatureHex,
    onePassPacketHex: onePassHex,
    signaturePacketHex: sigPacketHex,
    literalPacketHex: literalPacketHex,
    signedBundleSize,
    signedBundleHex,
  };

  // STAGE 3: COMPRESS
  const compRes = simulateCompression(config.plaintext, config.compressionAlgo);
  const compPacketHeader = config.compressionAlgo === 'ZIP' ? '0801' : config.compressionAlgo === 'ZLIB' ? '0802' : config.compressionAlgo === 'DEFLATE' ? '0803' : '0800';
  const compressedPacketHex = compPacketHeader + compRes.compressedHex;

  const stage3: Stage3Compress = {
    algo: config.compressionAlgo,
    originalSize: signedBundleSize,
    compressedSize: Math.max(16, compRes.compressedSize + 12),
    compressionRatio: compRes.ratio,
    originalEntropy: initialEntropy,
    compressedEntropy: compRes.compressedEntropy,
    compressedPacketHex,
  };

  // STAGE 4: ENCRYPT
  const sessionKeyLength = config.cipherAlgo === 'AES-128' ? 32 : 64; // hex chars
  const sessionKeyHex = pseudoHex(`sess:${config.recipientKeyId}:${config.plaintext}`, sessionKeyLength);
  
  // PKESK (Tag 1)
  const pkeskHex = `01` + `03` + config.recipientKeyId.toLowerCase() + `01` + pseudoHex(`pkesk:${sessionKeyHex}`, 128);
  
  // SEIPD (Tag 18) - Symmetrically Encrypted Integrity Protected Data Packet
  const encryptedPayloadHex = pseudoHex(`enc:${sessionKeyHex}:${compRes.compressedHex}`, stage3.compressedSize * 2);
  const mdcHex = pseudoHex(`mdc:${encryptedPayloadHex}`, 40);
  const seipdHex = `12` + `01` + encryptedPayloadHex + `d314` + mdcHex;

  const ciphertextHex = pkeskHex + seipdHex;
  const ciphertextEntropy = Number((7.95 + Math.random() * 0.04).toFixed(3));
  const totalBinarySize = ciphertextHex.length / 2;

  // Build complete Packet Tree Structure
  const fullPacketTree: PacketTreeNode = {
    id: 'root-pgp-msg',
    tag: 0,
    name: 'OpenPGP Encrypted Message Stream',
    length: totalBinarySize,
    description: 'RFC 4880 / RFC 9580 Canonical OpenPGP Message Structure',
    fields: [
      { label: 'Message Type', value: 'Signed, Compressed & Encrypted Message' },
      { label: 'Total Packets', value: '2 Top-Level Packets (PKESK + SEIPD)' },
    ],
    children: [
      {
        id: 'pkt-pkesk',
        tag: 1,
        name: 'PKESK Packet (Tag 1)',
        length: pkeskHex.length / 2,
        description: 'Public Key Encrypted Session Key packet containing symmetric key encrypted with recipient public key.',
        fields: [
          { label: 'Version', value: '3 (RFC 4880 §5.1)' },
          { label: 'Key ID', value: config.recipientKeyId },
          { label: 'Key Algorithm', value: config.recipientKeyType },
          { label: 'Encrypted Key Hex', value: pkeskHex.slice(20, 52) + '...', hex: pkeskHex },
        ],
      },
      {
        id: 'pkt-seipd',
        tag: 18,
        name: 'SEIPD Packet (Tag 18)',
        length: seipdHex.length / 2,
        description: 'Symmetrically Encrypted Integrity Protected Data packet containing compressed payload & MDC tag.',
        fields: [
          { label: 'Version', value: '1 (Integrity Protected)' },
          { label: 'Cipher Algorithm', value: config.cipherAlgo },
          { label: 'MDC Integrity Protection', value: 'Enabled (SHA-1 / AEAD Tag)' },
        ],
        children: [
          {
            id: 'pkt-comp',
            tag: 8,
            name: 'Compressed Data Packet (Tag 8)',
            length: stage3.compressedSize,
            description: 'Decompressed payload container holding one-pass signature, literal text, and signature.',
            fields: [
              { label: 'Compression Algorithm', value: config.compressionAlgo },
              { label: 'Compression Ratio', value: `${stage3.compressionRatio}% size reduction` },
            ],
            children: [
              {
                id: 'pkt-onepass',
                tag: 4,
                name: 'One-Pass Signature Packet (Tag 4)',
                length: onePassHex.length / 2,
                description: 'Allows streaming verification without buffering entire body before hashing.',
                fields: [
                  { label: 'Version', value: '3' },
                  { label: 'Hash Algorithm', value: config.hashAlgo },
                  { label: 'Signer Key ID', value: config.signerKeyId },
                ],
              },
              {
                id: 'pkt-literal',
                tag: 11,
                name: 'Literal Data Packet (Tag 11)',
                length: literalPacketHex.length / 2,
                description: 'Contains actual unencrypted plaintext data payload and metadata.',
                fields: [
                  { label: 'Format', value: 't (UTF-8 Text)' },
                  { label: 'Filename', value: 'message.txt' },
                  { label: 'Plaintext Length', value: `${plaintextLength} bytes` },
                ],
              },
              {
                id: 'pkt-sig',
                tag: 2,
                name: 'Signature Packet (Tag 2)',
                length: sigPacketHex.length / 2,
                description: 'Cryptographic signature computed over literal payload using signer private key.',
                fields: [
                  { label: 'Signature Type', value: '0x00 (Binary document signature)' },
                  { label: 'Hash Algorithm', value: config.hashAlgo },
                  { label: 'Signer Key ID', value: config.signerKeyId },
                  { label: 'Signature Hex', value: signatureHex.slice(0, 32) + '...', hex: signatureHex },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const stage4: Stage4Encrypt = {
    cipherAlgo: config.cipherAlgo,
    sessionKeyHex,
    pkeskHex,
    seipdHex,
    ciphertextHex,
    ciphertextEntropy,
    totalBinarySize,
    fullPacketTree,
  };

  // STAGE 5: ASCII ARMOR
  const rawBinary = ciphertextHex;
  const base64Lines: string[] = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let b64Str = '';
  for (let i = 0; i < rawBinary.length; i += 2) {
    const val = parseInt(rawBinary.slice(i, i + 2), 16);
    b64Str += chars[val % 64];
  }
  for (let i = 0; i < b64Str.length; i += 64) {
    base64Lines.push(b64Str.slice(i, i + 64));
  }
  const checksum = calculateCRC24(ciphertextHex);

  const armoredText = [
    '-----BEGIN PGP MESSAGE-----',
    `Version: CryptoViz OpenPGP v2.4 (RFC 4880/9580)`,
    `Comment: https://cryptoviz.org/openpgp`,
    '',
    ...base64Lines,
    `=${checksum}`,
    '-----END PGP MESSAGE-----',
  ].join('\n');

  const stage5: Stage5Armor = {
    armoredText,
    versionHeader: 'CryptoViz OpenPGP v2.4',
    checksumHex: checksum,
  };

  // STAGE 6: DECRYPT & VERIFY (Recipient view)
  const stage6: Stage6Decrypt = {
    decryptedSessionKeyHex: sessionKeyHex,
    isSessionKeyDecrypted: true,
    isIntegrityVerified: true,
    isDecompressed: true,
    isSignatureVerified: true,
    recoveredPlaintext: config.plaintext,
  };

  return {
    config,
    stage1,
    stage2,
    stage3,
    stage4,
    stage5,
    stage6,
    executionTimestamp: new Date().toISOString(),
  };
}

/**
 * Simulates tampering with the ciphertext, key, or signature to demonstrate error handling.
 */
export function tamperPipeline(
  pipeline: OpenPGPPipelineResult,
  tamperType: 'CORRUPT_CIPHERTEXT' | 'WRONG_RECIPIENT_KEY' | 'TAMPER_SIGNATURE' | 'NONE'
): Stage6Decrypt {
  if (tamperType === 'NONE') {
    return pipeline.stage6;
  }

  if (tamperType === 'WRONG_RECIPIENT_KEY') {
    return {
      decryptedSessionKeyHex: '00000000000000000000000000000000',
      isSessionKeyDecrypted: false,
      isIntegrityVerified: false,
      isDecompressed: false,
      isSignatureVerified: false,
      recoveredPlaintext: '',
      tamperMessage: 'Decryption Error: Private Key ID mismatch. Unable to decrypt PKESK session key.',
    };
  }

  if (tamperType === 'CORRUPT_CIPHERTEXT') {
    return {
      decryptedSessionKeyHex: pipeline.stage4.sessionKeyHex,
      isSessionKeyDecrypted: true,
      isIntegrityVerified: false,
      isDecompressed: false,
      isSignatureVerified: false,
      recoveredPlaintext: '',
      tamperMessage: 'Integrity Check Failed: SEIPD MDC digest check failed! Ciphertext was tampered with in transit.',
    };
  }

  if (tamperType === 'TAMPER_SIGNATURE') {
    return {
      decryptedSessionKeyHex: pipeline.stage4.sessionKeyHex,
      isSessionKeyDecrypted: true,
      isIntegrityVerified: true,
      isDecompressed: true,
      isSignatureVerified: false,
      recoveredPlaintext: pipeline.stage1.plaintext,
      tamperMessage: 'Signature Verification Failed: Public key signature invalid or payload modified post-signing!',
    };
  }

  return pipeline.stage6;
}
