import type { Metadata } from "next";
import InteractiveCryptographyRoadmap from "../../../components/resources/InteractiveCryptographyRoadmap";

export const metadata: Metadata = {
  title: "Interactive Cryptography Roadmap | CryptoViz",
  description:
    "Interactive cryptography learning roadmap with progress tracking, prerequisites, filters, and recommended next steps.",
};

export default function InteractiveCryptographyRoadmapPage() {
  return <InteractiveCryptographyRoadmap />;
}
