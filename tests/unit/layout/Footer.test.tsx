import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Footer from "@/components/layout/footer";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Footer Component", () => {
  it("renders all navigation columns and links without placeholder anchors", () => {
    render(<Footer />);

    // Brand
    expect(screen.getByText("Become a Contributor")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Become a Contributor/i })).toHaveAttribute(
      "href",
      "https://github.com/csxark/CryptoViz/blob/main/CONTRIBUTING.md"
    );

    // Section Headers
    expect(screen.getByRole("heading", { name: "Visualizers" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Learn & Explore" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Documentation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Community" })).toBeInTheDocument();

    // Verify links exist and have valid hrefs (no "#", "javascript:", or empty strings)
    const allLinks = screen.getAllByRole("link");
    expect(allLinks.length).toBeGreaterThanOrEqual(15);

    allLinks.forEach((link) => {
      const href = link.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).not.toBe("#");
      expect(href).not.toBe("");
      expect(href).not.toMatch(/^javascript:/i);

      if (href?.startsWith("http")) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    });

    // Check specific critical links
    expect(screen.getByRole("link", { name: /Cipher Sandbox/i })).toHaveAttribute("href", "/cipher-sandbox");
    expect(screen.getByRole("link", { name: /Challenge Mode/i })).toHaveAttribute("href", "/challenge");
    expect(screen.getByRole("link", { name: /Getting Started/i })).toHaveAttribute("href", "/docs");
    
    const githubLinks = screen.getAllByRole("link", { name: /GitHub Repository/i });
    expect(githubLinks.length).toBeGreaterThanOrEqual(1);
    githubLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "https://github.com/csxark/CryptoViz");
    });
  });
});
