import { describe, it, expect } from 'vitest';
import {
  simulateX3DH,
  calculateECDH,
  kdfChainStep,
  kdfRootStep,
  createSignalConversation,
  runSelfHealingAttackSimulation,
} from '@/lib/signal/signalRatchetEngine';

describe('Signal Double Ratchet & X3DH Engine', () => {
  it('simulates X3DH handshake and derives shared root key', () => {
    const x3dh = simulateX3DH('alice', 'bob');

    expect(x3dh.aliceIK.publicKeyHex).toBeDefined();
    expect(x3dh.bobIK.publicKeyHex).toBeDefined();
    expect(x3dh.bobSPK.publicKeyHex).toBeDefined();
    expect(x3dh.bobOPK.publicKeyHex).toBeDefined();
    expect(x3dh.sharedRootKeyHex).toHaveLength(64);
  });

  it('performs KDF chain ratchet steps correctly', () => {
    const initialCK = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
    const step1 = kdfChainStep(initialCK);
    const step2 = kdfChainStep(step1.nextChainKeyHex);

    expect(step1.messageKeyHex).not.toBe(step2.messageKeyHex);
    expect(step1.nextChainKeyHex).not.toBe(step2.nextChainKeyHex);
  });

  it('performs DH root ratchet steps correctly', () => {
    const rootKey = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const dhSecret = calculateECDH('1111', '2222');
    const rkRes = kdfRootStep(rootKey, dhSecret);

    expect(rkRes.nextRootKeyHex).toHaveLength(64);
    expect(rkRes.newChainKeyHex).toHaveLength(64);
    expect(rkRes.nextRootKeyHex).not.toBe(rootKey);
  });

  it('handles multi-turn conversation between Alice and Bob', () => {
    const { aliceSession, bobSession } = createSignalConversation();

    // Alice sends msg 1
    const msg1 = aliceSession.encryptMessage('Hello Bob!');
    expect(msg1.sender).toBe('Alice');
    expect(aliceSession.sendMessageCount).toBe(1);

    // Bob decrypts msg 1
    const dec1 = bobSession.decryptMessage(msg1);
    expect(dec1.plaintext).toBe('Hello Bob!');

    // Bob replies with msg 2
    const msg2 = bobSession.encryptMessage('Hey Alice, received!');
    const dec2 = aliceSession.decryptMessage(msg2);

    expect(dec2.plaintext).toBe('Hey Alice, received!');
    expect(dec2.dhRatchetTriggered).toBe(true);
  });

  it('demonstrates Post-Compromise Security (Self-Healing) attack simulation', () => {
    const result = runSelfHealingAttackSimulation();

    expect(result.pastMessagesSecured).toBe(true);
    expect(result.healedMessagesSecured).toBe(true);
    expect(result.messageLog.length).toBeGreaterThan(0);
  });
});
