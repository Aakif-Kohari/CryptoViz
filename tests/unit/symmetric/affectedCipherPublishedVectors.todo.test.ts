import { describe, expect, it } from "vitest";
import {
  PUBLISHED_CIPHER_VECTORS,
  buildCipherVectorAuditSummary,
  runPublishedVectorSuite,
  type CipherAdapter,
} from "../../../lib/cipher/symmetric/publishedCipherVectors";

/**
 * Integration template for issue #720.
 *
 * Wire each adapter to the repo's real cipher exports, then remove the fallback
 * error bodies. Keeping this file separate avoids guessing current export names
 * while still documenting the exact regression coverage expected by the issue.
 */
const adapters: CipherAdapter[] = [
  {
    cipher: "NOEKEON",
    encryptBlock: () => {
      throw new Error("Wire this adapter to the real NOEKEON encrypt helper.");
    },
  },
  {
    cipher: "PRESENT",
    encryptBlock: () => {
      throw new Error("Wire this adapter to the real PRESENT encrypt helper.");
    },
  },
  {
    cipher: "RC6",
    encryptBlock: () => {
      throw new Error("Wire this adapter to the real RC6 encrypt helper.");
    },
  },
  {
    cipher: "SEED",
    encryptBlock: () => {
      throw new Error("Wire this adapter to the real SEED encrypt helper.");
    },
  },
  {
    cipher: "SIMON",
    encryptBlock: () => {
      throw new Error("Wire this adapter to the real SIMON encrypt helper.");
    },
  },
  {
    cipher: "SPECK",
    encryptBlock: () => {
      throw new Error("Wire this adapter to the real SPECK encrypt helper.");
    },
  },
  {
    cipher: "TWOFISH",
    encryptBlock: () => {
      throw new Error("Wire this adapter to the real Twofish encrypt helper.");
    },
  },
];

describe.skip("affected cipher implementations against published vectors", () => {
  it("passes every known-answer vector after adapters are wired to real cipher exports", () => {
    const results = runPublishedVectorSuite(adapters);
    const summary = buildCipherVectorAuditSummary(results);

    expect(results).toHaveLength(PUBLISHED_CIPHER_VECTORS.length);
    expect(summary.failed).toBe(0);
  });
});
