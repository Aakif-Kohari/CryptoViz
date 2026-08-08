import type { Metadata } from "next";
import ReliabilityBaselineDashboard from "../../../components/quality/ReliabilityBaselineDashboard";

export const metadata: Metadata = {
  title: "Reliability Baseline | CryptoViz",
  description:
    "CryptoViz reliability baseline for correctness, tests, accessibility, security, performance, documentation, and release quality checks.",
};

export default function ReliabilityBaselinePage() {
  return <ReliabilityBaselineDashboard />;
}
