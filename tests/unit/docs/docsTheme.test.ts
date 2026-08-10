import { describe, expect, it } from "vitest";
import {
  DOCS_NAVIGATION_ITEMS,
  DOCS_THEME_STATS,
  buildDocsBreadcrumb,
  buildDocsThemeChecklist,
  getCategoryDescription,
  getDocsThemeClassNames,
  groupDocsNavigation,
} from "../../../lib/docs/docsTheme";

describe("docs theme utilities", () => {
  it("defines docs navigation items", () => {
    expect(DOCS_NAVIGATION_ITEMS.length).toBeGreaterThan(5);
    expect(
      DOCS_NAVIGATION_ITEMS.some(
        (item) => item.href === "/docs/getting-started",
      ),
    ).toBe(true);
    expect(
      DOCS_NAVIGATION_ITEMS.every(
        (item) => item.title && item.description && item.href,
      ),
    ).toBe(true);
  });

  it("groups docs navigation by category", () => {
    const sections = groupDocsNavigation();

    expect(sections.length).toBeGreaterThan(2);
    expect(sections[0].title).toBe("Getting Started");
    expect(sections.every((section) => section.items.length > 0)).toBe(true);
  });

  it("returns category descriptions", () => {
    expect(getCategoryDescription("Visualizers")).toMatch(/interactive/i);
    expect(getCategoryDescription("Security")).toMatch(
      /deployment|worker|security/i,
    );
  });

  it("builds readable breadcrumbs", () => {
    expect(buildDocsBreadcrumb("/docs/worker-architecture")).toEqual([
      "CryptoViz",
      "Docs",
      "Worker Architecture",
    ]);

    expect(buildDocsBreadcrumb("/")).toEqual(["CryptoViz", "Docs"]);
  });

  it("exposes reusable theme class names", () => {
    const classes = getDocsThemeClassNames();

    expect(classes.page).toContain("bg-slate-950");
    expect(classes.hero).toContain("rounded-3xl");
    expect(classes.focus).toContain("focus-visible:ring");
  });

  it("defines theme stats for the hero", () => {
    expect(DOCS_THEME_STATS).toHaveLength(3);
    expect(DOCS_THEME_STATS.map((stat) => stat.label)).toEqual([
      "Theme",
      "Layout",
      "Access",
    ]);
  });

  it("builds manual verification checklist", () => {
    const checklist = buildDocsThemeChecklist();

    expect(checklist).toContain(
      "Confirm docs navigation is grouped by category.",
    );
    expect(
      checklist.some((item) => item.includes("desktop, tablet, and mobile")),
    ).toBe(true);
  });
});
