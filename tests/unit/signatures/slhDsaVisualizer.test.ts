import { describe, expect, it } from "vitest";
import {
  SLH_DSA_PARAMETER_SETS,
  buildForsReveals,
  buildHypertree,
  buildSlhDsaManualChecklist,
  buildSlhDsaVisualization,
  deriveForsIndexes,
  estimateSignatureSizeBytes,
  getSlhDsaConceptCards,
  selectParameterSet,
  toyHash,
} from "../../../lib/signatures/slhDsaVisualizer";

describe("SLH-DSA visualizer utilities", () => {
  it("defines educational parameter sets", () => {
    expect(SLH_DSA_PARAMETER_SETS.length).toBeGreaterThanOrEqual(4);
    expect(
      SLH_DSA_PARAMETER_SETS.some((set) => set.name === "SLH-DSA-SHA2-128s"),
    ).toBe(true);
    expect(SLH_DSA_PARAMETER_SETS.some((set) => set.securityLevel === 5)).toBe(
      true,
    );
  });

  it("selects a parameter set with a default fallback", () => {
    expect(selectParameterSet("SLH-DSA-SHAKE-192s").name).toBe(
      "SLH-DSA-SHAKE-192s",
    );
    expect(selectParameterSet("missing").name).toBe(
      SLH_DSA_PARAMETER_SETS[0].name,
    );
  });

  it("creates deterministic toy hashes for visual traces", () => {
    expect(toyHash("CryptoViz")).toBe(toyHash("CryptoViz"));
    expect(toyHash("CryptoViz")).not.toBe(toyHash("cryptoViz"));
    expect(toyHash("CryptoViz", 8)).toHaveLength(16);
  });

  it("derives FORS indexes within the displayed tree height", () => {
    const params = selectParameterSet("SLH-DSA-SHA2-128s");
    const indexes = deriveForsIndexes(
      "00112233445566778899AABBCCDDEEFF",
      params,
    );

    expect(indexes).toHaveLength(params.forsTrees);
    expect(
      indexes.every((index) => index >= 0 && index < 2 ** params.forsHeight),
    ).toBe(true);
  });

  it("builds FORS reveal cards", () => {
    const params = selectParameterSet("SLH-DSA-SHA2-128s");
    const reveals = buildForsReveals(
      "00112233445566778899AABBCCDDEEFF",
      params,
    );

    expect(reveals).toHaveLength(params.forsTrees);
    expect(reveals[0]).toMatchObject({
      treeIndex: 0,
    });
    expect(reveals[0].secret).toHaveLength(16);
    expect(reveals[0].authPath.length).toBeGreaterThan(0);
  });

  it("builds a displayed hypertree path", () => {
    const params = selectParameterSet("SLH-DSA-SHA2-128f");
    const hypertree = buildHypertree(
      "00112233445566778899AABBCCDDEEFF",
      params,
    );

    expect(hypertree.length).toBeGreaterThan(2);
    expect(hypertree[0].label).toBe("FORS public key leaf");
    expect(hypertree.at(-1)?.label).toBe("Hypertree public root");
  });

  it("estimates larger signatures for larger parameter profiles", () => {
    const small = estimateSignatureSizeBytes(
      selectParameterSet("SLH-DSA-SHA2-128s"),
    );
    const large = estimateSignatureSizeBytes(
      selectParameterSet("SLH-DSA-SHA2-256s"),
    );

    expect(small).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(small);
  });

  it("builds a complete visualizer model", () => {
    const model = buildSlhDsaVisualization("hello", "SLH-DSA-SHA2-128s");

    expect(model.message).toBe("hello");
    expect(model.messageDigest).toHaveLength(32);
    expect(model.forsReveals).toHaveLength(model.parameterSet.forsTrees);
    expect(model.hypertree.at(-1)?.hash).toBe(model.root);
    expect(model.verificationSteps).toHaveLength(4);
    expect(model.accepted).toBe(true);
    expect(
      model.references.some((reference) => reference.includes("FIPS 205")),
    ).toBe(true);
  });

  it("sanitizes control characters in messages", () => {
    const model = buildSlhDsaVisualization(
      "hello\u0000world",
      "SLH-DSA-SHA2-128s",
    );

    expect(model.message).toBe("helloworld");
  });

  it("returns concept cards and manual checklist", () => {
    expect(getSlhDsaConceptCards().map((card) => card.title)).toContain("FORS");
    expect(buildSlhDsaManualChecklist()).toContain(
      "Confirm standards references mention NIST FIPS 205 and SPHINCS+.",
    );
  });
});
