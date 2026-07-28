import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SkeletonCard from "@/components/ui/SkeletonCard";
import StepAnimator from "@/components/ui/StepAnimator";
import PlayfairGrid from "@/components/cipher/PlayfairGrid";
import ByteHeatmap from "@/components/avalanche/ByteHeatmap";

describe("Visualization Component Snapshot Tests", () => {
  it("matches snapshot for SkeletonCard component", () => {
    const { asFragment } = render(<SkeletonCard />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("matches snapshot for StepAnimator component", () => {
    const steps = [
      { title: "Initialize Cipher", detail: "Set initial state" },
      { title: "Shift Bytes", detail: "Shift by key offset 3" },
    ];
    const { asFragment } = render(
      <StepAnimator
        steps={steps}
        currentStep={0}
        isPlaying={false}
        onStepChange={() => {}}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("matches snapshot for PlayfairGrid matrix component", () => {
    const grid = [
      ["M", "O", "N", "A", "R"],
      ["C", "H", "Y", "B", "D"],
      ["E", "F", "G", "I", "K"],
      ["L", "P", "Q", "S", "T"],
      ["U", "V", "W", "X", "Z"],
    ];
    const { asFragment } = render(<PlayfairGrid matrix={grid} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("matches snapshot for ByteHeatmap component", () => {
    const data = [
      { byteIndex: 0, bitDiffCount: 3, flipPercentage: 0.375 },
      { byteIndex: 1, bitDiffCount: 6, flipPercentage: 0.75 },
    ];
    const { asFragment } = render(<ByteHeatmap data={data} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
