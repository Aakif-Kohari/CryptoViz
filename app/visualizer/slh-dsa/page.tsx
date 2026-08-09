import type { Metadata } from "next";
import SlhDsaVisualizer from "../../../components/signatures/SlhDsaVisualizer";

export const metadata: Metadata = {
  title: "SLH-DSA / SPHINCS+ Visualizer | CryptoViz",
  description:
    "Interactive SLH-DSA visualizer explaining stateless hash-based signatures, FORS, WOTS+, hypertrees, and verification.",
};

export default function SlhDsaVisualizerPage() {
  return <SlhDsaVisualizer />;
}
