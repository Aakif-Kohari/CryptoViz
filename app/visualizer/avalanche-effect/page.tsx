import type { Metadata } from "next";
import AvalancheEffectVisualizer from "../../../components/visualizers/AvalancheEffectVisualizer";

export const metadata: Metadata = {
  title: "Avalanche Effect Visualizer | CryptoViz",
  description:
    "Interactive avalanche effect visualizer showing bit differences, heatmap propagation, and round statistics after a one-bit input change.",
};

export default function AvalancheEffectVisualizerPage() {
  return <AvalancheEffectVisualizer />;
}
