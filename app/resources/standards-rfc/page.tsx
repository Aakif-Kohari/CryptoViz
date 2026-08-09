import type { Metadata } from "next";
import StandardsRfcExplorer from "../../../components/resources/StandardsRfcExplorer";

export const metadata: Metadata = {
  title: "Standards & RFC Explorer | CryptoViz",
  description:
    "Responsive explorer for cryptography RFCs, FIPS standards, and NIST publications with filters, summaries, and source links.",
};

export default function StandardsRfcExplorerPage() {
  return <StandardsRfcExplorer />;
}
