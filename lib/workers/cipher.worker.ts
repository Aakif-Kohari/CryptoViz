/**
 * Cipher Web Worker.
 * Handles heavy cryptographic operations off the main thread.
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
import { encrypt as twofishEncrypt, decrypt as twofishDecrypt } from '../cipher/symmetric/twofish';
import { encrypt as gostEncrypt, decrypt as gostDecrypt } from '../cipher/symmetric/gost';
import { encrypt as rc2Encrypt, decrypt as rc2Decrypt } from '../cipher/symmetric/rc2';
import { encrypt as enigmaEncrypt, decrypt as enigmaDecrypt } from '../cipher/symmetric/enigma';
import { encrypt as xsalsa20Encrypt, decrypt as xsalsa20Decrypt } from '../cipher/symmetric/xsalsa20';
import { encrypt as asconEncypt, decrypt as asconDecrypt } from '../cipher/symmetric/ascon';

import { encrypt as sm4Encrypt, decrypt as sm4Decrypt } from '../cipher/symmetric/sm4';
import { encrypt as teaEncrypt, decrypt as teaDecrypt } from '../cipher/symmetric/tea';
import { encrypt as blowfishEncrypt, decrypt as blowfishDecrypt } from '../cipher/symmetric/blowfish';
import { encrypt as serpentEncrypt, decrypt as serpentDecrypt } from '../cipher/symmetric/serpent';
import { encrypt as chacha20Encrypt, decrypt as chacha20Decrypt } from "../cipher/symmetric/chacha20";
import { encrypt as desEncrypt, decrypt as desDecrypt } from "../cipher/symmetric/des";
import { encrypt as des3Encrypt, decrypt as des3Decrypt } from "../cipher/symmetric/3des";
import { encrypt as ideaEncrypt, decrypt as ideaDecrypt } from "../cipher/symmetric/idea";
import { encrypt as otpEncrypt, decrypt as otpDecrypt } from "../cipher/symmetric/otp";
import { encrypt as rc4Encrypt, decrypt as rc4Decrypt } from "../cipher/symmetric/rc4";
import { encrypt as rc5Encrypt, decrypt as rc5Decrypt } from "../cipher/symmetric/rc5";
import { encrypt as rc6Encrypt, decrypt as rc6Decrypt } from "../cipher/symmetric/rc6";
import { encrypt as salsa20Encrypt, decrypt as salsa20Decrypt } from "../cipher/symmetric/salsa20";
import { encrypt as skipjackEncrypt, decrypt as skipjackDecrypt } from "../cipher/symmetric/skipjack";
import { encrypt as xorEncrypt, decrypt as xorDecrypt } from "../cipher/symmetric/xor";
import { encrypt as xteaEncrypt, decrypt as xteaDecrypt } from "../cipher/symmetric/xtea";
import { deriveKey } from "../kdf/pbkdf2";
import { deriveScryptKey } from "../kdf/scrypt";
import { CipherError } from "../utils/errors";
import type { WorkerRequest, WorkerResponse } from "../../types/worker";

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
