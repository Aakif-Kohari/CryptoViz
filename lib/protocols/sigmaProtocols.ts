export interface GroupParams {
  p: bigint;
  q: bigint;
  g: bigint;
  name: string;
  challengeBits?: number;
}

export interface StepTrace {
  label: string;
  formula: string;
  substituted: string;
  note: string;
}

export interface KeyPair {
  x: bigint;
  y: bigint;
  trace: StepTrace[];
}

export interface Transcript {
  /** Commitment t = g^r. */
  commitment: bigint;
  /** Challenge c. */
  challenge: bigint;
  /** Response s = r + c·x mod q. */
  response: bigint;
  accepted: boolean;
  /** Whether a witness was used — false for simulated transcripts. */
  simulated: boolean;
  trace: StepTrace[];
}

export interface Signature {
  commitment: bigint;
  challenge: bigint;
  response: bigint;
  message: string;
  trace: StepTrace[];
}

export interface CheatingRunSummary {
  attempts: number;
  successes: number;
  challengeSpace: number;
  theoreticalProbability: number;
  observedProbability: number;
  transcripts: Transcript[];
  trace: StepTrace[];
}

export class SigmaProtocolError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "SigmaProtocolError";
    this.code = code;
  }
}

export const DEMO_GROUP: GroupParams = {
  name: "Small Schnorr demo group",
  p: 23n,
  q: 11n,
  g: 2n,
  challengeBits: 3,
};

function step(
  label: string,
  formula: string,
  substituted: string,
  note: string,
): StepTrace {
  return { label, formula, substituted, note };
}

export function mod(value: bigint, modulus: bigint): bigint {
  const result = value % modulus;
  return result >= 0n ? result : result + modulus;
}

export function modPow(
  base: bigint,
  exponent: bigint,
  modulus: bigint,
): bigint {
  if (modulus <= 1n) return 0n;
  let result = 1n;
  let current = mod(base, modulus);
  let power = exponent;

  while (power > 0n) {
    if (power & 1n) result = mod(result * current, modulus);
    current = mod(current * current, modulus);
    power >>= 1n;
  }

  return result;
}

export function egcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
  if (b === 0n) return [a, 1n, 0n];
  const [gcd, x1, y1] = egcd(b, a % b);
  return [gcd, y1, x1 - (a / b) * y1];
}

export function modInverse(value: bigint, modulus: bigint): bigint {
  const [gcd, x] = egcd(mod(value, modulus), modulus);
  if (gcd !== 1n) {
    throw new SigmaProtocolError(
      "NON_INVERTIBLE",
      `No modular inverse exists for ${value} mod ${modulus}.`,
    );
  }
  return mod(x, modulus);
}

export function validateGroup(params: GroupParams): void {
  if (params.p <= 2n || params.q <= 1n) {
    throw new SigmaProtocolError(
      "INVALID_GROUP",
      "Group parameters must use p > 2 and q > 1.",
    );
  }

  if ((params.p - 1n) % params.q !== 0n) {
    throw new SigmaProtocolError("INVALID_GROUP", "q must divide p - 1.");
  }

  if (modPow(params.g, params.q, params.p) !== 1n) {
    throw new SigmaProtocolError("INVALID_GENERATOR", "g must have order q.");
  }

  if (params.g <= 1n || params.g >= params.p) {
    throw new SigmaProtocolError(
      "INVALID_GENERATOR",
      "g must be in the range [2, p - 1].",
    );
  }
}

export function assertWitness(params: GroupParams, x: bigint): bigint {
  validateGroup(params);

  if (x < 1n || x >= params.q) {
    throw new SigmaProtocolError(
      "INVALID_WITNESS",
      "Witness x must be in [1, q - 1].",
    );
  }

  return x;
}

export function challengeSpace(params: GroupParams): bigint {
  const bits = BigInt(params.challengeBits ?? 3);
  return 1n << bits;
}

export function assertChallenge(
  params: GroupParams,
  challenge: bigint,
): bigint {
  const space = challengeSpace(params);

  if (challenge < 0n || challenge >= space) {
    throw new SigmaProtocolError(
      "INVALID_CHALLENGE",
      `Challenge must be in [0, ${space - 1n}].`,
    );
  }

  return challenge;
}

export function keygen(params: GroupParams, x: bigint): KeyPair {
  const witness = assertWitness(params, x);
  const y = modPow(params.g, witness, params.p);

  return {
    x: witness,
    y,
    trace: [
      step(
        "Public key",
        "y = g^x mod p",
        `${y} = ${params.g}^${witness} mod ${params.p}`,
        "The prover keeps x secret and publishes y.",
      ),
    ],
  };
}

export function proverCommit(
  params: GroupParams,
  r: bigint,
): { commitment: bigint; trace: StepTrace[] } {
  validateGroup(params);
  const nonce = mod(r, params.q);
  const commitment = modPow(params.g, nonce, params.p);

  return {
    commitment,
    trace: [
      step(
        "Commitment",
        "t = g^r mod p",
        `${commitment} = ${params.g}^${nonce} mod ${params.p}`,
        "The prover commits before seeing the challenge.",
      ),
    ],
  };
}

export function proverRespond(
  params: GroupParams,
  r: bigint,
  c: bigint,
  x: bigint,
): { response: bigint; trace: StepTrace[] } {
  const witness = assertWitness(params, x);
  const challenge = assertChallenge(params, c);
  const nonce = mod(r, params.q);
  const response = mod(nonce + challenge * witness, params.q);

  return {
    response,
    trace: [
      step(
        "Response",
        "s = r + c·x mod q",
        `${response} = ${nonce} + ${challenge}·${witness} mod ${params.q}`,
        "The response binds the commitment to the secret witness without revealing it.",
      ),
    ],
  };
}

export function verify(
  params: GroupParams,
  y: bigint,
  transcript: Transcript,
): boolean {
  validateGroup(params);
  assertChallenge(params, transcript.challenge);

  const left = modPow(params.g, transcript.response, params.p);
  const right = mod(
    transcript.commitment * modPow(y, transcript.challenge, params.p),
    params.p,
  );
  return left === right;
}

export function honestTranscript(
  params: GroupParams,
  x: bigint,
  r: bigint,
  c: bigint,
): Transcript {
  const keys = keygen(params, x);
  const commit = proverCommit(params, r);
  const response = proverRespond(params, r, c, x);
  const transcript: Transcript = {
    commitment: commit.commitment,
    challenge: assertChallenge(params, c),
    response: response.response,
    accepted: false,
    simulated: false,
    trace: [...keys.trace, ...commit.trace, ...response.trace],
  };

  transcript.accepted = verify(params, keys.y, transcript);
  transcript.trace.push(
    step(
      "Verification",
      "g^s ?= t·y^c mod p",
      `${modPow(params.g, transcript.response, params.p)} ?= ${mod(transcript.commitment * modPow(keys.y, transcript.challenge, params.p), params.p)}`,
      transcript.accepted
        ? "The honest transcript verifies."
        : "The honest transcript failed verification.",
    ),
  );

  return transcript;
}

/** Zero-knowledge: build an accepting transcript with NO witness. */
export function simulateTranscript(
  params: GroupParams,
  y: bigint,
  c: bigint,
  s: bigint,
): Transcript {
  validateGroup(params);
  const challenge = assertChallenge(params, c);
  const response = mod(s, params.q);
  const commitment = mod(
    modPow(params.g, response, params.p) *
      modInverse(modPow(y, challenge, params.p), params.p),
    params.p,
  );

  const transcript: Transcript = {
    commitment,
    challenge,
    response,
    accepted: false,
    simulated: true,
    trace: [
      step(
        "Simulated commitment",
        "t = g^s · y^(-c) mod p",
        `${commitment} = ${params.g}^${response} · ${y}^(-${challenge}) mod ${params.p}`,
        "The simulator chooses c and s first, then constructs a valid commitment without knowing x.",
      ),
    ],
  };

  transcript.accepted = verify(params, y, transcript);
  transcript.trace.push(
    step(
      "Simulation verification",
      "g^s = t·y^c mod p",
      `${modPow(params.g, response, params.p)} = ${mod(commitment * modPow(y, challenge, params.p), params.p)}`,
      "The verifier accepts even though no witness was used.",
    ),
  );

  return transcript;
}

/** Special soundness: two accepting transcripts, same commitment ⇒ the witness. */
export function extractWitness(
  params: GroupParams,
  a: Transcript,
  b: Transcript,
): { witness: bigint; trace: StepTrace[] } {
  validateGroup(params);

  if (!a.accepted || !b.accepted) {
    throw new SigmaProtocolError(
      "NON_ACCEPTING_TRANSCRIPT",
      "Both transcripts must be accepting.",
    );
  }

  if (a.commitment !== b.commitment) {
    throw new SigmaProtocolError(
      "DIFFERENT_COMMITMENT",
      "Transcripts must share the same commitment.",
    );
  }

  if (a.challenge === b.challenge) {
    throw new SigmaProtocolError(
      "EQUAL_CHALLENGES",
      "Extractor needs two distinct challenges.",
    );
  }

  const numerator = mod(a.response - b.response, params.q);
  const denominator = mod(a.challenge - b.challenge, params.q);
  const witness = mod(numerator * modInverse(denominator, params.q), params.q);

  return {
    witness,
    trace: [
      step(
        "Knowledge extraction",
        "x = (s₁ - s₂) / (c₁ - c₂) mod q",
        `${witness} = (${a.response} - ${b.response}) / (${a.challenge} - ${b.challenge}) mod ${params.q}`,
        "Two accepting transcripts on one commitment reveal the witness.",
      ),
    ],
  };
}

/** A prover without the witness, guessing the challenge in advance. */
export function cheatingProver(
  params: GroupParams,
  y: bigint,
  guess: bigint,
  response = 1n,
): Transcript {
  const challenge = assertChallenge(params, guess);
  const transcript = simulateTranscript(params, y, challenge, response);
  transcript.simulated = false;
  transcript.trace.push(
    step(
      "Cheating strategy",
      "guess c before verifier chooses it",
      `guessed challenge = ${challenge}`,
      "A cheating prover can prepare only for the challenge it guessed.",
    ),
  );
  return transcript;
}

export function runCheatingExperiment(
  params: GroupParams,
  y: bigint,
  attempts = 100,
): CheatingRunSummary {
  validateGroup(params);
  const space = Number(challengeSpace(params));
  const transcripts: Transcript[] = [];
  let successes = 0;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const guess = BigInt(attempt % space);
    const actualChallenge = BigInt((attempt * 7 + 3) % space);
    const transcript = cheatingProver(
      params,
      y,
      guess,
      BigInt((attempt % Number(params.q - 1n)) + 1),
    );

    if (guess === actualChallenge) {
      transcript.challenge = actualChallenge;
      transcript.accepted = verify(params, y, transcript);
    } else {
      transcript.challenge = actualChallenge;
      transcript.accepted = false;
    }

    if (transcript.accepted) successes += 1;
    transcripts.push(transcript);
  }

  return {
    attempts,
    successes,
    challengeSpace: space,
    theoreticalProbability: Number((1 / space).toFixed(4)),
    observedProbability: Number((successes / attempts).toFixed(4)),
    transcripts,
    trace: [
      step(
        "Soundness bound",
        "Pr[cheat succeeds] = 1 / |challenge space|",
        `${successes}/${attempts} observed against 1/${space} theoretical`,
        "Without the witness, the prover must guess the verifier's challenge.",
      ),
    ],
  };
}

function simpleHashToChallenge(params: GroupParams, values: string[]): bigint {
  const payload = values.join("|");
  let hash = 1469598103934665603n;

  for (const char of payload) {
    hash ^= BigInt(char.codePointAt(0) ?? 0);
    hash = mod(hash * 1099511628211n, 2n ** 64n);
  }

  return mod(hash, challengeSpace(params));
}

export function fiatShamirChallenge(
  params: GroupParams,
  y: bigint,
  commitment: bigint,
  message: string,
): bigint {
  return simpleHashToChallenge(params, [
    params.name,
    params.p.toString(),
    params.q.toString(),
    params.g.toString(),
    y.toString(),
    commitment.toString(),
    message,
  ]);
}

export function fiatShamirSign(
  params: GroupParams,
  x: bigint,
  message: string,
  r = 4n,
): Signature {
  const keys = keygen(params, x);
  const commit = proverCommit(params, r);
  const challenge = fiatShamirChallenge(
    params,
    keys.y,
    commit.commitment,
    message,
  );
  const response = proverRespond(params, r, challenge, x);

  return {
    commitment: commit.commitment,
    challenge,
    response: response.response,
    message,
    trace: [
      ...keys.trace,
      ...commit.trace,
      step(
        "Fiat-Shamir challenge",
        "c = H(group, y, t, message)",
        `${challenge} = H(${keys.y}, ${commit.commitment}, "${message}")`,
        "The verifier's random challenge is replaced by a hash challenge.",
      ),
      ...response.trace,
    ],
  };
}

export function fiatShamirVerify(
  params: GroupParams,
  y: bigint,
  message: string,
  sig: Signature,
): boolean {
  const expected = fiatShamirChallenge(params, y, sig.commitment, message);

  if (expected !== sig.challenge) return false;

  return verify(params, y, {
    commitment: sig.commitment,
    challenge: sig.challenge,
    response: sig.response,
    accepted: true,
    simulated: false,
    trace: [],
  });
}

export function weakFiatShamirChallenge(
  params: GroupParams,
  commitment: bigint,
): bigint {
  return simpleHashToChallenge(params, [commitment.toString()]);
}

export function forgeWeakFiatShamir(
  params: GroupParams,
  y: bigint,
  message: string,
  response = 7n,
): Signature {
  const challenge = weakFiatShamirChallenge(
    params,
    modPow(params.g, response, params.p),
  );
  const commitment = mod(
    modPow(params.g, response, params.p) *
      modInverse(modPow(y, challenge, params.p), params.p),
    params.p,
  );

  return {
    commitment,
    challenge: weakFiatShamirChallenge(params, commitment),
    response: mod(response, params.q),
    message,
    trace: [
      step(
        "Weak Fiat-Shamir forgery",
        "omit y and message from hash input",
        `challenge = H(${commitment})`,
        "When the hash omits public key and message context, a transcript can be repurposed.",
      ),
    ],
  };
}

export function buildSigmaProtocolChecklist(): string[] {
  return [
    "Run an honest Schnorr identification transcript and confirm verification succeeds.",
    "Run two accepting transcripts with the same commitment and confirm the extractor recovers x.",
    "Generate simulated transcripts and confirm they verify without a witness.",
    "Run the cheating prover experiment and compare observed success to 1 divided by challenge space.",
    "Create a Fiat-Shamir signature and confirm message tampering fails verification.",
    "Show the weakened Fiat-Shamir pitfall and explain why omitting context is dangerous.",
    "Resize the playground on desktop, tablet, and mobile widths.",
    "Run the focused sigma protocol unit tests.",
  ];
}
