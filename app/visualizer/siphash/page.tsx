import type { Metadata } from "next";
import SipHashVisualizer from "../../../components/hash/SipHashVisualizer";
export const metadata: Metadata = {
  title: "SipHash Visualizer | CryptoViz",
  description:
    "Interactive SipHash visualizer with keyed hashing controls, message blocks, state trace, and educational documentation.",
};
export default function SipHashVisualizerPage() {
  return <SipHashVisualizer />;
}
