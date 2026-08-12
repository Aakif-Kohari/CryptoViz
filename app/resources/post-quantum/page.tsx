import type { Metadata } from "next";
import PostQuantumLearningHub from "../../../components/resources/PostQuantumLearningHub";

export const metadata: Metadata = {
  title: "Post-Quantum Cryptography Learning Hub | CryptoViz",
  description:
    "Educational post-quantum cryptography hub covering Kyber, Dilithium, Falcon, and SPHINCS+ with filters, comparisons, and learning notes.",
};

export default function PostQuantumLearningHubPage() {
  return <PostQuantumLearningHub />;
}
