import type { Metadata } from "next"
import IdeaCipherVisualizer from "../../../components/symmetric/IdeaCipherVisualizer"

export const metadata: Metadata = {
  title: "IDEA Cipher Visualizer | CryptoViz",
  description: "Interactive IDEA cipher visualizer showing the key schedule, eight rounds, modular arithmetic, XOR mixing, and output transform.",
}

export default function IdeaCipherVisualizerPage() {
  return <IdeaCipherVisualizer />
}
