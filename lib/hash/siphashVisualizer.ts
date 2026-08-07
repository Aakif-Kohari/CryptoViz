export interface SipHashOptions {
  cRounds?: number;
  dRounds?: number;
}
export interface SipHashRoundState {
  step: string;
  round: number;
  v0: string;
  v1: string;
  v2: string;
  v3: string;
  messageWord?: string;
  note: string;
}
export interface SipHashResult {
  message: string;
  keyHex: string;
  messageHex: string;
  outputHex: string;
  outputDecimal: string;
  cRounds: number;
  dRounds: number;
  blocks: string[];
  trace: SipHashRoundState[];
}
const MASK_64 = 0xffffffffffffffffn;
const DEFAULT_KEY_HEX = "000102030405060708090A0B0C0D0E0F";
function cleanHex(value: string): string {
  return value.trim().replace(/^0x/i, "").replace(/\s+/g, "").toUpperCase();
}
function safeMessage(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}
function add64(a: bigint, b: bigint): bigint {
  return (a + b) & MASK_64;
}
function rotl64(v: bigint, s: number): bigint {
  const n = BigInt(s);
  return ((v << n) | (v >> (64n - n))) & MASK_64;
}
function xor64(a: bigint, b: bigint): bigint {
  return (a ^ b) & MASK_64;
}
function read64LE(bytes: Uint8Array, off: number): bigint {
  let v = 0n;
  for (let i = 0; i < 8; i++) v |= BigInt(bytes[off + i] ?? 0) << BigInt(i * 8);
  return v & MASK_64;
}
function outHexLE(value: bigint): string {
  const parts: string[] = [];
  for (let i = 0; i < 8; i++)
    parts.push(
      Number((value >> BigInt(i * 8)) & 0xffn)
        .toString(16)
        .toUpperCase()
        .padStart(2, "0"),
    );
  return parts.join("");
}
function toHex64(v: bigint): string {
  return (v & MASK_64).toString(16).toUpperCase().padStart(16, "0");
}
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
    .join("");
}
function hexToBytes(hex: string): Uint8Array {
  const c = cleanHex(hex);
  if (!/^[A-F0-9]*$/.test(c))
    throw new Error("Key must contain only hexadecimal characters.");
  if (c.length % 2 !== 0) throw new Error("Key must contain complete bytes.");
  const out = new Uint8Array(c.length / 2);
  for (let i = 0; i < out.length; i++)
    out[i] = Number.parseInt(c.slice(i * 2, i * 2 + 2), 16);
  return out;
}
export function assertSipHashKeyHex(keyHex: string): string {
  const c = cleanHex(keyHex);
  if (!c) throw new Error("SipHash key is required.");
  if (!/^[A-F0-9]+$/.test(c))
    throw new Error("SipHash key must contain only hexadecimal characters.");
  if (c.length !== 32)
    throw new Error(
      "SipHash key must be exactly 16 bytes / 32 hexadecimal characters.",
    );
  return c;
}
function sipRound(
  state: [bigint, bigint, bigint, bigint],
): [bigint, bigint, bigint, bigint] {
  let [v0, v1, v2, v3] = state;
  v0 = add64(v0, v1);
  v1 = rotl64(v1, 13);
  v1 = xor64(v1, v0);
  v0 = rotl64(v0, 32);
  v2 = add64(v2, v3);
  v3 = rotl64(v3, 16);
  v3 = xor64(v3, v2);
  v0 = add64(v0, v3);
  v3 = rotl64(v3, 21);
  v3 = xor64(v3, v0);
  v2 = add64(v2, v1);
  v1 = rotl64(v1, 17);
  v1 = xor64(v1, v2);
  v2 = rotl64(v2, 32);
  return [v0, v1, v2, v3];
}
function tracePush(
  trace: SipHashRoundState[],
  step: string,
  round: number,
  state: [bigint, bigint, bigint, bigint],
  note: string,
  word?: bigint,
) {
  trace.push({
    step,
    round,
    v0: toHex64(state[0]),
    v1: toHex64(state[1]),
    v2: toHex64(state[2]),
    v3: toHex64(state[3]),
    messageWord: typeof word === "bigint" ? toHex64(word) : undefined,
    note,
  });
}
export function buildSipHashBlocks(messageBytes: Uint8Array): bigint[] {
  const blocks: bigint[] = [];
  const full = Math.floor(messageBytes.length / 8);
  for (let i = 0; i < full; i++) blocks.push(read64LE(messageBytes, i * 8));
  let final = BigInt(messageBytes.length) << 56n;
  const rem = messageBytes.length % 8;
  const off = full * 8;
  for (let i = 0; i < rem; i++)
    final |= BigInt(messageBytes[off + i]) << BigInt(i * 8);
  blocks.push(final & MASK_64);
  return blocks;
}
export function calculateSipHash(
  message: string,
  keyHex = DEFAULT_KEY_HEX,
  options: SipHashOptions = {},
): SipHashResult {
  const cRounds = options.cRounds ?? 2;
  const dRounds = options.dRounds ?? 4;
  if (cRounds < 1 || cRounds > 4)
    throw new Error("SipHash compression rounds must be between 1 and 4.");
  if (dRounds < 1 || dRounds > 8)
    throw new Error("SipHash finalization rounds must be between 1 and 8.");
  const key = assertSipHashKeyHex(keyHex);
  const kb = hexToBytes(key);
  const k0 = read64LE(kb, 0);
  const k1 = read64LE(kb, 8);
  const msg = safeMessage(message);
  const mb = new TextEncoder().encode(msg);
  const blocks = buildSipHashBlocks(mb);
  const trace: SipHashRoundState[] = [];
  let state: [bigint, bigint, bigint, bigint] = [
    xor64(0x736f6d6570736575n, k0),
    xor64(0x646f72616e646f6dn, k1),
    xor64(0x6c7967656e657261n, k0),
    xor64(0x7465646279746573n, k1),
  ];
  tracePush(
    trace,
    "initialization",
    0,
    state,
    "Initialize SipHash state from two 64-bit key words.",
  );
  blocks.forEach((block, i) => {
    state[3] = xor64(state[3], block);
    tracePush(
      trace,
      `block ${i + 1} xor-in`,
      0,
      state,
      "XOR the message word into v3.",
      block,
    );
    for (let r = 1; r <= cRounds; r++) {
      state = sipRound(state);
      tracePush(
        trace,
        `block ${i + 1} compression`,
        r,
        state,
        "Apply one SipRound during compression.",
        block,
      );
    }
    state[0] = xor64(state[0], block);
    tracePush(
      trace,
      `block ${i + 1} xor-out`,
      0,
      state,
      "XOR the same message word out of v0.",
      block,
    );
  });
  state[2] = xor64(state[2], 0xffn);
  tracePush(
    trace,
    "finalization marker",
    0,
    state,
    "XOR 0xff into v2 before final SipRounds.",
  );
  for (let r = 1; r <= dRounds; r++) {
    state = sipRound(state);
    tracePush(trace, "finalization", r, state, "Apply one final SipRound.");
  }
  const out = xor64(xor64(state[0], state[1]), xor64(state[2], state[3]));
  return {
    message: msg,
    keyHex: key,
    messageHex: bytesToHex(mb),
    outputHex: outHexLE(out),
    outputDecimal: out.toString(10),
    cRounds,
    dRounds,
    blocks: blocks.map(toHex64),
    trace,
  };
}
export function getDefaultSipHashKey(): string {
  return DEFAULT_KEY_HEX;
}
export function buildSipHashManualChecklist(): string[] {
  return [
    "Open the SipHash visualizer page.",
    "Change the message and confirm the hash output updates.",
    "Change the 16-byte key and confirm the output changes.",
    "Try invalid key input and confirm a friendly error appears.",
    "Switch compression and finalization round counts.",
    "Confirm the block list and state trace update.",
    "Confirm the page is responsive on desktop, tablet, and mobile widths.",
    "Run the focused SipHash unit tests.",
  ];
}
