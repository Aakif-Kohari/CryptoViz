import { describe, expect, it } from "vitest";
import {
  RELIABILITY_BASELINE_CRITERIA,
  buildReliabilityPrTemplate,
  buildReliabilityReleaseChecklist,
  createDefaultReliabilityResults,
  getReliabilityCriteriaByArea,
  getReliabilityStatusTone,
  markReliabilityResult,
  summarizeReliabilityResults,
} from "../../../lib/quality/reliabilityBaseline";

describe("reliability baseline", () => {
  it("defines release quality criteria", () => {
    expect(RELIABILITY_BASELINE_CRITERIA.length).toBeGreaterThanOrEqual(8);
    expect(
      RELIABILITY_BASELINE_CRITERIA.some(
        (criterion) => criterion.id === "correctness-known-vectors",
      ),
    ).toBe(true);
    expect(
      RELIABILITY_BASELINE_CRITERIA.some(
        (criterion) => criterion.id === "build-production",
      ),
    ).toBe(true);
  });

  it("groups criteria by area", () => {
    expect(
      getReliabilityCriteriaByArea("tests").map((criterion) => criterion.id),
    ).toEqual(["tests-focused", "tests-full-suite"]);
  });

  it("creates default warning results", () => {
    const results = createDefaultReliabilityResults();

    expect(results).toHaveLength(RELIABILITY_BASELINE_CRITERIA.length);
    expect(results.every((result) => result.status === "warn")).toBe(true);
  });

  it("summarizes pass, warn, and fail results", () => {
    const results = createDefaultReliabilityResults("pass");
    const failed = markReliabilityResult(
      results,
      "build-production",
      "fail",
      "Build failed.",
    );
    const summary = summarizeReliabilityResults(failed);

    expect(summary.total).toBe(RELIABILITY_BASELINE_CRITERIA.length);
    expect(summary.failed).toBe(1);
    expect(summary.requiredFailures).toEqual(["build-production"]);
    expect(summary.releasable).toBe(false);
  });

  it("does not block release on optional warnings", () => {
    const results = createDefaultReliabilityResults("pass");
    const warned = markReliabilityResult(
      results,
      "accessibility-keyboard",
      "warn",
      "Manual check pending.",
    );
    const summary = summarizeReliabilityResults(warned);

    expect(summary.warnings).toBe(1);
    expect(summary.requiredFailures).toEqual([]);
    expect(summary.releasable).toBe(true);
  });

  it("adds new result when marking an unknown criterion", () => {
    const results = markReliabilityResult(
      [],
      "custom-check",
      "pass",
      "Custom check passed.",
    );

    expect(results).toEqual([
      {
        criterionId: "custom-check",
        status: "pass",
        message: "Custom check passed.",
        evidence: undefined,
      },
    ]);
  });

  it("builds a release checklist", () => {
    const checklist = buildReliabilityReleaseChecklist();

    expect(checklist).toContain(
      "Run focused tests for every changed cipher, hash, protocol, UI, or utility module.",
    );
    expect(checklist.some((item) => item.includes("production build"))).toBe(
      true,
    );
  });

  it("builds a PR template snippet", () => {
    const template = buildReliabilityPrTemplate();

    expect(template).toContain("## Reliability Baseline");
    expect(template).toContain("- [ ] Production build passes");
    expect(template).toContain("## Evidence");
  });

  it("maps statuses to user-facing tones", () => {
    expect(getReliabilityStatusTone("pass")).toBe("Ready");
    expect(getReliabilityStatusTone("warn")).toBe("Needs evidence");
    expect(getReliabilityStatusTone("fail")).toBe("Blocked");
  });
});
