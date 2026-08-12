import { describe, expect, it } from "vitest";
import {
  DEMO_GROUP,
  SigmaProtocolError,
  assertChallenge,
  assertWitness,
  buildSigmaProtocolChecklist,
  cheatingProver,
  extractWitness,
  fiatShamirSign,
  fiatShamirVerify,
  forgeWeakFiatShamir,
  honestTranscript,
  keygen,
  modPow,
  proverCommit,
  proverRespond,
  runCheatingExperiment,
  simulateTranscript,
  validateGroup,
  verify,
  weakFiatShamirChallenge,
} from "../../../lib/protocols/sigmaProtocols";

describe("sigma protocol utilities", () => {
  it("validates the demo group", () => {
    expect(() => validateGroup(DEMO_GROUP)).not.toThrow();
    expect(modPow(DEMO_GROUP.g, DEMO_GROUP.q, DEMO_GROUP.p)).toBe(1n);
  });

  it("generates Schnorr public keys", () => {
    const keys = keygen(DEMO_GROUP, 5n);

    expect(keys.x).toBe(5n);
    expect(keys.y).toBe(modPow(DEMO_GROUP.g, 5n, DEMO_GROUP.p));
    expect(keys.trace[0].formula).toBe("y = g^x mod p");
  });

  it("completeness: honest transcripts verify", () => {
    const transcript = honestTranscript(DEMO_GROUP, 5n, 3n, 2n);
    const { y } = keygen(DEMO_GROUP, 5n);

    expect(transcript.accepted).toBe(true);
    expect(verify(DEMO_GROUP, y, transcript)).toBe(true);
  });

  it("builds commit and response values", () => {
    expect(proverCommit(DEMO_GROUP, 3n).commitment).toBe(
      modPow(DEMO_GROUP.g, 3n, DEMO_GROUP.p),
    );
    expect(proverRespond(DEMO_GROUP, 3n, 2n, 5n).response).toBe(2n);
  });

  it("special soundness: extracts witness from two accepting transcripts", () => {
    const a = honestTranscript(DEMO_GROUP, 5n, 3n, 2n);
    const b = honestTranscript(DEMO_GROUP, 5n, 3n, 4n);

    expect(extractWitness(DEMO_GROUP, a, b).witness).toBe(5n);
  });

  it("zero-knowledge: simulated transcripts verify without witness", () => {
    const { y } = keygen(DEMO_GROUP, 5n);
    const simulated = simulateTranscript(DEMO_GROUP, y, 2n, 7n);

    expect(simulated.simulated).toBe(true);
    expect(simulated.accepted).toBe(true);
    expect(verify(DEMO_GROUP, y, simulated)).toBe(true);
  });

  it("runs a cheating prover experiment near the challenge bound", () => {
    const { y } = keygen(DEMO_GROUP, 5n);
    const experiment = runCheatingExperiment(DEMO_GROUP, y, 96);

    expect(experiment.challengeSpace).toBe(8);
    expect(experiment.theoreticalProbability).toBe(0.125);
    expect(experiment.successes).toBeGreaterThan(0);
    expect(experiment.observedProbability).toBeGreaterThanOrEqual(0);
  });

  it("creates Fiat-Shamir signatures and rejects tampering", () => {
    const { y } = keygen(DEMO_GROUP, 5n);
    const signature = fiatShamirSign(DEMO_GROUP, 5n, "hello", 3n);

    expect(fiatShamirVerify(DEMO_GROUP, y, "hello", signature)).toBe(true);
    expect(fiatShamirVerify(DEMO_GROUP, y, "hello!", signature)).toBe(false);
  });

  it("demonstrates weakened Fiat-Shamir context omission", () => {
    const { y } = keygen(DEMO_GROUP, 5n);
    const forged = forgeWeakFiatShamir(DEMO_GROUP, y, "message", 6n);

    expect(forged.challenge).toBe(
      weakFiatShamirChallenge(DEMO_GROUP, forged.commitment),
    );
    expect(forged.trace[0].note).toMatch(/omits public key and message/i);
  });

  it("throws coded errors for invalid inputs", () => {
    expect(() => assertWitness(DEMO_GROUP, 0n)).toThrow(SigmaProtocolError);
    expect(() => assertChallenge(DEMO_GROUP, 9n)).toThrow(SigmaProtocolError);

    const a = honestTranscript(DEMO_GROUP, 5n, 3n, 2n);
    expect(() => extractWitness(DEMO_GROUP, a, a)).toThrow(
      /distinct challenges/i,
    );
  });

  it("builds manual checklist", () => {
    const checklist = buildSigmaProtocolChecklist();

    expect(checklist).toContain(
      "Generate simulated transcripts and confirm they verify without a witness.",
    );
    expect(checklist.some((item) => item.includes("Fiat-Shamir"))).toBe(true);
  });

  it("cheating prover can prepare for only one challenge", () => {
    const { y } = keygen(DEMO_GROUP, 5n);
    const transcript = cheatingProver(DEMO_GROUP, y, 2n, 4n);

    expect(transcript.challenge).toBe(2n);
    expect(
      transcript.trace.some((entry) => entry.label === "Cheating strategy"),
    ).toBe(true);
  });
});
