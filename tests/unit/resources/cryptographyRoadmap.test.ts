import { describe, expect, it } from "vitest";
import {
  CRYPTOGRAPHY_ROADMAP_NODES,
  DEFAULT_ROADMAP_FILTER,
  DEFAULT_ROADMAP_PROGRESS,
  arePrerequisitesComplete,
  buildRoadmapManualChecklist,
  buildRoadmapResult,
  calculateRoadmapSummary,
  filterRoadmapNodes,
  getNextRecommendedNode,
  getNodeStatus,
  getRoadmapCategories,
  getRoadmapLevels,
  setRoadmapNodeStatus,
} from "../../../lib/resources/cryptographyRoadmap";

describe("cryptography roadmap utilities", () => {
  it("contains a structured roadmap", () => {
    expect(CRYPTOGRAPHY_ROADMAP_NODES.length).toBeGreaterThanOrEqual(10);
    expect(CRYPTOGRAPHY_ROADMAP_NODES.every((node) => node.outcomes.length > 0)).toBe(true);
    expect(CRYPTOGRAPHY_ROADMAP_NODES.every((node) => node.resources.length > 0)).toBe(true);
  });

  it("builds categories and levels", () => {
    expect(getRoadmapCategories()).toContain("Foundations");
    expect(getRoadmapCategories()).toContain("Symmetric Crypto");
    expect(getRoadmapLevels()).toEqual(["All", "Beginner", "Intermediate", "Advanced"]);
  });

  it("reads progress status with not-started fallback", () => {
    expect(getNodeStatus(DEFAULT_ROADMAP_PROGRESS, "crypto-foundations")).toBe("completed");
    expect(getNodeStatus(DEFAULT_ROADMAP_PROGRESS, "unknown")).toBe("not-started");
  });

  it("checks prerequisites", () => {
    const aes = CRYPTOGRAPHY_ROADMAP_NODES.find((node) => node.id === "aes-internals")!;
    expect(arePrerequisitesComplete(aes, DEFAULT_ROADMAP_PROGRESS)).toBe(false);

    const completedProgress = {
      ...DEFAULT_ROADMAP_PROGRESS,
      "symmetric-encryption": "completed" as const,
    };
    expect(arePrerequisitesComplete(aes, completedProgress)).toBe(true);
  });

  it("filters roadmap nodes", () => {
    expect(filterRoadmapNodes({ ...DEFAULT_ROADMAP_FILTER, level: "Advanced" }).every((node) => node.level === "Advanced")).toBe(true);
    expect(filterRoadmapNodes({ ...DEFAULT_ROADMAP_FILTER, category: "Hashing" }).every((node) => node.category === "Hashing")).toBe(true);
    expect(filterRoadmapNodes({ ...DEFAULT_ROADMAP_FILTER, search: "AES" }).length).toBeGreaterThan(0);
  });

  it("calculates progress summary", () => {
    const summary = calculateRoadmapSummary(DEFAULT_ROADMAP_PROGRESS);

    expect(summary.total).toBe(CRYPTOGRAPHY_ROADMAP_NODES.length);
    expect(summary.completed).toBe(2);
    expect(summary.inProgress).toBe(1);
    expect(summary.completionPercent).toBeGreaterThan(0);
    expect(summary.estimatedMinutesRemaining).toBeGreaterThan(0);
  });

  it("recommends the next available node", () => {
    const next = getNextRecommendedNode(DEFAULT_ROADMAP_PROGRESS);

    expect(next).toBeTruthy();
    expect(next?.locked).toBe(false);
    expect(next?.status).not.toBe("completed");
  });

  it("updates node status immutably", () => {
    const updated = setRoadmapNodeStatus(DEFAULT_ROADMAP_PROGRESS, "hash-functions", "completed");

    expect(updated["hash-functions"]).toBe("completed");
    expect(DEFAULT_ROADMAP_PROGRESS["hash-functions"]).toBe("in-progress");
    expect(() => setRoadmapNodeStatus(DEFAULT_ROADMAP_PROGRESS, "missing", "completed")).toThrow(/does not exist/i);
  });

  it("builds complete roadmap result", () => {
    const result = buildRoadmapResult(DEFAULT_ROADMAP_FILTER, DEFAULT_ROADMAP_PROGRESS);

    expect(result.nodes).toHaveLength(CRYPTOGRAPHY_ROADMAP_NODES.length);
    expect(result.categories).toContain("Foundations");
    expect(result.summary.total).toBe(CRYPTOGRAPHY_ROADMAP_NODES.length);
  });

  it("builds manual testing checklist", () => {
    const checklist = buildRoadmapManualChecklist();

    expect(checklist[0]).toMatch(/open the interactive cryptography roadmap/i);
    expect(checklist).toContain("Mark a roadmap item completed and confirm completion percentage updates.");
  });
});
