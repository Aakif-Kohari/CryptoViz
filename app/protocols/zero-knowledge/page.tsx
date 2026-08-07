import type { Metadata } from "next";
import SigmaProtocolPlayground from "../../../components/protocols/SigmaProtocolPlayground";

export const metadata: Metadata = {
  title: "Zero-Knowledge Proof Playground | CryptoViz",
  description:
    "Interactive Schnorr sigma-protocol playground covering completeness, soundness, zero-knowledge simulation, extraction, and Fiat-Shamir.",
};

export default function ZeroKnowledgeProofPlaygroundPage() {
  return <SigmaProtocolPlayground />;
}
