import { describe, it, expect } from 'vitest';
import {
  calculateShannonEntropy,
  calculateCRC24,
  runOpenPGPPipeline,
  tamperPipeline,
  OpenPGPConfig,
} from '@/lib/openpgp/openpgpEngine';

describe('OpenPGP Pipeline Engine', () => {
  const defaultConfig: OpenPGPConfig = {
    plaintext: 'Confidential OpenPGP payload message with repetitive plain text content.',
    signerName: 'Alice',
    signerKeyId: '0xA11CE404',
    signerKeyType: 'RSA-2048',
    recipientName: 'Bob',
    recipientKeyId: '0xB0B80B80',
    recipientKeyType: 'Ed25519 / X25519',
    hashAlgo: 'SHA-256',
    compressionAlgo: 'ZLIB',
    cipherAlgo: 'AES-256',
  };

  it('calculates Shannon Entropy correctly', () => {
    expect(calculateShannonEntropy('')).toBe(0);
    // Repetitive text has lower entropy
    const lowEntropy = calculateShannonEntropy('AAAAAAAAAAAAAAA');
    expect(lowEntropy).toBe(0); // Only 1 distinct character

    const textEntropy = calculateShannonEntropy('Hello World 12345');
    expect(textEntropy).toBeGreaterThan(3.0);
    expect(textEntropy).toBeLessThan(8.0);
  });

  it('calculates CRC-24 checksum for ASCII Armor', () => {
    const checksum = calculateCRC24('010203040506');
    expect(checksum).toBeDefined();
    expect(typeof checksum).toBe('string');
    expect(checksum.length).toBeGreaterThan(0);
  });

  it('executes full Sign -> Compress -> Encrypt pipeline successfully', () => {
    const result = runOpenPGPPipeline(defaultConfig);

    // Stage 1
    expect(result.stage1.plaintextBytes).toBeGreaterThan(0);
    expect(result.stage1.entropy).toBeGreaterThan(0);

    // Stage 2 (Sign)
    expect(result.stage2.hashDigestHex).toBeDefined();
    expect(result.stage2.signatureHex.length).toBeGreaterThan(0);
    expect(result.stage2.onePassPacketHex.slice(0, 2)).toBe('04'); // Tag 4
    expect(result.stage2.signaturePacketHex.slice(0, 2)).toBe('02'); // Tag 2
    expect(result.stage2.literalPacketHex.slice(0, 2)).toBe('0b'); // Tag 11

    // Stage 3 (Compress)
    expect(result.stage3.compressedSize).toBeGreaterThan(0);
    expect(result.stage3.compressedEntropy).toBeGreaterThanOrEqual(result.stage3.originalEntropy);

    // Stage 4 (Encrypt)
    expect(result.stage4.sessionKeyHex).toBeDefined();
    expect(result.stage4.ciphertextEntropy).toBeGreaterThan(7.5);
    expect(result.stage4.fullPacketTree.children).toHaveLength(2); // PKESK & SEIPD

    // Stage 5 (Armor)
    expect(result.stage5.armoredText).toContain('-----BEGIN PGP MESSAGE-----');
    expect(result.stage5.armoredText).toContain('-----END PGP MESSAGE-----');

    // Stage 6 (Decrypt & Verify)
    expect(result.stage6.isSessionKeyDecrypted).toBe(true);
    expect(result.stage6.isIntegrityVerified).toBe(true);
    expect(result.stage6.isSignatureVerified).toBe(true);
    expect(result.stage6.recoveredPlaintext).toBe(defaultConfig.plaintext);
  });

  it('simulates tamper detection accurately', () => {
    const result = runOpenPGPPipeline(defaultConfig);

    // Tamper ciphertext
    const corrupted = tamperPipeline(result, 'CORRUPT_CIPHERTEXT');
    expect(corrupted.isIntegrityVerified).toBe(false);
    expect(corrupted.tamperMessage).toContain('SEIPD MDC');

    // Wrong Key
    const wrongKey = tamperPipeline(result, 'WRONG_RECIPIENT_KEY');
    expect(wrongKey.isSessionKeyDecrypted).toBe(false);
    expect(wrongKey.tamperMessage).toContain('Private Key ID mismatch');

    // Tamper Signature
    const sigTamper = tamperPipeline(result, 'TAMPER_SIGNATURE');
    expect(sigTamper.isIntegrityVerified).toBe(true);
    expect(sigTamper.isSignatureVerified).toBe(false);
    expect(sigTamper.tamperMessage).toContain('Signature Verification Failed');
  });
});
