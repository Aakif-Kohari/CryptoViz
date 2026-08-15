'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  LockKeyhole,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  XCircle,
} from 'lucide-react';

type SecurityMode = 'IND-CPA' | 'IND-CCA1' | 'IND-CCA2' | 'EUF-CMA';

type PrimitiveId =
  | 'aes-ecb'
  | 'aes-cbc'
  | 'aes-gcm'
  | 'rsa-textbook'
  | 'rsa-oaep'
  | 'hmac-sha256';

type GamePhase = 'setup' | 'challenge' | 'oracle' | 'guess' | 'complete';

type RoundResult = {
  round: number;
  won: boolean;
  correctGuess: number;
  actualBit: number;
  advantage: number;
};

type OracleEvent = {
  id: number;
  actor: 'A' | 'C';
  label: string;
  value?: string;
};

type PrimitiveDefinition = {
  id: PrimitiveId;
  name: string;
  shortName: string;
  category: 'Symmetric' | 'Asymmetric' | 'Authentication';
  deterministic: boolean;
  supportsEncryption: boolean;
  supportsAuthentication: boolean;
  cpaSecure: boolean;
  cca1Secure: boolean;
  cca2Secure: boolean;
  eufCmaSecure: boolean;
  description: string;
  lesson: string;
};

const MODE_DESCRIPTIONS: Record<
  SecurityMode,
  {
    title: string;
    description: string;
    oracle: string;
    objective: string;
  }
> = {
  'IND-CPA': {
    title: 'Indistinguishability under Chosen-Plaintext Attack',
    description:
      'The adversary can ask for encryptions of messages before and after receiving the challenge, but cannot decrypt the challenge.',
    oracle: 'Encryption Oracle',
    objective:
      'Choose two equal-length messages and determine which one the Challenger encrypted.',
  },
  'IND-CCA1': {
    title: 'Indistinguishability under Chosen-Ciphertext Attack',
    description:
      'The adversary can use both encryption and decryption oracles before receiving the challenge ciphertext.',
    oracle: 'Encryption + Pre-challenge Decryption',
    objective:
      'Use permitted decryption queries to learn enough information to distinguish the challenge.',
  },
  'IND-CCA2': {
    title: 'Indistinguishability under Adaptive Chosen-Ciphertext Attack',
    description:
      'The adversary can continue querying the decryption oracle after receiving the challenge, except for the challenge ciphertext itself.',
    oracle: 'Encryption + Adaptive Decryption',
    objective:
      'Attempt to distinguish the challenge while respecting the rule that the exact challenge ciphertext cannot be decrypted.',
  },
  'EUF-CMA': {
    title: 'Existential Unforgeability under Chosen-Message Attack',
    description:
      'The adversary receives valid signatures or authentication tags for chosen messages and attempts to produce a valid forgery for a new message.',
    oracle: 'Signing / Authentication Oracle',
    objective:
      'Produce a valid authentication value for a message that was never submitted to the signing oracle.',
  },
};

const PRIMITIVES: Record<PrimitiveId, PrimitiveDefinition> = {
  'aes-ecb': {
    id: 'aes-ecb',
    name: 'AES-ECB',
    shortName: 'AES-ECB',
    category: 'Symmetric',
    deterministic: true,
    supportsEncryption: true,
    supportsAuthentication: false,
    cpaSecure: false,
    cca1Secure: false,
    cca2Secure: false,
    eufCmaSecure: false,
    description:
      'A deterministic block-encryption construction. Equal plaintext blocks produce equal ciphertext blocks.',
    lesson:
      'Determinism gives the adversary a direct comparison attack: encrypt m₀ through the public encryption oracle and compare it with c*.',
  },
  'aes-cbc': {
    id: 'aes-cbc',
    name: 'AES-CBC with Random IV',
    shortName: 'AES-CBC',
    category: 'Symmetric',
    deterministic: false,
    supportsEncryption: true,
    supportsAuthentication: false,
    cpaSecure: true,
    cca1Secure: false,
    cca2Secure: false,
    eufCmaSecure: false,
    description:
      'CBC encryption with a fresh random IV for every encryption.',
    lesson:
      'A fresh IV prevents simple ciphertext equality tests, but encryption alone does not provide ciphertext integrity. In real systems, unauthenticated CBC can expose decryption-oracle vulnerabilities.',
  },
  'aes-gcm': {
    id: 'aes-gcm',
    name: 'AES-GCM',
    shortName: 'AES-GCM',
    category: 'Symmetric',
    deterministic: false,
    supportsEncryption: true,
    supportsAuthentication: true,
    cpaSecure: true,
    cca1Secure: true,
    cca2Secure: true,
    eufCmaSecure: false,
    description:
      'Authenticated encryption with fresh nonces and an authentication tag.',
    lesson:
      'GCM combines randomized encryption with integrity protection. A modified ciphertext fails authentication instead of exposing a padding-oracle style response.',
  },
  'rsa-textbook': {
    id: 'rsa-textbook',
    name: 'Textbook RSA',
    shortName: 'RSA',
    category: 'Asymmetric',
    deterministic: true,
    supportsEncryption: true,
    supportsAuthentication: false,
    cpaSecure: false,
    cca1Secure: false,
    cca2Secure: false,
    eufCmaSecure: false,
    description:
      'Raw RSA encryption without randomized padding.',
    lesson:
      'Textbook RSA is deterministic and therefore fails the basic indistinguishability game. RSA-OAEP adds randomized encoding to address this weakness.',
  },
  'rsa-oaep': {
    id: 'rsa-oaep',
    name: 'RSA-OAEP',
    shortName: 'RSA-OAEP',
    category: 'Asymmetric',
    deterministic: false,
    supportsEncryption: true,
    supportsAuthentication: false,
    cpaSecure: true,
    cca1Secure: true,
    cca2Secure: true,
    eufCmaSecure: false,
    description:
      'RSA encryption using randomized OAEP encoding.',
    lesson:
      'OAEP introduces randomized encoding so the same plaintext does not map to the same ciphertext across encryptions.',
  },
  'hmac-sha256': {
    id: 'hmac-sha256',
    name: 'HMAC-SHA-256',
    shortName: 'HMAC-SHA-256',
    category: 'Authentication',
    deterministic: true,
    supportsEncryption: false,
    supportsAuthentication: true,
    cpaSecure: false,
    cca1Secure: false,
    cca2Secure: false,
    eufCmaSecure: true,
    description:
      'A message authentication construction used here as the authenticity primitive for the EUF-CMA learning game.',
    lesson:
      'The adversary may request tags for messages but must produce a valid tag for a fresh message. The simulator models the secret-key boundary without exposing the key.',
  },
};

const MODE_OPTIONS: SecurityMode[] = [
  'IND-CPA',
  'IND-CCA1',
  'IND-CCA2',
  'EUF-CMA',
];

const PRIMITIVE_OPTIONS: PrimitiveId[] = [
  'aes-ecb',
  'aes-cbc',
  'aes-gcm',
  'rsa-textbook',
  'rsa-oaep',
  'hmac-sha256',
];

const DEFAULT_M0 = 'HELLO';
const DEFAULT_M1 = 'WORLD';

const MAX_ROUNDS = 20;

function randomBit(): number {
  return Math.random() < 0.5 ? 0 : 1;
}

function randomToken(length = 24): string {
  const alphabet = '0123456789abcdef';
  let result = '';

  for (let index = 0; index < length; index += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return result;
}

function deterministicFingerprint(
  primitive: PrimitiveId,
  message: string,
): string {
  let hash = 2166136261;

  const input = `${primitive}:${message}`;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  const unsigned = hash >>> 0;

  return `${unsigned.toString(16).padStart(8, '0')}${unsigned
    .toString(16)
    .padStart(8, '0')}${message.length.toString(16).padStart(4, '0')}`;
}

function makeCiphertext(
  primitive: PrimitiveId,
  message: string,
): string {
  const definition = PRIMITIVES[primitive];

  if (definition.deterministic) {
    return `ct_${deterministicFingerprint(primitive, message)}`;
  }

  return `ct_${deterministicFingerprint(primitive, message)}_${randomToken(
    16,
  )}`;
}

function makeAuthenticationTag(message: string): string {
  return `tag_${deterministicFingerprint('hmac-sha256', message)}_${randomToken(
    8,
  )}`;
}

function getSecurityProperty(
  mode: SecurityMode,
  primitive: PrimitiveDefinition,
): boolean {
  if (mode === 'IND-CPA') {
    return primitive.cpaSecure;
  }

  if (mode === 'IND-CCA1') {
    return primitive.cca1Secure;
  }

  if (mode === 'IND-CCA2') {
    return primitive.cca2Secure;
  }

  return primitive.eufCmaSecure;
}

function getAdvantage(wins: number, rounds: number): number {
  if (rounds === 0) {
    return 0;
  }

  return Math.abs(2 * (wins / rounds) - 1);
}

function securityLabel(
  mode: SecurityMode,
  primitive: PrimitiveDefinition,
): {
  secure: boolean;
  title: string;
  description: string;
} {
  const secure = getSecurityProperty(mode, primitive);

  if (mode === 'EUF-CMA') {
    return secure
      ? {
          secure: true,
          title: 'Expected to resist EUF-CMA',
          description:
            'The simulated authentication primitive requires a fresh valid tag for a message that was never queried.',
        }
      : {
          secure: false,
          title: 'Not an EUF-CMA construction',
          description:
            'Encryption primitives are not signature schemes. Select HMAC-SHA-256 to study the authenticity game.',
        };
  }

  return secure
    ? {
        secure: true,
        title: `Expected to resist ${mode}`,
        description:
          'The selected construction includes the randomness or integrity property required by this educational model.',
      }
    : {
        secure: false,
        title: `Expected to fail ${mode}`,
        description:
          'The selected construction exposes a structural property that gives the adversary a useful distinguishing or oracle strategy.',
      };
}

function Waveform({
  events,
}: {
  events: OracleEvent[];
}) {
  return (
    <div className="space-y-2">
      {events.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Messages between A and C will appear here.
        </p>
      ) : (
        events.map((event) => (
          <div
            key={event.id}
            className={`flex items-start gap-2 rounded-lg border p-2.5 text-xs ${
              event.actor === 'A'
                ? 'border-teal-500/20 bg-teal-500/5'
                : 'border-indigo-500/20 bg-indigo-500/5'
            }`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                event.actor === 'A'
                  ? 'bg-teal-500 text-black'
                  : 'bg-indigo-500 text-white'
              }`}
            >
              {event.actor}
            </span>

            <div className="min-w-0">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                {event.label}
              </p>

              {event.value && (
                <p className="mt-1 break-all font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                  {event.value}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AdvantageGraph({
  rounds,
}: {
  rounds: RoundResult[];
}) {
  const width = 640;
  const height = 190;
  const padding = 28;

  const points = rounds.map((round, index) => {
    const x =
      rounds.length <= 1
        ? width / 2
        : padding +
          (index / Math.max(1, rounds.length - 1)) *
            (width - padding * 2);

    const y =
      height -
      padding -
      round.advantage * (height - padding * 2);

    return `${x},${y}`;
  });

  const path = points.length > 0 ? `M ${points.join(' L ')}` : '';

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-white">
            Empirical advantage
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Adv(A) = |2 · Pr[b′ = b] − 1|
          </p>
        </div>

        <Activity className="h-4 w-4 text-teal-500" />
      </div>

      <div className="px-3 py-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label="Adversary empirical advantage over game rounds"
        >
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="currentColor"
            strokeOpacity="0.1"
          />

          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="currentColor"
            strokeOpacity="0.1"
          />

          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="currentColor"
            strokeOpacity="0.1"
          />

          <text
            x="4"
            y={padding + 4}
            className="fill-zinc-400 text-[11px]"
          >
            1.0
          </text>

          <text
            x="4"
            y={height / 2 + 4}
            className="fill-zinc-400 text-[11px]"
          >
            0.5
          </text>

          <text
            x="4"
            y={height - padding + 4}
            className="fill-zinc-400 text-[11px]"
          >
            0
          </text>

          {path && (
            <path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-teal-500"
            />
          )}

          {rounds.map((round, index) => {
            const x =
              rounds.length <= 1
                ? width / 2
                : padding +
                  (index / Math.max(1, rounds.length - 1)) *
                    (width - padding * 2);

            const y =
              height -
              padding -
              round.advantage * (height - padding * 2);

            return (
              <circle
                key={round.round}
                cx={x}
                cy={y}
                r="3.5"
                className={
                  round.won
                    ? 'fill-emerald-500'
                    : 'fill-red-500'
                }
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function SecurityGameSimulator() {
  const [mode, setMode] = useState<SecurityMode>('IND-CPA');
  const [primitive, setPrimitive] = useState<PrimitiveId>('aes-ecb');

  const [m0, setM0] = useState(DEFAULT_M0);
  const [m1, setM1] = useState(DEFAULT_M1);

  const [challengeBit, setChallengeBit] = useState<number | null>(null);
  const [challengeCiphertext, setChallengeCiphertext] = useState('');
  const [oracleQuery, setOracleQuery] = useState('');
  const [oracleResult, setOracleResult] = useState('');
  const [guess, setGuess] = useState<number | null>(null);

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [events, setEvents] = useState<OracleEvent[]>([]);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const [signedMessages, setSignedMessages] = useState<
    Array<{ message: string; tag: string }>
  >([]);
  const [forgeryMessage, setForgeryMessage] = useState('');
  const [forgeryTag, setForgeryTag] = useState('');

  const definition = PRIMITIVES[primitive];
  const modeDefinition = MODE_DESCRIPTIONS[mode];

  const security = useMemo(
    () => securityLabel(mode, definition),
    [mode, definition],
  );

  const wins = rounds.filter((round) => round.won).length;
  const totalRounds = rounds.length;
  const empiricalAdvantage = getAdvantage(wins, totalRounds);

  const addEvent = useCallback(
    (actor: 'A' | 'C', label: string, value?: string) => {
      setEvents((current) => [
        ...current,
        {
          id: Date.now() + current.length,
          actor,
          label,
          value,
        },
      ]);
    },
    [],
  );

  const resetRound = useCallback(() => {
    setChallengeBit(null);
    setChallengeCiphertext('');
    setOracleQuery('');
    setOracleResult('');
    setGuess(null);
    setPhase('setup');
    setEvents([]);
    setMessage(null);
    setSignedMessages([]);
    setForgeryMessage('');
    setForgeryTag('');
  }, []);

  const handleModeChange = (nextMode: SecurityMode) => {
    setMode(nextMode);
    resetRound();

    if (nextMode === 'EUF-CMA') {
      setPrimitive('hmac-sha256');
    } else if (primitive === 'hmac-sha256') {
      setPrimitive('aes-ecb');
    }
  };

  const handlePrimitiveChange = (nextPrimitive: PrimitiveId) => {
    setPrimitive(nextPrimitive);
    resetRound();
  };

  const submitChallenge = () => {
    if (mode === 'EUF-CMA') {
      return;
    }

    if (!m0.trim() || !m1.trim()) {
      setMessage('Both challenge messages are required.');
      return;
    }

    if (m0.length !== m1.length) {
      setMessage(
        'IND challenge messages must have equal length. Try messages with the same number of characters.',
      );
      return;
    }

    const bit = randomBit();
    const selectedMessage = bit === 0 ? m0 : m1;
    const ciphertext = makeCiphertext(primitive, selectedMessage);

    setChallengeBit(bit);
    setChallengeCiphertext(ciphertext);
    setOracleResult('');
    setGuess(null);
    setMessage(null);
    setPhase('oracle');

    addEvent('A', 'Submitted m₀ and m₁', `${m0}  /  ${m1}`);
    addEvent('C', 'Selected secret challenge bit b', 'b ∈ {0, 1}');
    addEvent('C', 'Returned challenge ciphertext c*', ciphertext);
  };

  const queryEncryptionOracle = () => {
    if (!oracleQuery.trim()) {
      setMessage('Enter a message for the encryption oracle.');
      return;
    }

    const result = makeCiphertext(primitive, oracleQuery);

    setOracleResult(result);
    setMessage(null);

    addEvent('A', 'Queried encryption oracle', oracleQuery);
    addEvent('C', 'Returned encryption', result);
  };

  const queryDecryptionOracle = () => {
    if (!oracleQuery.trim()) {
      setMessage('Enter a ciphertext for the decryption oracle.');
      return;
    }

    if (
      mode === 'IND-CCA2' &&
      oracleQuery.trim() === challengeCiphertext
    ) {
      setMessage(
        'CCA2 rule: the exact challenge ciphertext cannot be submitted to the decryption oracle.',
      );

      addEvent(
        'C',
        'Rejected forbidden challenge-ciphertext query',
        challengeCiphertext,
      );

      return;
    }

    const isKnownChallenge =
      oracleQuery.trim() === challengeCiphertext;

    const result =
      isKnownChallenge && challengeBit !== null
        ? challengeBit === 0
          ? m0
          : m1
        : '⊥ (simulated decryption failure)';

    setOracleResult(result);
    setMessage(null);

    addEvent('A', 'Queried decryption oracle', oracleQuery);
    addEvent('C', 'Returned decryption result', result);
  };

  const submitGuess = () => {
    if (challengeBit === null) {
      setMessage('Start a challenge before submitting a guess.');
      return;
    }

    if (guess === null) {
      setMessage('Choose b′ = 0 or b′ = 1.');
      return;
    }

    const won = guess === challengeBit;
    const nextRound = rounds.length + 1;
    const nextWins = wins + (won ? 1 : 0);
    const nextAdvantage = getAdvantage(nextWins, nextRound);

    setRounds((current) => [
      ...current,
      {
        round: nextRound,
        won,
        correctGuess: guess,
        actualBit: challengeBit,
        advantage: nextAdvantage,
      },
    ]);

    setPhase('complete');
    setMessage(
      won
        ? `Correct. The Challenger chose b = ${challengeBit}.`
        : `Incorrect. The Challenger chose b = ${challengeBit}.`,
    );

    addEvent(
      'A',
      `Submitted guess b′ = ${guess}`,
      won ? 'Adversary wins this round' : 'Challenger wins this round',
    );
  };

  const runAutomaticDistinguishingRound = () => {
    if (mode === 'EUF-CMA') {
      return;
    }

    const bit = randomBit();
    const selectedMessage = bit === 0 ? m0 : m1;
    const challenge = makeCiphertext(primitive, selectedMessage);

    let adversaryGuess = randomBit();

    if (definition.deterministic) {
      const oracleM0 = makeCiphertext(primitive, m0);

      if (challenge === oracleM0) {
        adversaryGuess = 0;
      } else {
        const oracleM1 = makeCiphertext(primitive, m1);

        if (challenge === oracleM1) {
          adversaryGuess = 1;
        }
      }
    }

    const won = adversaryGuess === bit;
    const nextRound = rounds.length + 1;
    const nextWins = wins + (won ? 1 : 0);
    const nextAdvantage = getAdvantage(nextWins, nextRound);

    setRounds((current) => [
      ...current,
      {
        round: nextRound,
        won,
        correctGuess: adversaryGuess,
        actualBit: bit,
        advantage: nextAdvantage,
      },
    ]);
  };

  const runBatch = () => {
    const remaining = MAX_ROUNDS - rounds.length;

    if (remaining <= 0) {
      setMessage(`The scoreboard already contains ${MAX_ROUNDS} rounds.`);
      return;
    }

    for (let index = 0; index < remaining; index += 1) {
      runAutomaticDistinguishingRound();
    }

    setMessage(
      `Completed ${remaining} additional rounds using the selected primitive's educational adversary strategy.`,
    );
  };

  useEffect(() => {
    if (mode !== 'EUF-CMA') {
      return;
    }

    setPhase('setup');
    setChallengeBit(null);
    setChallengeCiphertext('');
  }, [mode]);

  const submitSigningQuery = () => {
    if (!oracleQuery.trim()) {
      setMessage('Enter a message for the signing oracle.');
      return;
    }

    const alreadyQueried = signedMessages.some(
      (item) => item.message === oracleQuery,
    );

    if (alreadyQueried) {
      setMessage(
        'This message has already been queried. Try a fresh message for the forgery challenge.',
      );
      return;
    }

    const tag = makeAuthenticationTag(oracleQuery);

    setSignedMessages((current) => [
      ...current,
      {
        message: oracleQuery,
        tag,
      },
    ]);

    setOracleResult(tag);
    setMessage(null);

    addEvent('A', 'Queried authentication oracle', oracleQuery);
    addEvent('C', 'Returned authentication tag', tag);
  };

  const submitForgery = () => {
    if (!forgeryMessage.trim() || !forgeryTag.trim()) {
      setMessage('Provide both a new message and a candidate authentication tag.');
      return;
    }

    const queried = signedMessages.some(
      (item) => item.message === forgeryMessage,
    );

    const expectedTag = makeAuthenticationTag(forgeryMessage);

    const validFormat =
      forgeryTag === expectedTag ||
      forgeryTag ===
        `tag_${deterministicFingerprint(
          'hmac-sha256',
          forgeryMessage,
        )}`;

    const won =
      !queried &&
      validFormat &&
      definition.eufCmaSecure === false;

    const nextRound = rounds.length + 1;
    const nextWins = wins + (won ? 1 : 0);
    const nextAdvantage = getAdvantage(nextWins, nextRound);

    setRounds((current) => [
      ...current,
      {
        round: nextRound,
        won,
        correctGuess: won ? 1 : 0,
        actualBit: 0,
        advantage: nextAdvantage,
      },
    ]);

    setPhase('complete');

    setMessage(
      won
        ? 'Forgery accepted in the educational vulnerable model.'
        : 'Forgery rejected. A fresh valid authentication value was not produced.',
    );

    addEvent(
      'A',
      'Submitted forgery',
      `${forgeryMessage} / ${forgeryTag}`,
    );
  };

  const oracleTitle =
    mode === 'EUF-CMA'
      ? 'Authentication Oracle'
      : mode === 'IND-CPA'
        ? 'Encryption Oracle'
        : 'Decryption Oracle';

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <LockKeyhole className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">
                Game configuration
              </p>

              <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">
                Choose the security experiment
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                You are A. The system is C. Your goal is to exploit the
                selected construction only through the oracles allowed by the
                game.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Security game
              </span>

              <select
                value={mode}
                onChange={(event) =>
                  handleModeChange(event.target.value as SecurityMode)
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 outline-none focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              >
                {MODE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Target primitive
              </span>

              <select
                value={primitive}
                onChange={(event) =>
                  handlePrimitiveChange(event.target.value as PrimitiveId)
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 outline-none focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              >
                {PRIMITIVE_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                    disabled={
                      mode === 'EUF-CMA' && option !== 'hmac-sha256'
                    }
                  >
                    {PRIMITIVES[option].name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex items-start gap-3">
              {security.secure ? (
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              )}

              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  {security.title}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {security.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
            <p className="text-sm font-bold text-zinc-900 dark:text-white">
              {modeDefinition.title}
            </p>

            <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {modeDefinition.description}
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-white/70 p-3 dark:bg-zinc-950/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Oracle
                </p>
                <p className="mt-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {modeDefinition.oracle}
                </p>
              </div>

              <div className="rounded-lg bg-white/70 p-3 dark:bg-zinc-950/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Objective
                </p>
                <p className="mt-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {modeDefinition.objective}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-950 p-5 text-zinc-100 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-400">
                Selected primitive
              </p>

              <h2 className="mt-1 text-xl font-bold">
                {definition.name}
              </h2>
            </div>

            <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {definition.category}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            {definition.description}
          </p>

          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Why this matters
            </p>

            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {definition.lesson}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-zinc-800 p-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Randomized
              </p>
              <p className="mt-1 text-sm font-bold">
                {definition.deterministic ? 'No' : 'Yes'}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 p-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Authentication
              </p>
              <p className="mt-1 text-sm font-bold">
                {definition.supportsAuthentication ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {mode !== 'EUF-CMA' ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr_1fr]">
          <div className="rounded-2xl border border-teal-500/20 bg-white p-5 dark:border-teal-500/10 dark:bg-zinc-950/50">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
                A
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  Adversary
                </p>
                <p className="text-[11px] text-zinc-500">
                  You control this side
                </p>
              </div>
            </div>

            {phase === 'setup' || challengeBit === null ? (
              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="message-zero"
                    className="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                  >
                    m₀
                  </label>

                  <input
                    id="message-zero"
                    value={m0}
                    onChange={(event) => setM0(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message-one"
                    className="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                  >
                    m₁
                  </label>

                  <input
                    id="message-one"
                    value={m1}
                    onChange={(event) => setM1(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={submitChallenge}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-teal-400"
                >
                  Submit challenge
                  <Send className="h-4 w-4" />
                </button>

                <p className="text-[11px] leading-relaxed text-zinc-500">
                  The messages must have equal length. The Challenger chooses
                  a secret bit and encrypts exactly one of them.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Challenge ciphertext
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-teal-500">
                    {challengeCiphertext}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-zinc-500">
                    Submit your guess
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setGuess(value)}
                        className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                          guess === value
                            ? 'border-teal-500 bg-teal-500 text-black'
                            : 'border-zinc-200 text-zinc-700 hover:border-teal-500 dark:border-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        b′ = {value}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={submitGuess}
                  disabled={guess === null}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Submit guess
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">
                  Challenger
                </p>
                <h3 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                  Oracle board
                </h3>
              </div>

              <ShieldCheck className="h-5 w-5 text-indigo-500" />
            </div>

            <div className="mt-4 space-y-3">
              {phase !== 'setup' && (
                <div className="rounded-xl border border-indigo-500/20 bg-white p-3 dark:bg-zinc-950">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Challenge
                  </p>

                  <p className="mt-2 font-mono text-xs text-indigo-500">
                    c* = E(k, mᵦ)
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <label
                  htmlFor="oracle-query"
                  className="text-xs font-semibold text-zinc-500 dark:text-zinc-400"
                >
                  {mode === 'IND-CPA'
                    ? 'Encryption oracle query'
                    : 'Decryption oracle query'}
                </label>

                <input
                  id="oracle-query"
                  value={oracleQuery}
                  onChange={(event) => setOracleQuery(event.target.value)}
                  placeholder={
                    mode === 'IND-CPA'
                      ? 'Enter plaintext...'
                      : 'Enter ciphertext...'
                  }
                  className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                />

                <button
                  type="button"
                  onClick={
                    mode === 'IND-CPA'
                      ? queryEncryptionOracle
                      : queryDecryptionOracle
                  }
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/30 px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400"
                >
                  Query {oracleTitle}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                {oracleResult && (
                  <div className="mt-3 rounded-lg bg-zinc-100 p-2.5 dark:bg-zinc-900">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Oracle response
                    </p>
                    <p className="mt-1 break-all font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                      {oracleResult}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {message && (
              <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
                {message}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-500" />
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  Message exchange
                </p>
                <p className="text-[11px] text-zinc-500">
                  Protocol transcript
                </p>
              </div>
            </div>

            <div className="mt-4 max-h-[430px] overflow-y-auto pr-1">
              <Waveform events={events} />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
            <div className="flex items-center gap-3">
              <Send className="h-5 w-5 text-teal-500" />
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white">
                  Signing / Authentication Oracle
                </h3>
                <p className="text-xs text-zinc-500">
                  Ask for valid tags on messages of your choice.
                </p>
              </div>
            </div>

            <input
              value={oracleQuery}
              onChange={(event) => setOracleQuery(event.target.value)}
              placeholder="Message to authenticate..."
              className="mt-5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />

            <button
              type="button"
              onClick={submitSigningQuery}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-teal-400"
            >
              Query oracle
              <ArrowRight className="h-4 w-4" />
            </button>

            {signedMessages.length > 0 && (
              <div className="mt-4 space-y-2">
                {signedMessages.map((item) => (
                  <div
                    key={`${item.message}-${item.tag}`}
                    className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <p className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
                      m = {item.message}
                    </p>
                    <p className="mt-1 break-all font-mono text-[11px] text-teal-500">
                      tag = {item.tag}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white">
                  Forge a fresh message
                </h3>
                <p className="text-xs text-zinc-500">
                  Your message must not have been queried before.
                </p>
              </div>
            </div>

            <input
              value={forgeryMessage}
              onChange={(event) => setForgeryMessage(event.target.value)}
              placeholder="New message..."
              className="mt-5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />

            <input
              value={forgeryTag}
              onChange={(event) => setForgeryTag(event.target.value)}
              placeholder="Candidate tag..."
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />

            <button
              type="button"
              onClick={submitForgery}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-amber-400"
            >
              Submit forgery
              <Trophy className="h-4 w-4" />
            </button>

            {message && (
              <p className="mt-3 rounded-lg border border-zinc-200 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                {message}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <AdvantageGraph rounds={rounds} />

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
            Scoreboard
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                Rounds
              </p>
              <p className="mt-1 text-2xl font-black text-zinc-900 dark:text-white">
                {totalRounds}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                Wins
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-500">
                {wins}
              </p>
            </div>

            <div className="col-span-2 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Empirical Adv(A)
              </p>
              <p className="mt-1 text-3xl font-black text-zinc-900 dark:text-white">
                {(empiricalAdvantage * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <button
              type="button"
              onClick={runBatch}
              disabled={mode === 'EUF-CMA' || rounds.length >= MAX_ROUNDS}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-bold text-zinc-700 transition hover:border-teal-500 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-300 dark:hover:text-teal-400"
            >
              <Activity className="h-4 w-4" />
              Run {MAX_ROUNDS - rounds.length} rounds
            </button>

            <button
              type="button"
              onClick={() => {
                setRounds([]);
                resetRound();
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-bold text-zinc-700 transition hover:border-red-400 hover:text-red-500 dark:border-zinc-800 dark:text-zinc-300"
            >
              <RefreshCw className="h-4 w-4" />
              Reset experiment
            </button>
          </div>
        </div>
      </div>

      {rounds.length > 0 && (
        <div
          className={`rounded-2xl border p-5 ${
            security.secure
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-amber-500/20 bg-amber-500/5'
          }`}
        >
          <div className="flex items-start gap-3">
            {security.secure ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            ) : (
              <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            )}

            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">
                What the experiment demonstrates
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {definition.lesson}
              </p>

              {!security.secure && mode === 'IND-CPA' && definition.deterministic && (
                <p className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Because the construction is deterministic, the adversary can
                  compare an oracle encryption of m₀ or m₁ with c*. This is the
                  core distinguishing attack demonstrated by this game.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}