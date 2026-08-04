/**
 * Cipher Web Worker.
 * Handles heavy cryptographic operations off the main thread with lazy-loaded cipher modules.
 * @see CLAUDE.md
 */


import { encrypt as atbashEncrypt, decrypt as atbashDecrypt } from "../cipher/classical/atbash";
import { encrypt as autokeyEncrypt, decrypt as autokeyDecrypt } from "../cipher/classical/autokey";
import { encrypt as adfgvxEncrypt, decrypt as adfgvxDecrypt } from "../cipher/classical/adfgvx";
import { encrypt as beaufortEncrypt, decrypt as beaufortDecrypt } from "../cipher/classical/beaufort";
import { encrypt as bifidEncrypt, decrypt as bifidDecrypt } from "../cipher/classical/bifid";
import { encrypt as caesarEncrypt, decrypt as caesarDecrypt } from "../cipher/classical/caesar";
import { encrypt as columnarEncrypt, decrypt as columnarDecrypt } from "../cipher/classical/columnar-transposition";
import { encrypt as fourSquareEncrypt, decrypt as fourSquareDecrypt } from "../cipher/classical/four-square";
import { encrypt as hillEncrypt, decrypt as hillDecrypt } from "../cipher/classical/hill";
import { encrypt as nihilistEncrypt, decrypt as nihilistDecrypt } from "../cipher/classical/nihilist";
import { encrypt as playfairEncrypt, decrypt as playfairDecrypt } from "../cipher/classical/playfair";
import { encrypt as polybiusEncrypt, decrypt as polybiusDecrypt } from "../cipher/classical/polybius";
import { encrypt as portaEncrypt, decrypt as portaDecrypt } from "../cipher/classical/porta";
import { encrypt as railfenceEncrypt, decrypt as railfenceDecrypt } from "../cipher/classical/railfence";
import { encrypt as rot13Encrypt, decrypt as rot13Decrypt } from "../cipher/classical/rot13";
import { encrypt as vigenereEncrypt, decrypt as vigenereDecrypt } from "../cipher/classical/vigenere";
import { encrypt as bcryptEncrypt, decrypt as bcryptDecrypt } from "../cipher/hash/bcrypt";
import { encrypt as blake2bEncrypt, decrypt as blake2bDecrypt } from "../cipher/hash/blake2b";
import { encrypt as blake3Encrypt, decrypt as blake3Decrypt } from "../cipher/hash/blake3";
import { encrypt as hmacEncrypt, decrypt as hmacDecrypt } from "../cipher/hash/hmac";
import { encrypt as cmacEncrypt, decrypt as cmacDecrypt } from '../cipher/hash/cmac'
import { encrypt as hkdfEncrypt, decrypt as hkdfDecrypt } from "../cipher/hash/hkdf";
import { encrypt as blake2sEncrypt, decrypt as blake2sDecrypt } from '../cipher/hash/blake2s';
import { encryptSha224, encryptSha384, decrypt as sha2TruncDecrypt } from '../cipher/hash/sha2-truncated'
import { encryptShake128, encryptShake256, decrypt as shakeDecrypt } from '../cipher/hash/shake';
import { encrypt as md4Encrypt, decrypt as md4Decrypt } from '../cipher/hash/md4'
import { encrypt as md5Encrypt, decrypt as md5Decrypt } from "../cipher/hash/md5";
import { encrypt as poly1305Encrypt, decrypt as poly1305Decrypt } from "../cipher/hash/poly1305";
import { encrypt as ripemd160Encrypt, decrypt as ripemd160Decrypt } from "../cipher/hash/ripemd160";
import { encrypt as sha1Encrypt, decrypt as sha1Decrypt } from "../cipher/hash/sha1";
import { encrypt as sha256Encrypt, decrypt as sha256Decrypt } from "../cipher/hash/sha256";
import { encrypt as sm3Encrypt, decrypt as sm3Decrypt } from "../cipher/hash/sm3";
import { encrypt as sha3Encrypt, decrypt as sha3Decrypt } from "../cipher/hash/sha3";
import { encrypt as sha512Encrypt, decrypt as sha512Decrypt } from "../cipher/hash/sha512";
import { encrypt as xxhashEncrypt, decrypt as xxhashDecrypt } from "../cipher/hash/xxhash";
import { encrypt as dsaEncrypt, decrypt as dsaDecrypt } from '../cipher/asymmetric/dsa'
import { encrypt as dhEncrypt, decrypt as dhDecrypt } from "../cipher/asymmetric/dh";
import { encrypt as x448Encrypt, decrypt as x448Decrypt } from '../cipher/asymmetric/x448'
import { encrypt as eccEncrypt, decrypt as eccDecrypt } from "../cipher/asymmetric/ecc";
import { encrypt as schnorrEncrypt, decrypt as schnorrDecrypt } from '../cipher/asymmetric/schnorr';
import { encrypt as elgamalSigEncrypt, decrypt as elgamalSigDecrypt } from '../cipher/asymmetric/elgamal-signature';
import { encrypt as mlDsaEncrypt, decrypt as mlDsaDecrypt } from '../cipher/asymmetric/ml-dsa';
import { encrypt as eciesEncrypt, decrypt as eciesDecrypt } from '../cipher/asymmetric/ecies';
import { encrypt as mlKemEncapsulate, decrypt as mlKemDecapsulate } from '../cipher/asymmetric/ml-kem';
import { encrypt as ecdsaEncrypt, decrypt as ecdsaDecrypt } from "../cipher/asymmetric/ecdsa";
import { encrypt as ed448Encrypt, decrypt as ed448Decrypt } from '../cipher/asymmetric/ed448';
import { encrypt as shamirSplit, decrypt as shamirCombine } from '../cipher/asymmetric/shamir-secret-sharing';
import { encrypt as ed25519Encrypt, decrypt as ed25519Decrypt } from "../cipher/asymmetric/ed25519";
import { encrypt as elgamalEncrypt, decrypt as elgamalDecrypt } from "../cipher/asymmetric/elgamal";
import { encrypt as merkleHellmanEncrypt, decrypt as merkleHellmanDecrypt } from "../cipher/asymmetric/merkle-hellman";
import { encrypt as paillierEncrypt, decrypt as paillierDecrypt } from "../cipher/asymmetric/paillier";
import { encrypt as rabinEncrypt, decrypt as rabinDecrypt } from "../cipher/asymmetric/rabin";
import { encrypt as rsaEncrypt, decrypt as rsaDecrypt } from "../cipher/asymmetric/rsa";
import { encrypt as x25519Encrypt, decrypt as x25519Decrypt } from "../cipher/asymmetric/x25519";
import { encrypt as aesXtsEncrypt, decrypt as aesXtsDecrypt } from '../cipher/symmetric/aes-xts';
import { encrypt as aesEncrypt, decrypt as aesDecrypt } from "../cipher/symmetric/aes";
import { encrypt as aesGcmEncrypt, decrypt as aesGcmDecrypt } from "../cipher/symmetric/aes-gcm";
import { encrypt as camelliaEncrypt, decrypt as camelliaDecrypt } from "../cipher/symmetric/camellia";
import { encrypt as chachaPolyEncrypt, decrypt as chachaPolyDecrypt } from '../cipher/symmetric/chacha20-poly1305';
import { encrypt as speckEncrypt, decrypt as speckDecrypt } from '../cipher/symmetric/speck';
import { encrypt as aesCcmEncrypt, decrypt as aesCcmDecrypt } from '../cipher/symmetric/aes-ccm';
import { encrypt as threefishEncrypt, decrypt as threefishDecrypt } from '../cipher/symmetric/threefish';
import { encrypt as xchacha20Encrypt, decrypt as xchacha20Decrypt } from '../cipher/symmetric/xchacha20'
import { encrypt as gostEncrypt, decrypt as gostDecrypt } from '../cipher/symmetric/gost';
import { encrypt as enigmaEncrypt, decrypt as enigmaDecrypt } from '../cipher/symmetric/enigma';
import { encrypt as xsalsa20Encrypt, decrypt as xsalsa20Decrypt } from '../cipher/symmetric/xsalsa20'
import { encrypt as teaEncrypt, decrypt as teaDecrypt } from '../cipher/symmetric/tea';
import { encrypt as chacha20Encrypt, decrypt as chacha20Decrypt } from "../cipher/symmetric/chacha20";
import { encrypt as desEncrypt, decrypt as desDecrypt } from "../cipher/symmetric/des";
import { encrypt as des3Encrypt, decrypt as des3Decrypt } from "../cipher/symmetric/3des";
import { encrypt as ideaEncrypt, decrypt as ideaDecrypt } from "../cipher/symmetric/idea";
import { encrypt as otpEncrypt, decrypt as otpDecrypt } from "../cipher/symmetric/otp";
import { encrypt as rc4Encrypt, decrypt as rc4Decrypt } from "../cipher/symmetric/rc4";
import { encrypt as rc5Encrypt, decrypt as rc5Decrypt } from "../cipher/symmetric/rc5";
import { encrypt as salsa20Encrypt, decrypt as salsa20Decrypt } from "../cipher/symmetric/salsa20";
import { encrypt as skipjackEncrypt, decrypt as skipjackDecrypt } from "../cipher/symmetric/skipjack";
import { encrypt as xorEncrypt, decrypt as xorDecrypt } from "../cipher/symmetric/xor";
import { encrypt as xteaEncrypt, decrypt as xteaDecrypt } from "../cipher/symmetric/xtea";
import { deriveKey } from "../kdf/pbkdf2";
import { deriveScryptKey } from "../kdf/scrypt";
import { CipherError } from "../utils/errors";
import type { WorkerRequest, WorkerResponse } from "../../types/worker";
import type { CipherResult } from "../cipher/types";

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
    case "trivium": {
      const mod = await import("../cipher/symmetric/trivium");
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
    case "present": {
      const mod = await import("../cipher/symmetric/present");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "simon32": {
      const mod = await import("../cipher/symmetric/simon32");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "tea": {
      const mod = await import("../cipher/symmetric/tea");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "noekeon": {
      const mod = await import("../cipher/symmetric/noekeon");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "lea": {
      const mod = await import("../cipher/symmetric/lea");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "gift": {
      const mod = await import("../cipher/symmetric/gift");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "blowfish": {
      const mod = await import("../cipher/symmetric/blowfish");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "seed": {
      const mod = await import("../cipher/symmetric/seed");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "simon": {
      const mod = await import("../cipher/symmetric/simon");
      return { encrypt: mod.encrypt, decrypt: mod.decrypt };
    }
    case "hc128": {
      const mod = await import("../cipher/symmetric/hc128");
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
    case "skein": {
      const mod = await import("../cipher/hash/skein");
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

