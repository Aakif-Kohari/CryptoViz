import type { Metadata } from "next";
import DocsLandingContent from "../../components/docs/DocsLandingContent";
import DocsThemeLayout from "../../components/docs/DocsThemeLayout";

export const metadata: Metadata = {
  title: "Documentation | CryptoViz",
  description:
    "CryptoViz documentation styled with the same design system as the main website, including responsive navigation and themed docs cards.",
};

export default function DocsPage() {
  return (
    <DocsThemeLayout
      pathname="/docs"
      title="CryptoViz Documentation"
      description="Explore implementation guides, visualizer notes, cipher references, and maintainer resources in a unified interface that matches the rest of CryptoViz."
    >
      <DocsLandingContent />
    </DocsThemeLayout>
  );
}
