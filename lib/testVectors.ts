export interface TestVector {
  algorithm: string;
  plaintext: string;
  key: string;
  ciphertext: string;
}

export const sampleVectors: TestVector[] = [
  {
    algorithm: "AES-128",
    plaintext: "00112233445566778899aabbccddeeff",
    key: "000102030405060708090a0b0c0d0e0f",
    ciphertext: "69c4e0d86a7b0430d8cdb78070b4c55a",
  },
];