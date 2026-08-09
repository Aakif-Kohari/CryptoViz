import { describe, expect, it } from "vitest";
import {
  buildAvalancheManualChecklist,
  buildAvalancheResult,
  calculatePercentageDifference,
  compareBits,
  flipBit,
  getAvalancheAlgorithmLabel,
} from "../../../lib/visualizers/avalancheEffect";

describe("avalanche effect visualizer utilities", () => {
  it("flips exactly one bit", () => {
    expect(flipBit("0000", 2)).toBe("0010");
    expect(flipBit("1111", 0)).toBe("0111");
  });

  it("clamps flipped bit indexes", () => {
    expect(flipBit("0000", 99)).toBe("0001");
    expect(flipBit("0000", -5)).toBe("1000");
  });

  it("compares changed bits", () => {
    expect(compareBits("00001111", "01001010")).toEqual([1, 5, 7]);
  });

  it("calculates percentage difference", () => {
    expect(calculatePercentageDifference(32, 64)).toBe(50);
    expect(calculatePercentageDifference(0, 64)).toBe(0);
    expect(calculatePercentageDifference(1, 0)).toBe(0);
  });

  it("builds a complete avalanche result", () => {
    const result = buildAvalancheResult({
      message: "Avalanche",
      flippedBitIndex: 0,
      rounds: 8,
      algorithm: "toy-feistel",
    });

    expect(result.rounds).toHaveLength(8);
    expect(result.heatmap).toHaveLength(8);
    expect(result.heatmap.every((row) => row.length === 64)).toBe(true);
    expect(result.finalChangedBitCount).toBeGreaterThan(0);
    expect(result.finalPercentageDifference).toBeGreaterThanOrEqual(0);
    expect(result.finalPercentageDifference).toBeLessThanOrEqual(100);
  });

  it("caps the number of rounds for responsive rendering", () => {
    expect(
      buildAvalancheResult({
        message: "test",
        flippedBitIndex: 0,
        rounds: 99,
        algorithm: "xor-rotate",
      }).rounds,
    ).toHaveLength(16);

    expect(
      buildAvalancheResult({
        message: "test",
        flippedBitIndex: 0,
        rounds: 0,
        algorithm: "xor-rotate",
      }).rounds,
    ).toHaveLength(1);
  });

  it("produces different statistics for different algorithms", () => {
    const common = {
      message: "Avalanche",
      flippedBitIndex: 5,
      rounds: 6,
    };

    const feistel = buildAvalancheResult({ ...common, algorithm: "toy-feistel" });
    const rotate = buildAvalancheResult({ ...common, algorithm: "xor-rotate" });
    const hash = buildAvalancheResult({ ...common, algorithm: "mixing-hash" });

    expect(
      new Set([
        feistel.finalChangedBitCount,
        rotate.finalChangedBitCount,
        hash.finalChangedBitCount,
      ]).size,
    ).toBeGreaterThan(1);
  });

  it("returns readable algorithm labels", () => {
    expect(getAvalancheAlgorithmLabel("toy-feistel")).toBe("Toy Feistel");
    expect(getAvalancheAlgorithmLabel("xor-rotate")).toBe("XOR + Rotate");
    expect(getAvalancheAlgorithmLabel("mixing-hash")).toBe("Mixing Hash");
  });

  it("builds manual testing checklist", () => {
    const checklist = buildAvalancheManualChecklist();

    expect(checklist).toContain("Confirm heatmap cells highlight changed bits by round.");
    expect(checklist.some((item) => item.includes("bit comparison"))).toBe(true);
  });
});
