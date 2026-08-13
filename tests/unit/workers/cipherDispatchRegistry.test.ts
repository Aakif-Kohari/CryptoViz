import { describe, expect, it } from "vitest";
import {
  CIPHER_REGISTRY,
} from "../../../lib/cipher/registry";
import {
  getDispatchableCipherIds,
  getDispatcher,
} from "../../../lib/workers/cipherDispatchRegistry";

describe("registry-backed worker dispatch", () => {
  it("uses the cipher registry as its dispatch source", () => {
    const ids = getDispatchableCipherIds();

    expect(ids.length).toBeGreaterThan(90);
    expect(ids).toContain("caesar");
    expect(ids).toContain("aes");
    expect(ids).toContain("rsa");
    expect(ids).toContain("ml-dsa");
    expect(ids).toContain("ml-kem");
  });

  it("does not duplicate cipher IDs in the registry", () => {
    const ids = CIPHER_REGISTRY.map((definition) => definition.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("loads a conventional cipher lazily", async () => {
    const dispatcher = await getDispatcher("caesar");

    expect(typeof dispatcher.encrypt).toBe("function");
    expect(typeof dispatcher.decrypt).toBe("function");
  });

  it("loads a symmetric cipher without a worker switch case", async () => {
    const dispatcher = await getDispatcher("aes");

    expect(typeof dispatcher.encrypt).toBe("function");
    expect(typeof dispatcher.decrypt).toBe("function");
  });

  it("loads asymmetric and post-quantum modules", async () => {
    const rsa = await getDispatcher("rsa");
    const mlDsa = await getDispatcher("ml-dsa");
    const mlKem = await getDispatcher("ml-kem");

    expect(typeof rsa.encrypt).toBe("function");
    expect(typeof mlDsa.encrypt).toBe("function");
    expect(typeof mlKem.encrypt).toBe("function");
  });

  it("adapts SHA-224 and SHA-384 special exports", async () => {
    const sha224 = await getDispatcher("sha224");
    const sha384 = await getDispatcher("sha384");

    expect(typeof sha224.encrypt).toBe("function");
    expect(typeof sha224.decrypt).toBe("function");
    expect(typeof sha384.encrypt).toBe("function");
    expect(typeof sha384.decrypt).toBe("function");
  });

  it("adapts SHAKE special exports", async () => {
    const shake128 = await getDispatcher("shake128");
    const shake256 = await getDispatcher("shake256");

    expect(typeof shake128.encrypt).toBe("function");
    expect(typeof shake128.decrypt).toBe("function");
    expect(typeof shake256.encrypt).toBe("function");
    expect(typeof shake256.decrypt).toBe("function");
  });

  it("rejects unknown cipher IDs with a typed error", async () => {
    await expect(getDispatcher("__not_a_cipher__")).rejects.toMatchObject({
      name: "CipherError",
      code: "ALGORITHM_UNSUPPORTED",
    });
  });

  it("returns the same cached dispatcher for repeated requests", async () => {
    const first = await getDispatcher("caesar");
    const second = await getDispatcher("caesar");

    expect(first).toBe(second);
  });
});
