export interface DocsNavigationItem {
  title: string;
  description: string;
  href: string;
  category:
    "Getting Started" | "Visualizers" | "Ciphers" | "Security" | "Contributing";
  badge?: string;
}

export interface DocsThemeStat {
  label: string;
  value: string;
  description: string;
}

export interface DocsThemeSection {
  title: string;
  eyebrow: string;
  description: string;
  items: DocsNavigationItem[];
}

export const DOCS_NAVIGATION_ITEMS: DocsNavigationItem[] = [
  {
    title: "Getting Started",
    description:
      "Learn the CryptoViz structure, navigation patterns, and visualizer workflow.",
    href: "/docs/getting-started",
    category: "Getting Started",
    badge: "Start here",
  },
  {
    title: "Visualization Development Guide",
    description:
      "Build interactive cipher and hash visualizers using the shared design system.",
    href: "/docs/visualization-development-guide",
    category: "Contributing",
  },
  {
    title: "Worker Architecture",
    description:
      "Understand how heavy cryptographic calculations are isolated from the UI thread.",
    href: "/docs/worker-architecture",
    category: "Security",
  },
  {
    title: "AES Key Expansion",
    description:
      "Inspect how AES round keys are derived from the original key.",
    href: "/visualizer/aes-key-expansion",
    category: "Visualizers",
  },
  {
    title: "DES Key Schedule",
    description:
      "Follow DES PC-1, rotations, PC-2, and subkey generation round by round.",
    href: "/visualizer/des-key-schedule",
    category: "Visualizers",
  },
  {
    title: "Hash Collision Playground",
    description:
      "Explore collision concepts with safe educational hash examples.",
    href: "/visualizer/hash-collision",
    category: "Visualizers",
  },
  {
    title: "Standards & RFC Explorer",
    description:
      "Browse standards and RFC references from a CryptoViz learning lens.",
    href: "/resources/standards-rfc",
    category: "Getting Started",
  },
  {
    title: "Cipher Registry",
    description:
      "Review common cipher metadata, block sizes, key sizes, and shared API contracts.",
    href: "/docs/cipher-registry",
    category: "Ciphers",
  },
];

export const DOCS_THEME_STATS: DocsThemeStat[] = [
  {
    label: "Theme",
    value: "Unified",
    description:
      "Docs reuse the same dark glass, gradient, card, and focus language as the main site.",
  },
  {
    label: "Layout",
    value: "Responsive",
    description:
      "Navigation compresses from sidebar-style groups to stacked mobile cards.",
  },
  {
    label: "Access",
    value: "Keyboard",
    description:
      "Links use visible focus states and semantic landmarks for faster navigation.",
  },
];

export function groupDocsNavigation(
  items: DocsNavigationItem[] = DOCS_NAVIGATION_ITEMS,
): DocsThemeSection[] {
  const order: DocsNavigationItem["category"][] = [
    "Getting Started",
    "Visualizers",
    "Ciphers",
    "Security",
    "Contributing",
  ];

  return order
    .map((category) => {
      const groupedItems = items.filter((item) => item.category === category);

      return {
        title: category,
        eyebrow: category.toUpperCase(),
        description: getCategoryDescription(category),
        items: groupedItems,
      };
    })
    .filter((section) => section.items.length > 0);
}

export function getCategoryDescription(
  category: DocsNavigationItem["category"],
): string {
  switch (category) {
    case "Getting Started":
      return "Entry points for understanding how CryptoViz is organized.";
    case "Visualizers":
      return "Interactive learning pages that explain cryptographic ideas visually.";
    case "Ciphers":
      return "Cipher-specific contracts, references, and implementation notes.";
    case "Security":
      return "Security, worker, and deployment guidance for maintainers.";
    case "Contributing":
      return "Guides for building new pages without drifting from the design system.";
    default:
      return "Documentation resources.";
  }
}

export function buildDocsBreadcrumb(pathname: string): string[] {
  const parts = pathname
    .split("/")
    .filter(Boolean)
    .map((part) =>
      part
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    );

  return parts.length > 0 ? ["CryptoViz", ...parts] : ["CryptoViz", "Docs"];
}

export function getDocsThemeClassNames() {
  return {
    page: "min-h-screen bg-slate-950 text-slate-100",
    shell:
      "mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8",
    hero: "overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30",
    card: "rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10 transition hover:border-cyan-300/40",
    focus:
      "outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/40 focus-visible:ring-offset-0",
    pill: "inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200",
  };
}

export function buildDocsThemeChecklist(): string[] {
  return [
    "Open the docs landing page and confirm it uses the main CryptoViz dark theme.",
    "Confirm docs cards use the same rounded glass style as visualizer/resource pages.",
    "Confirm docs navigation is grouped by category.",
    "Confirm all docs links have visible focus states.",
    "Resize the page to desktop, tablet, and mobile widths.",
    "Confirm the docs page links are reachable from the existing navigation.",
    "Run the focused docs theme unit tests.",
    "Run lint and production build before opening the PR.",
  ];
}
