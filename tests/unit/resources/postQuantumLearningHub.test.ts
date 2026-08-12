import { describe, expect, it } from "vitest";
import {
  DEFAULT_PQC_HUB_FILTER,
  PQC_ALGORITHMS,
  buildPqcComparisonRows,
  buildPqcHubResult,
  buildPqcManualChecklist,
  filterPqcAlgorithms,
  getPqcDifficulties,
  getPqcFamilies,
  getPqcTags,
  pqcAlgorithmMatchesSearch,
} from "../../../lib/resources/postQuantumLearningHub";

describe("post-quantum learning hub utilities", () => {
  it("contains the requested PQC algorithms", () => {
    expect(PQC_ALGORITHMS.map((algorithm) => algorithm.id)).toEqual(["kyber", "dilithium", "falcon", "sphincs-plus"]);
  });

  it("builds filter option lists", () => {
    expect(getPqcFamilies()).toEqual(["All", "KEM", "Signature"]);
    expect(getPqcDifficulties()).toEqual(["All", "Beginner", "Intermediate", "Advanced"]);
    expect(getPqcTags()).toContain("lattice");
    expect(getPqcTags()).toContain("hash-based");
  });

  it("searches algorithm metadata", () => {
    const kyber = PQC_ALGORITHMS.find((algorithm) => algorithm.id === "kyber")!;
    expect(pqcAlgorithmMatchesSearch(kyber, "Module-LWE")).toBe(true);
    expect(pqcAlgorithmMatchesSearch(kyber, "not-present")).toBe(false);
  });

  it("filters by family, difficulty, tag, and search", () => {
    expect(filterPqcAlgorithms({ ...DEFAULT_PQC_HUB_FILTER, family: "KEM" })).toHaveLength(1);
    expect(filterPqcAlgorithms({ ...DEFAULT_PQC_HUB_FILTER, family: "Signature" })).toHaveLength(3);
    expect(filterPqcAlgorithms({ ...DEFAULT_PQC_HUB_FILTER, difficulty: "Advanced" })).toHaveLength(2);
    expect(filterPqcAlgorithms({ ...DEFAULT_PQC_HUB_FILTER, tag: "hash-based" })).toHaveLength(1);
    expect(filterPqcAlgorithms({ ...DEFAULT_PQC_HUB_FILTER, search: "compact" }).some((algorithm) => algorithm.id === "falcon")).toBe(true);
  });

  it("builds complete hub result", () => {
    const result = buildPqcHubResult(DEFAULT_PQC_HUB_FILTER);
    expect(result.algorithms).toHaveLength(4);
    expect(result.featured).toBeTruthy();
    expect(result.summary).toMatchObject({ total: 4, kem: 1, signatures: 3, intermediate: 2, advanced: 2 });
  });

  it("returns no featured algorithm when no results match", () => {
    const result = buildPqcHubResult({ ...DEFAULT_PQC_HUB_FILTER, search: "definitely-no-match" });
    expect(result.algorithms).toHaveLength(0);
    expect(result.featured).toBeNull();
  });

  it("builds comparison rows for all algorithms", () => {
    const rows = buildPqcComparisonRows();
    expect(rows).toHaveLength(4);
    expect(rows.find((row) => row.algorithm.includes("SPHINCS"))?.basis).toMatch(/Hash/i);
  });

  it("builds manual testing checklist", () => {
    const checklist = buildPqcManualChecklist();
    expect(checklist[0]).toMatch(/post-quantum cryptography learning hub/i);
    expect(checklist).toContain("Confirm Kyber, Dilithium, Falcon, and SPHINCS+ cards render.");
  });
});
