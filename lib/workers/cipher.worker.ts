/**
 * Cipher Web Worker.
 * Handles heavy cryptographic operations off the main thread with lazy-loaded cipher modules.
 * @see CLAUDE.md
 */

import { CipherError } from "../utils/errors";
import type { WorkerRequest, WorkerResponse } from "../../types/worker";

type CipherModule = Record<string, any>;
type CipherLoader = () => Promise<CipherModule>;

const cipherLoaders: Record<string, CipherLoader> = {
  // Classical
  atbash: () => import("../cipher/classical/atbash"),
  autokey: () => import("../cipher/classical/autokey"),
  adfgvx: () => import("../cipher/classical/adfgvx"),
  beaufort: () => import("../cipher/classical/beaufort"),
  bifid: () => import("../cipher/classical/bifid"),
  caesar: () => import("../cipher/classical/caesar"),
  "columnar-transposition": () => import("../cipher/classical/columnar-transposition"),
  "four-square": () => import("../cipher/classical/four-square"),
  hill: () => import("../cipher/classical/hill"),
  nihilist: () => import("../cipher/classical/nihilist"),
  playfair: () => import("../cipher/classical/playfair"),
  polybius: () => import("../cipher/classical/polybius"),
  porta: () => import("../cipher/classical/porta"),
  railfence: () => import("../cipher/classical/railfence"),
  rot13: () => import("../cipher/classical/rot13"),
  vigenere: () => import("../cipher/classical/vigenere"),

  // Hashes & MACs
  bcrypt: () => import("../cipher/hash/bcrypt"),
  blake2b: () => import("../cipher/hash/blake2b"),
  blake2s: () => import("../cipher/hash/blake2s"),
  blake3: () => import("../cipher/hash/blake3"),
  cmac: () => import("../cipher/hash/cmac"),
  hkdf: () => import("../cipher/hash/hkdf"),
  hmac: () => import("../cipher/hash/hmac"),
  md4: () => import("../cipher/hash/md4"),
  md5: () => import("../cipher/hash/md5"),
  poly1305: () => import("../cipher/hash/poly1305"),
  ripemd160: () => import("../cipher/hash/ripemd160"),
  sha1: () => import("../cipher/hash/sha1"),
  sha256: () => import("../cipher/hash/sha256"),
  sha512: () => import("../cipher/hash/sha512"),
  sha3: () => import("../cipher/hash/sha3"),
  sm3: () => import("../cipher/hash/sm3"),
  xxhash: () => import("../cipher/hash/xxhash"),
  sha224: () => import("../cipher/hash/sha2-truncated"),
  sha384: () => import("../cipher/hash/sha2-truncated"),
  shake128: () => import("../cipher/hash/shake"),
  shake256: () => import("../cipher/hash/shake"),

  // Asymmetric
  dh: () => import("../cipher/asymmetric/dh"),
  dsa: () => import("../cipher/asymmetric/dsa"),
  ecc: () => import("../cipher/asymmetric/ecc"),
  ecdsa: () => import("../cipher/asymmetric/ecdsa"),
  ecies: () => import("../cipher/asymmetric/ecies"),
  ed25519: () => import("../cipher/asymmetric/ed25519"),
  ed448: () => import("../cipher/asymmetric/ed448"),
  elgamal: () => import("../cipher/asymmetric/elgamal"),
  "elgamal-signature": () => import("../cipher/asymmetric/elgamal-signature"),
  "merkle-hellman": () => import("../cipher/asymmetric/merkle-hellman"),
  "ml-dsa": () => import("../cipher/asymmetric/ml-dsa"),
  "ml-kem": () => import("../cipher/asymmetric/ml-kem"),
  paillier: () => import("../cipher/asymmetric/paillier"),
  rabin: () => import("../cipher/asymmetric/rabin"),
  rsa: () => import("../cipher/asymmetric/rsa"),
  schnorr: () => import("../cipher/asymmetric/schnorr"),
  "shamir-secret-sharing": () => import("../cipher/asymmetric/shamir-secret-sharing"),
  x25519: () => import("../cipher/asymmetric/x25519"),
  x448: () => import("../cipher/asymmetric/x448"),

  // Symmetric
  "3des": () => import("../cipher/symmetric/3des"),
  aes: () => import("../cipher/symmetric/aes"),
  "aes-ccm": () => import("../cipher/symmetric/aes-ccm"),
  "aes-gcm": () => import("../cipher/symmetric/aes-gcm"),
  "aes-xts": () => import("../cipher/symmetric/aes-xts"),
  ascon: () => import("../cipher/symmetric/ascon"),
  blowfish: () => import("../cipher/symmetric/blowfish"),
  camellia: () => import("../cipher/symmetric/camellia"),
  chacha20: () => import("../cipher/symmetric/chacha20"),
  "chacha20-poly1305": () => import("../cipher/symmetric/chacha20-poly1305"),
  des: () => import("../cipher/symmetric/des"),
  enigma: () => import("../cipher/symmetric/enigma"),
  gost: () => import("../cipher/symmetric/gost"),
  idea: () => import("../cipher/symmetric/idea"),
  otp: () => import("../cipher/symmetric/otp"),
  rc2: () => import("../cipher/symmetric/rc2"),
  rc4: () => import("../cipher/symmetric/rc4"),
  rc5: () => import("../cipher/symmetric/rc5"),
  rc6: () => import("../cipher/symmetric/rc6"),
  salsa20: () => import("../cipher/symmetric/salsa20"),
  serpent: () => import("../cipher/symmetric/serpent"),
  skipjack: () => import("../cipher/symmetric/skipjack"),
  sm4: () => import("../cipher/symmetric/sm4"),
  speck: () => import("../cipher/symmetric/speck"),
  tea: () => import("../cipher/symmetric/tea"),
  threefish: () => import("../cipher/symmetric/threefish"),
  twofish: () => import("../cipher/symmetric/twofish"),
  xchacha20: () => import("../cipher/symmetric/xchacha20"),
  xor: () => import("../cipher/symmetric/xor"),
  xsalsa20: () => import("../cipher/symmetric/xsalsa20"),
  xtea: () => import("../cipher/symmetric/xtea"),

  // KDF
  pbkdf2: () => import("../kdf/pbkdf2"),
  scrypt: () => import("../kdf/scrypt"),
};

const moduleCache = new Map<string, CipherModule>();

async function getCipherModule(cipherId: string): Promise<CipherModule> {
  if (moduleCache.has(cipherId)) {
    return moduleCache.get(cipherId)!;
  }
  const loader = cipherLoaders[cipherId];
  if (!loader) {
    throw new Error(`Unsupported cipher ID: ${cipherId}`);
  }
  const mod = await loader();
  moduleCache.set(cipherId, mod);
  return mod;
}

type WorkerRequestMessage = WorkerRequest | Uint8Array;

const workerScope = self as unknown as Worker;

workerScope.addEventListener("message", async (event: MessageEvent<WorkerRequestMessage>) => {
  const startTime = performance.now();
  let requestData: WorkerRequestMessage = event.data;

  if (requestData instanceof Uint8Array) {
    const decoder = new TextDecoder();
    requestData = JSON.parse(decoder.decode(requestData)) as WorkerRequest;
  }
  const { type, requestId, payload } = requestData as WorkerRequest;
  const { cipherId, input, key, options } = payload;

  try {
    let result: unknown;
    const encryptMode = type === "encrypt";
    const mod = await getCipherModule(cipherId);

    if (cipherId === "sha224") {
      result = encryptMode ? mod.encryptSha224(input, key, options) : mod.sha2TruncDecrypt(input, key, options);
    } else if (cipherId === "sha384") {
      result = encryptMode ? mod.encryptSha384(input, key, options) : mod.sha2TruncDecrypt(input, key, options);
    } else if (cipherId === "shake128") {
      result = encryptMode ? mod.encryptShake128(input, key, options) : mod.shakeDecrypt(input, key, options);
    } else if (cipherId === "shake256") {
      result = encryptMode ? mod.encryptShake256(input, key, options) : mod.shakeDecrypt(input, key, options);
    } else if (cipherId === "pbkdf2") {
      result = await mod.deriveKey(input, {
        iterations: options?.iterations ?? 10000,
        hash: options?.hash ?? "SHA-256",
        keyLength: options?.keyLength ?? 32,
        salt: options?.salt,
      });
    } else if (cipherId === "scrypt") {
      result = await mod.deriveScryptKey(input, {
        N: options?.N ?? 16384,
        r: options?.r ?? 8,
        p: options?.p ?? 1,
        dkLen: options?.dkLen ?? 32,
        salt: options?.salt,
      });
    } else {
      const fn = encryptMode ? mod.encrypt : mod.decrypt;
      if (typeof fn !== "function") {
        throw new Error(`Unsupported operation '${type}' for cipher ID '${cipherId}'`);
      }
      result = fn(input, key, options);
    }

    // Some cipher implementations (e.g. RSA real mode via WebCrypto) are async
    // and return a Promise; awaiting a plain value is a no-op for the rest.
    result = await result;

    const durationMs = performance.now() - startTime;
    const response: WorkerResponse = {
      requestId,
      success: true,
      payload: { result: result as any },
      timings: { durationMs },
    };
    workerScope.postMessage(response);
  } catch (error: unknown) {
    const durationMs = performance.now() - startTime;

    // If cipher code throws CipherError, preserve its stable error code.
    let errorCode: import("@/lib/utils/errors").CipherErrorCode | undefined;
    let errorMessage: string;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }

    if (error instanceof CipherError) {
      errorCode = error.code;
      errorMessage = error.message;
    }

    const response: WorkerResponse = {
      requestId,
      success: false,
      payload: {
        error: errorMessage, // legacy
        errorCode,
        errorMessage,
      },
      timings: { durationMs },
    };
    workerScope.postMessage(response);
  }
});

