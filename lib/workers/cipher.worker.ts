/**
 * Cipher Web Worker.
 * Handles heavy cryptographic operations off the main thread with lazy-loaded cipher modules.
 * @see CLAUDE.md
 */

import { CipherError } from "../utils/errors";
import type { WorkerRequest, WorkerResponse } from "../../types/worker";
import type { CipherResult } from "../cipher/types";

type CipherHandler = (input: string, key: string, options?: any) => any;

interface CipherDispatcher {
  encrypt: CipherHandler;
  decrypt: CipherHandler;
}

const DISPATCHER_REGISTRY: Record<string, CipherDispatcher> = {
  caesar: { encrypt: caesarEncrypt, decrypt: caesarDecrypt },
  rot13: { encrypt: rot13Encrypt, decrypt: rot13Decrypt },
  vigenere: { encrypt: vigenereEncrypt, decrypt: vigenereDecrypt },
  atbash: { encrypt: atbashEncrypt, decrypt: atbashDecrypt },
  playfair: { encrypt: playfairEncrypt, decrypt: playfairDecrypt },
  railfence: { encrypt: railfenceEncrypt, decrypt: railfenceDecrypt },
  beaufort: { encrypt: beaufortEncrypt, decrypt: beaufortDecrypt },
  hill: { encrypt: hillEncrypt, decrypt: hillDecrypt },
  "columnar-transposition": { encrypt: columnarEncrypt, decrypt: columnarDecrypt },
  autokey: { encrypt: autokeyEncrypt, decrypt: autokeyDecrypt },
  porta: { encrypt: portaEncrypt, decrypt: portaDecrypt },
  adfgvx: { encrypt: adfgvxEncrypt, decrypt: adfgvxDecrypt },
  bifid: { encrypt: bifidEncrypt, decrypt: bifidDecrypt },
  "four-square": { encrypt: fourSquareEncrypt, decrypt: fourSquareDecrypt },
  nihilist: { encrypt: nihilistEncrypt, decrypt: nihilistDecrypt },
  polybius: { encrypt: polybiusEncrypt, decrypt: polybiusDecrypt },
  xor: { encrypt: xorEncrypt, decrypt: xorDecrypt },
  otp: { encrypt: otpEncrypt, decrypt: otpDecrypt },
  des: { encrypt: desEncrypt, decrypt: desDecrypt },
  "3des": { encrypt: des3Encrypt, decrypt: des3Decrypt },
  "aes-xts": { encrypt: aesXtsEncrypt, decrypt: aesXtsDecrypt },
  aes: { encrypt: aesEncrypt, decrypt: aesDecrypt },
  "aes-gcm": { encrypt: aesGcmEncrypt, decrypt: aesGcmDecrypt },
  serpent: { encrypt: serpentEncrypt, decrypt: serpentDecrypt },
  "chacha20-poly1305": { encrypt: chachaPolyEncrypt, decrypt: chachaPolyDecrypt },
  speck: { encrypt: speckEncrypt, decrypt: speckDecrypt },
  "aes-ccm": { encrypt: aesCcmEncrypt, decrypt: aesCcmDecrypt },
  threefish: { encrypt: threefishEncrypt, decrypt: threefishDecrypt },
  gost: { encrypt: gostEncrypt, decrypt: gostDecrypt },
  enigma: { encrypt: enigmaEncrypt, decrypt: enigmaDecrypt },
  xchacha20: { encrypt: xchacha20Encrypt, decrypt: xchacha20Decrypt },
  xsalsa20: { encrypt: xsalsa20Encrypt, decrypt: xsalsa20Decrypt },
  sm4: { encrypt: sm4Encrypt, decrypt: sm4Decrypt },
  tea: { encrypt: teaEncrypt, decrypt: teaDecrypt },
  blowfish: { encrypt: blowfishEncrypt, decrypt: blowfishDecrypt },
  rsa: { encrypt: rsaEncrypt, decrypt: rsaDecrypt },
  dsa: { encrypt: dsaEncrypt, decrypt: dsaDecrypt },
  dh: { encrypt: dhEncrypt, decrypt: dhDecrypt },
  x448: { encrypt: x448Encrypt, decrypt: x448Decrypt },
  ecc: { encrypt: eccEncrypt, decrypt: eccDecrypt },
  schnorr: { encrypt: schnorrEncrypt, decrypt: schnorrDecrypt },
  "elgamal-signature": { encrypt: elgamalSigEncrypt, decrypt: elgamalSigDecrypt },
  "ml-dsa": { encrypt: mlDsaEncrypt, decrypt: mlDsaDecrypt },
  ecies: { encrypt: eciesEncrypt, decrypt: eciesDecrypt },
  "ml-kem": { encrypt: mlKemEncapsulate, decrypt: mlKemDecapsulate },
  ecdsa: { encrypt: ecdsaEncrypt, decrypt: ecdsaDecrypt },
  ed448: { encrypt: ed448Encrypt, decrypt: ed448Decrypt },
  "shamir-secret-sharing": { encrypt: shamirSplit, decrypt: shamirCombine },
  ed25519: { encrypt: ed25519Encrypt, decrypt: ed25519Decrypt },
  elgamal: { encrypt: elgamalEncrypt, decrypt: elgamalDecrypt },
  "merkle-hellman": { encrypt: merkleHellmanEncrypt, decrypt: merkleHellmanDecrypt },
  paillier: { encrypt: paillierEncrypt, decrypt: paillierDecrypt },
  rabin: { encrypt: rabinEncrypt, decrypt: rabinDecrypt },
  x25519: { encrypt: x25519Encrypt, decrypt: x25519Decrypt },
  sha256: { encrypt: sha256Encrypt, decrypt: sha256Decrypt },
  sm3: { encrypt: sm3Encrypt, decrypt: sm3Decrypt },
  sha512: { encrypt: sha512Encrypt, decrypt: sha512Decrypt },
  md5: { encrypt: md5Encrypt, decrypt: md5Decrypt },
  hmac: { encrypt: hmacEncrypt, decrypt: hmacDecrypt },
  cmac: { encrypt: cmacEncrypt, decrypt: cmacDecrypt },
  bcrypt: { encrypt: bcryptEncrypt, decrypt: bcryptDecrypt },
  xxhash: { encrypt: xxhashEncrypt, decrypt: xxhashDecrypt },
  sha3: { encrypt: sha3Encrypt, decrypt: sha3Decrypt },
  ripemd160: { encrypt: ripemd160Encrypt, decrypt: ripemd160Decrypt },
  blake2b: { encrypt: blake2bEncrypt, decrypt: blake2bDecrypt },
  blake3: { encrypt: blake3Encrypt, decrypt: blake3Decrypt },
  poly1305: { encrypt: poly1305Encrypt, decrypt: poly1305Decrypt },
  sha1: { encrypt: sha1Encrypt, decrypt: sha1Decrypt },
  hkdf: { encrypt: hkdfEncrypt, decrypt: hkdfDecrypt },
  blake2s: { encrypt: blake2sEncrypt, decrypt: blake2sDecrypt },
  sha224: { encrypt: encryptSha224, decrypt: sha2TruncDecrypt },
  sha384: { encrypt: encryptSha384, decrypt: sha2TruncDecrypt },
  shake128: { encrypt: encryptShake128, decrypt: shakeDecrypt },
  shake256: { encrypt: encryptShake256, decrypt: shakeDecrypt },
  md4: { encrypt: md4Encrypt, decrypt: md4Decrypt },
  pbkdf2: {
    encrypt: (input, _key, options) => deriveKey(input, {
      iterations: options?.iterations ?? 10000,
      hash: options?.hash ?? "SHA-256",
      keyLength: options?.keyLength ?? 32,
      salt: options?.salt,
    }),
    decrypt: (input, _key, options) => deriveKey(input, {
      iterations: options?.iterations ?? 10000,
      hash: options?.hash ?? "SHA-256",
      keyLength: options?.keyLength ?? 32,
      salt: options?.salt,
    }),
  },
  scrypt: {
    encrypt: (input, _key, options) => deriveScryptKey(input, {
      N: options?.N ?? 16384,
      r: options?.r ?? 8,
      p: options?.p ?? 1,
      dkLen: options?.dkLen ?? 32,
      salt: options?.salt,
    }),
    decrypt: (input, _key, options) => deriveScryptKey(input, {
      N: options?.N ?? 16384,
      r: options?.r ?? 8,
      p: options?.p ?? 1,
      dkLen: options?.dkLen ?? 32,
      salt: options?.salt,
    }),
  },
  rc4: { encrypt: rc4Encrypt, decrypt: rc4Decrypt },
  salsa20: { encrypt: salsa20Encrypt, decrypt: salsa20Decrypt },
  skipjack: { encrypt: skipjackEncrypt, decrypt: skipjackDecrypt },
  chacha20: { encrypt: chacha20Encrypt, decrypt: chacha20Decrypt },
  rc5: { encrypt: rc5Encrypt, decrypt: rc5Decrypt },
  xtea: { encrypt: xteaEncrypt, decrypt: xteaDecrypt },
  rc6: { encrypt: rc6Encrypt, decrypt: rc6Decrypt },
  camellia: { encrypt: camelliaEncrypt, decrypt: camelliaDecrypt },
  idea: { encrypt: ideaEncrypt, decrypt: ideaDecrypt },
};

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
    const dispatcher = DISPATCHER_REGISTRY[cipherId];
    if (!dispatcher) {
      throw new Error(`Unsupported cipher ID: ${cipherId}`);

    switch (cipherId) {
      case "caesar":
        result = encryptMode ? caesarEncrypt(input, key, options) : caesarDecrypt(input, key, options);
        break;
      case "rot13":
        result = encryptMode ? rot13Encrypt(input, key, options) : rot13Decrypt(input, key, options);
        break;
      case "vigenere":
        result = encryptMode ? vigenereEncrypt(input, key, options) : vigenereDecrypt(input, key, options);
        break;
      case "atbash":
        result = encryptMode ? atbashEncrypt(input, key, options) : atbashDecrypt(input, key, options);
        break;
      case "playfair":
        result = encryptMode ? playfairEncrypt(input, key, options) : playfairDecrypt(input, key, options);
        break;
      case "railfence":
        result = encryptMode ? railfenceEncrypt(input, key, options) : railfenceDecrypt(input, key, options);
        break;
      case "beaufort":
        result = encryptMode ? beaufortEncrypt(input, key, options) : beaufortDecrypt(input, key, options);
        break;
      case "hill":
        result = encryptMode ? hillEncrypt(input, key, options) : hillDecrypt(input, key, options);
        break;
      case "columnar-transposition":
        result = encryptMode ? columnarEncrypt(input, key, options) : columnarDecrypt(input, key, options);
        break;
      case "autokey":
        result = encryptMode ? autokeyEncrypt(input, key, options) : autokeyDecrypt(input, key, options);
        break;
      case "porta":
        result = encryptMode ? portaEncrypt(input, key, options) : portaDecrypt(input, key, options);
        break;
      case "adfgvx":
        result = encryptMode ? adfgvxEncrypt(input, key, options) : adfgvxDecrypt(input, key, options);
        break;
      case "bifid":
        result = encryptMode ? bifidEncrypt(input, key, options) : bifidDecrypt(input, key, options);
        break;
      case "four-square":
        result = encryptMode ? fourSquareEncrypt(input, key, options) : fourSquareDecrypt(input, key, options);
        break;
      case "nihilist":
        result = encryptMode ? nihilistEncrypt(input, key, options) : nihilistDecrypt(input, key, options);
        break;
      case "polybius":
        result = encryptMode ? polybiusEncrypt(input, key, options) : polybiusDecrypt(input, key, options);
        break;
      case "xor":
        result = encryptMode ? xorEncrypt(input, key, options) : xorDecrypt(input, key, options);
        break;
      case "otp":
        result = encryptMode ? otpEncrypt(input, key, options) : otpDecrypt(input, key, options);
        break;
      case "des":
        result = encryptMode ? desEncrypt(input, key, options) : desDecrypt(input, key, options);
        break;
      case "3des":
        result = encryptMode ? des3Encrypt(input, key, options) : des3Decrypt(input, key, options);
        break;
      case 'aes-xts':
        result = encryptMode ? aesXtsEncrypt(input, key, options) : aesXtsDecrypt(input, key, options)
        break
      case "aes":
        result = encryptMode ? aesEncrypt(input, key, options) : aesDecrypt(input, key, options);
        break;
      case "aes-gcm":
        result = encryptMode ? aesGcmEncrypt(input, key, options) : aesGcmDecrypt(input, key, options);
        break;
      case 'serpent':
        result = encryptMode ? serpentEncrypt(input, key, options) : serpentDecrypt(input, key, options)
        break
      case 'chacha20-poly1305':
        result = encryptMode ? chachaPolyEncrypt(input, key, options) : chachaPolyDecrypt(input, key, options)
        break
      case 'speck':
        result = encryptMode ? speckEncrypt(input, key, options) : speckDecrypt(input, key, options)
        break
      case 'aes-ccm':
        result = encryptMode ? aesCcmEncrypt(input, key, options) : aesCcmDecrypt(input, key, options)
        break
      case 'threefish':
        result = encryptMode ? threefishEncrypt(input, key, options) : threefishDecrypt(input, key, options)
        break
      case 'twofish':
        result = encryptMode ? twofishEncrypt(input, key, options) : twofishDecrypt(input, key, options)
        break
      case 'gost':
        result = encryptMode ? gostEncrypt(input, key, options) : gostDecrypt(input, key, options)
        break
      case 'rc2':
        result = encryptMode ? rc2Encrypt(input, key, options) : rc2Decrypt(input, key, options)
        break
      case 'enigma':
        result = encryptMode ? enigmaEncrypt(input, key, options) : enigmaDecrypt(input, key, options)
        break
      case 'xchacha20':
        result = encryptMode ? xchacha20Encrypt(input, key, options) : xchacha20Decrypt(input, key, options)
        break
      case 'xsalsa20':
        result = encryptMode ? xsalsa20Encrypt(input, key, options) : xsalsa20Decrypt(input, key, options)
        break
      case 'ascon':
        result = encryptMode ? asconEncypt(input, key, options) : asconDecrypt(input, key, options)
      case 'sm4':
        result = encryptMode ? sm4Encrypt(input, key, options) : sm4Decrypt(input, key, options)
        break
      case 'tea':
        result = encryptMode ? teaEncrypt(input, key, options) : teaDecrypt(input, key, options)
        break
      case 'blowfish':
        result = encryptMode ? blowfishEncrypt(input, key, options) : blowfishDecrypt(input, key, options);
        break
        break
      case "rsa":
        result = encryptMode ? rsaEncrypt(input, key, options) : rsaDecrypt(input, key, options);
        break;
      case 'dsa':
        result = encryptMode ? dsaEncrypt(input, key, options) : dsaDecrypt(input, key, options)
        break
      case "dh":
        result = encryptMode ? dhEncrypt(input, key, options) : dhDecrypt(input, key, options);
        break;
      case 'x448':
        result = encryptMode ? x448Encrypt(input, key, options) : x448Decrypt(input, key, options)
        break
      case "ecc":
        result = encryptMode ? eccEncrypt(input, key, options) : eccDecrypt(input, key, options);
        break;
      case 'schnorr':
        result = encryptMode ? schnorrEncrypt(input, key, options) : schnorrDecrypt(input, key, options)
        break
      case 'elgamal-signature':
        result = encryptMode ? elgamalSigEncrypt(input, key, options) : elgamalSigDecrypt(input, key, options)
        break
      case 'ml-dsa':
        result = encryptMode ? mlDsaEncrypt(input, key, options) : mlDsaDecrypt(input, key, options)
        break
      case 'ecies':
        result = encryptMode ? eciesEncrypt(input, key, options) : eciesDecrypt(input, key, options)
        break
      case 'ml-kem':
        result = encryptMode ? mlKemEncapsulate(input, key, options) : mlKemDecapsulate(input, key, options)
        break
      case "ecdsa":
        result = encryptMode ? ecdsaEncrypt(input, key, options) : ecdsaDecrypt(input, key, options);
        break;
      case 'ed448':
        result = encryptMode ? ed448Encrypt(input, key, options) : ed448Decrypt(input, key, options)
        break
      case 'shamir-secret-sharing':
        result = encryptMode ? shamirSplit(input, key, options) : shamirCombine(input, key, options)
        break
      case "ed25519":
        result = encryptMode ? ed25519Encrypt(input, key, options) : ed25519Decrypt(input, key, options);
        break;
      case "elgamal":
        result = encryptMode ? elgamalEncrypt(input, key, options) : elgamalDecrypt(input, key, options);
        break;
      case "merkle-hellman":
        result = encryptMode ? merkleHellmanEncrypt(input, key, options) : merkleHellmanDecrypt(input, key, options);
        break;
      case "paillier":
        result = encryptMode ? paillierEncrypt(input, key, options) : paillierDecrypt(input, key, options);
        break;
      case "rabin":
        result = encryptMode ? rabinEncrypt(input, key, options) : rabinDecrypt(input, key, options);
        break;
      case "x25519":
        result = encryptMode ? x25519Encrypt(input, key, options) : x25519Decrypt(input, key, options);
        break;
      case "sha256":
        result = encryptMode ? sha256Encrypt(input, key, options) : sha256Decrypt(input, key, options);
        break;
      case "sm3":
        result = encryptMode ? sm3Encrypt(input, key, options) : sm3Decrypt(input, key, options);
        break;
      case "sha512":
        result = encryptMode ? sha512Encrypt(input, key, options) : sha512Decrypt(input, key, options);
        break;
      case "md5":
        result = encryptMode ? md5Encrypt(input, key, options) : md5Decrypt(input, key, options);
        break;
      case "hmac":
        result = encryptMode ? hmacEncrypt(input, key, options) : hmacDecrypt(input, key, options);
        break;
      case 'cmac':
        result = encryptMode ? cmacEncrypt(input, key, options) : cmacDecrypt(input, key, options)
        break
      case "bcrypt":
        result = encryptMode ? bcryptEncrypt(input, key, options) : bcryptDecrypt(input, key, options);
        break;
      case "xxhash":
        result = encryptMode ? xxhashEncrypt(input, key, options) : xxhashDecrypt();
        break;
      case "sha3":
        result = encryptMode ? sha3Encrypt(input, key, options) : sha3Decrypt();
        break;
      case "ripemd160":
        result = encryptMode ? ripemd160Encrypt(input, key, options) : ripemd160Decrypt();
        break;
      case "blake2b":
        result = encryptMode ? blake2bEncrypt(input, key, options) : blake2bDecrypt();
        break;
      case "blake3":
        result = encryptMode ? blake3Encrypt(input, key, options) : blake3Decrypt(input, key, options);
        break;
      case "poly1305":
        result = encryptMode ? poly1305Encrypt(input, key, options) : poly1305Decrypt();
        break;
      case "sha1":
        result = encryptMode ? sha1Encrypt(input, key, options) : sha1Decrypt();
        break;
      case "hkdf":
        result = encryptMode ? hkdfEncrypt(input, key, options) : hkdfDecrypt();
        break;
      case 'blake2s':
        result = encryptMode ? blake2sEncrypt(input, key, options) : blake2sDecrypt(input, key, options)
        break
      case 'sha224':
        result = encryptMode ? encryptSha224(input, key, options) : sha2TruncDecrypt(input, key, options)
        break
      case 'sha384':
        result = encryptMode ? encryptSha384(input, key, options) : sha2TruncDecrypt(input, key, options)
        break
      case 'shake128':
        result = encryptMode ? encryptShake128(input, key, options) : shakeDecrypt(input, key, options)
        break
      case 'shake256':
        result = encryptMode ? encryptShake256(input, key, options) : shakeDecrypt(input, key, options)
        break
      case 'md4':
        result = encryptMode ? md4Encrypt(input, key, options) : md4Decrypt(input, key, options)
        break
      case "pbkdf2":
        result = await deriveKey(input, {
          iterations: typeof options?.iterations === 'number' ? options.iterations : 10000,
          hash: (options?.hash ?? "SHA-256") as "SHA-256" | "SHA-512",
          keyLength: typeof options?.keyLength === 'number' ? options.keyLength : 32,
          salt: typeof options?.salt === 'string' ? options.salt : undefined,
        });
        break;
      case "scrypt":
        result = await deriveScryptKey(input, {
          N: typeof options?.N === 'number' ? options.N : 16384,
          r: typeof options?.r === 'number' ? options.r : 8,
          p: typeof options?.p === 'number' ? options.p : 1,
          dkLen: typeof options?.dkLen === 'number' ? options.dkLen : 32,
          salt: typeof options?.salt === 'string' ? options.salt : undefined,
        });
        break;
      case "rc4":
        result = encryptMode ? rc4Encrypt(input, key, options) : rc4Decrypt(input, key, options);
        break;
      case "salsa20":
        result = encryptMode ? salsa20Encrypt(input, key, options) : salsa20Decrypt(input, key, options);
        break;
      case "skipjack":
        result = encryptMode ? skipjackEncrypt(input, key, options) : skipjackDecrypt(input, key, options);
        break;
      case "chacha20":
        result = encryptMode ? chacha20Encrypt(input, key, options) : chacha20Decrypt(input, key, options);
        break;
      case "rc5":
        result = encryptMode ? rc5Encrypt(input, key, options) : rc5Decrypt(input, key, options);
        break;
      case "xtea":
        result = encryptMode ? xteaEncrypt(input, key, options) : xteaDecrypt(input, key, options);
        break;
      case "rc6":
        result = encryptMode ? rc6Encrypt(input, key, options) : rc6Decrypt(input, key, options);
        break;
      case "camellia":
        result = encryptMode ? camelliaEncrypt(input, key, options) : camelliaDecrypt(input, key, options);
        break;
      case "idea":
        result = encryptMode ? ideaEncrypt(input, key, options) : ideaDecrypt(input, key, options);
        break;
      default:
        throw new Error(`Unsupported cipher ID: ${cipherId}`);
    }

    const handler = encryptMode ? dispatcher.encrypt : dispatcher.decrypt;
    let result: unknown = handler(input, key, options);

    // Some cipher implementations (e.g. RSA real mode via WebCrypto) are async
    // and return a Promise; awaiting a plain value is a no-op for the rest.
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

