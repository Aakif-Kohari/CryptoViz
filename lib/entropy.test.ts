import { calculateShannonEntropy, calculateMinEntropy, calculateUnicityDistance } from "../entropy";

describe("Entropy & Information-Theoretic Utilities", () => {
  test("calculates uniform Shannon entropy correctly", () => {
    const dist = [0.25, 0.25, 0.25, 0.25];
    expect(calculateShannonEntropy(dist)).toBeCloseTo(2.0, 5);
  });

  test("calculates Min-Entropy correctly", () => {
    const dist = [0.5, 0.25, 0.125, 0.125];
    expect(calculateMinEntropy(dist)).toBeCloseTo(1.0, 5);
  });

  test("calculates Unicity Distance correctly", () => {
    expect(calculateUnicityDistance(128, 3.2)).toBe(40);
    expect(calculateUnicityDistance(128, 0)).toBe(Infinity);
  });
});
