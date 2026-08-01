/**
 * Cipher Web Worker.
 * Handles heavy cryptographic operations off the main thread with lazy-loaded cipher modules.
 * @see CLAUDE.md
 */

import { CipherError } from "../utils/errors";
import type { WorkerRequest, WorkerResponse } from "../../types/worker";
import type { CipherResult } from "../cipher/types";
import { deriveKey } from "../kdf/pbkdf2";
import { deriveScryptKey } from "../kdf/scrypt";

type CipherHandler = (input: string, key: string, options?: any) => any;

interface CipherDispatcher {
  encrypt: CipherHandler;
  decrypt: CipherHandler;
}

type WorkerRequestMessage = WorkerRequest | Uint8Array;

async function getDispatcher(cipherId: string): Promise<CipherDispatcher> {
  switch (cipherId) {
    case "caesar": {
      const mod = await import("../cipher/classical/caesar");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "rot13": {
      const mod = await import("../cipher/classical/rot13");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "vigenere": {
      const mod = await import("../cipher/classical/vigenere");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "atbash": {
      const mod = await import("../cipher/classical/atbash");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "playfair": {
      const mod = await import("../cipher/classical/playfair");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "railfence": {
      const mod = await import("../cipher/classical/railfence");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "beaufort": {
      const mod = await import("../cipher/classical/beaufort");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "hill": {
      const mod = await import("../cipher/classical/hill");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "columnar-transposition": {
      const mod = await import("../cipher/classical/columnar-transposition");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "autokey": {
      const mod = await import("../cipher/classical/autokey");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "porta": {
      const mod = await import("../cipher/classical/porta");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "adfgvx": {
      const mod = await import("../cipher/classical/adfgvx");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "bifid": {
      const mod = await import("../cipher/classical/bifid");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "four-square": {
      const mod = await import("../cipher/classical/four-square");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "nihilist": {
      const mod = await import("../cipher/classical/nihilist");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "polybius": {
      const mod = await import("../cipher/classical/polybius");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "xor": {
      const mod = await import("../cipher/symmetric/xor");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "otp": {
      const mod = await import("../cipher/symmetric/otp");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "des": {
      const mod = await import("../cipher/symmetric/des");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "3des": {
      const mod = await import("../cipher/symmetric/3des");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "aes-xts": {
      const mod = await import("../cipher/symmetric/aes-xts");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "aes": {
      const mod = await import("../cipher/symmetric/aes");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "aes-gcm": {
      const mod = await import("../cipher/symmetric/aes-gcm");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "serpent": {
      const mod = await import("../cipher/symmetric/serpent");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "chacha20-poly1305": {
      const mod = await import("../cipher/symmetric/chacha20-poly1305");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "speck": {
      const mod = await import("../cipher/symmetric/speck");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "aes-ccm": {
      const mod = await import("../cipher/symmetric/aes-ccm");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "threefish": {
      const mod = await import("../cipher/symmetric/threefish");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "twofish": {
      const mod = await import("../cipher/symmetric/twofish");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "gost": {
      const mod = await import("../cipher/symmetric/gost");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "rc2": {
      const mod = await import("../cipher/symmetric/rc2");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "enigma": {
      const mod = await import("../cipher/symmetric/enigma");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "rc6": {
      const mod = await import("../cipher/symmetric/rc6");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "xchacha20": {
      const mod = await import("../cipher/symmetric/xchacha20");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "xsalsa20": {
      const mod = await import("../cipher/symmetric/xsalsa20");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "ascon": {
      const mod = await import("../cipher/symmetric/ascon");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "sm4": {
      const mod = await import("../cipher/symmetric/sm4");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "tea": {
      const mod = await import("../cipher/symmetric/tea");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "lea": {
      const mod = await import("../cipher/symmetric/lea");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "blowfish": {
      const mod = await import("../cipher/symmetric/blowfish");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "simon": {
      const mod = await import("../cipher/symmetric/simon");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "rsa": {
      const mod = await import("../cipher/asymmetric/rsa");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "dsa": {
      const mod = await import("../cipher/asymmetric/dsa");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "dh": {
      const mod = await import("../cipher/asymmetric/dh");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "x448": {
      const mod = await import("../cipher/asymmetric/x448");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "ecc": {
      const mod = await import("../cipher/asymmetric/ecc");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "schnorr": {
      const mod = await import("../cipher/asymmetric/schnorr");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "elgamal-signature": {
      const mod = await import("../cipher/asymmetric/elgamal-signature");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "ml-dsa": {
      const mod = await import("../cipher/asymmetric/ml-dsa");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "ecies": {
      const mod = await import("../cipher/asymmetric/ecies");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "ml-kem": {
      const mod = await import("../cipher/asymmetric/ml-kem");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "ecdsa": {
      const mod = await import("../cipher/asymmetric/ecdsa");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "ed448": {
      const mod = await import("../cipher/asymmetric/ed448");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "shamir-secret-sharing": {
      const mod = await import("../cipher/asymmetric/shamir-secret-sharing");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "ed25519": {
      const mod = await import("../cipher/asymmetric/ed25519");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "elgamal": {
      const mod = await import("../cipher/asymmetric/elgamal");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "merkle-hellman": {
      const mod = await import("../cipher/asymmetric/merkle-hellman");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "paillier": {
      const mod = await import("../cipher/asymmetric/paillier");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "rabin": {
      const mod = await import("../cipher/asymmetric/rabin");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "x25519": {
      const mod = await import("../cipher/asymmetric/x25519");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "sha256": {
      const mod = await import("../cipher/hash/sha256");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "sm3": {
      const mod = await import("../cipher/hash/sm3");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "sha512": {
      const mod = await import("../cipher/hash/sha512");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "md5": {
      const mod = await import("../cipher/hash/md5");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "hmac": {
      const mod = await import("../cipher/hash/hmac");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "cmac": {
      const mod = await import("../cipher/hash/cmac");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "bcrypt": {
      const mod = await import("../cipher/hash/bcrypt");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "xxhash": {
      const mod = await import("../cipher/hash/xxhash");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "sha3": {
      const mod = await import("../cipher/hash/sha3");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "ripemd160": {
      const mod = await import("../cipher/hash/ripemd160");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "blake2b": {
      const mod = await import("../cipher/hash/blake2b");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "blake3": {
      const mod = await import("../cipher/hash/blake3");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "poly1305": {
      const mod = await import("../cipher/hash/poly1305");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "sha1": {
      const mod = await import("../cipher/hash/sha1");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "hkdf": {
      const mod = await import("../cipher/hash/hkdf");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "blake2s": {
      const mod = await import("../cipher/hash/blake2s");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "sha224": {
      const mod = await import("../cipher/hash/sha2-truncated");
      return { encrypt: mod.encryptSha224, decrypt: mod.decrypt };
    }
    case "sha384": {
      const mod = await import("../cipher/hash/sha2-truncated");
      return { encrypt: mod.encryptSha384, decrypt: mod.decrypt };
    }
    case "shake128": {
      const mod = await import("../cipher/hash/shake");
      return { encrypt: mod.encryptShake128, decrypt: mod.decrypt };
    }
    case "shake256": {
      const mod = await import("../cipher/hash/shake");
      return { encrypt: mod.encryptShake256, decrypt: mod.decrypt };
    }
    case "md4": {
      const mod = await import("../cipher/hash/md4");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "pbkdf2": {
      return {
        encrypt: (input, _key, options) => deriveKey(input, {
          iterations: typeof options?.iterations === "number" ? options.iterations : 10000,
          hash: (options?.hash ?? "SHA-256") as "SHA-256" | "SHA-512",
          keyLength: typeof options?.keyLength === "number" ? options.keyLength : 32,
          salt: typeof options?.salt === "string" ? options.salt : undefined,
        }),
        decrypt: (input, _key, options) => deriveKey(input, {
          iterations: typeof options?.iterations === "number" ? options.iterations : 10000,
          hash: (options?.hash ?? "SHA-256") as "SHA-256" | "SHA-512",
          keyLength: typeof options?.keyLength === "number" ? options.keyLength : 32,
          salt: typeof options?.salt === "string" ? options.salt : undefined,
        }),
      };
    }
    case "scrypt": {
      return {
        encrypt: (input, _key, options) => deriveScryptKey(input, {
          N: typeof options?.N === "number" ? options.N : 16384,
          r: typeof options?.r === "number" ? options.r : 8,
          p: typeof options?.p === "number" ? options.p : 1,
          dkLen: typeof options?.dkLen === "number" ? options.dkLen : 32,
          salt: typeof options?.salt === "string" ? options.salt : undefined,
        }),
        decrypt: (input, _key, options) => deriveScryptKey(input, {
          N: typeof options?.N === "number" ? options.N : 16384,
          r: typeof options?.r === "number" ? options.r : 8,
          p: typeof options?.p === "number" ? options.p : 1,
          dkLen: typeof options?.dkLen === "number" ? options.dkLen : 32,
          salt: typeof options?.salt === "string" ? options.salt : undefined,
        }),
      };
    }
    case "rc4": {
      const mod = await import("../cipher/symmetric/rc4");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "salsa20": {
      const mod = await import("../cipher/symmetric/salsa20");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "skipjack": {
      const mod = await import("../cipher/symmetric/skipjack");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "chacha20": {
      const mod = await import("../cipher/symmetric/chacha20");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "rc5": {
      const mod = await import("../cipher/symmetric/rc5");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "xtea": {
      const mod = await import("../cipher/symmetric/xtea");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "rc6": {
      const mod = await import("../cipher/symmetric/rc6");
      return { encrypt: mod.encryptRc6Block, decrypt: mod.decryptRc6Block };
    }
    case "camellia": {
      const mod = await import("../cipher/symmetric/camellia");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "idea": {
      const mod = await import("../cipher/symmetric/idea");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    default:
      throw new Error(`Unsupported cipher ID: ${cipherId}`);
  }
}

const workerScope = self as unknown as Worker & typeof globalThis;

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
    const encryptMode = type === "encrypt";
    const dispatcher = await getDispatcher(cipherId);
    const handler = encryptMode ? dispatcher.encrypt : dispatcher.decrypt;
    let result: unknown = handler(input, key, options);

    result = await result;

    const durationMs = performance.now() - startTime;
    const response: WorkerResponse = {
      requestId,
      success: true,
      payload: { result: result as CipherResult },
      timings: { durationMs },
    };
    workerScope.postMessage(response);
  } catch (error: unknown) {
    const durationMs = performance.now() - startTime;

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
        error: errorMessage,
        errorCode,
        errorMessage,
      },
      timings: { durationMs },
    };
    workerScope.postMessage(response);
  }
});

