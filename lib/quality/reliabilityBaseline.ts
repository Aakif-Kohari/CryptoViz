export type ReliabilityArea =
  | "correctness"
  | "tests"
  | "accessibility"
  | "security"
  | "performance"
  | "documentation"
  | "release";

export type ReliabilityStatus = "pass" | "warn" | "fail";

export interface ReliabilityCriterion {
  id: string;
  area: ReliabilityArea;
  title: string;
  description: string;
  required: boolean;
  verification: string;
}

export interface ReliabilityCheckResult {
  criterionId: string;
  status: ReliabilityStatus;
  message: string;
  evidence?: string;
}

export interface ReliabilitySummary {
  total: number;
  passed: number;
  warnings: number;
  failed: number;
  requiredFailures: string[];
  releasable: boolean;
}

export const RELIABILITY_BASELINE_CRITERIA: ReliabilityCriterion[] = [
  {
    id: "correctness-known-vectors",
    area: "correctness",
    title: "Published vectors pass",
    description:
      "Cipher, hash, protocol, and encoding implementations should include reference-vector or round-trip coverage.",
    required: true,
    verification:
      "Run focused unit tests for touched primitives and any published-vector suites.",
  },
  {
    id: "tests-focused",
    area: "tests",
    title: "Focused tests for changed behavior",
    description:
      "Each bug fix should include tests that fail before the fix and pass after the fix.",
    required: true,
    verification: "Run the focused Vitest file or targeted test command.",
  },
  {
    id: "tests-full-suite",
    area: "tests",
    title: "Full suite remains healthy",
    description: "A fix should not regress unrelated CryptoViz behavior.",
    required: true,
    verification:
      "Run npm test or the repo's full test command before release.",
  },
  {
    id: "build-production",
    area: "release",
    title: "Production build passes",
    description:
      "Next.js production build should complete without type, import, or route errors.",
    required: true,
    verification: "Run npm run build.",
  },
  {
    id: "lint-format",
    area: "release",
    title: "Lint and formatting pass",
    description: "Changed files should be formatted and lint-clean.",
    required: true,
    verification: "Run npm run lint and prettier on changed files.",
  },
  {
    id: "accessibility-keyboard",
    area: "accessibility",
    title: "Keyboard and focus behavior verified",
    description:
      "Interactive UI should be usable by keyboard with visible focus states and semantic labels.",
    required: false,
    verification:
      "Manually tab through touched UI and run focused accessibility tests when available.",
  },
  {
    id: "security-inputs",
    area: "security",
    title: "User input is constrained",
    description:
      "User-controlled inputs should be validated, sanitized, or encoded before display or cryptographic processing.",
    required: false,
    verification:
      "Review touched forms/search boxes and run sanitization tests where relevant.",
  },
  {
    id: "performance-main-thread",
    area: "performance",
    title: "Heavy work stays bounded",
    description:
      "Visualizers and cryptographic demos should use bounded loops, small teaching parameters, or workers.",
    required: false,
    verification:
      "Check loops, iteration caps, and UI responsiveness for touched features.",
  },
  {
    id: "docs-updated",
    area: "documentation",
    title: "Docs or PR notes updated",
    description:
      "Behavior changes should include documentation, implementation notes, or manual verification steps.",
    required: false,
    verification: "Review docs and PR description before submission.",
  },
];

export function getReliabilityCriteriaByArea(
  area: ReliabilityArea,
): ReliabilityCriterion[] {
  return RELIABILITY_BASELINE_CRITERIA.filter(
    (criterion) => criterion.area === area,
  );
}

export function summarizeReliabilityResults(
  results: ReliabilityCheckResult[],
  criteria: ReliabilityCriterion[] = RELIABILITY_BASELINE_CRITERIA,
): ReliabilitySummary {
  const passed = results.filter((result) => result.status === "pass").length;
  const warnings = results.filter((result) => result.status === "warn").length;
  const failed = results.filter((result) => result.status === "fail").length;
  const requiredFailures = results
    .filter((result) => result.status === "fail")
    .filter(
      (result) =>
        criteria.find((criterion) => criterion.id === result.criterionId)
          ?.required,
    )
    .map((result) => result.criterionId);

  return {
    total: results.length,
    passed,
    warnings,
    failed,
    requiredFailures,
    releasable: requiredFailures.length === 0,
  };
}

export function createDefaultReliabilityResults(
  status: ReliabilityStatus = "warn",
): ReliabilityCheckResult[] {
  return RELIABILITY_BASELINE_CRITERIA.map((criterion) => ({
    criterionId: criterion.id,
    status,
    message:
      status === "pass"
        ? `${criterion.title} verified.`
        : `${criterion.title} still needs verification.`,
    evidence: criterion.verification,
  }));
}

export function markReliabilityResult(
  results: ReliabilityCheckResult[],
  criterionId: string,
  status: ReliabilityStatus,
  message: string,
  evidence?: string,
): ReliabilityCheckResult[] {
  const exists = results.some((result) => result.criterionId === criterionId);
  const nextResult: ReliabilityCheckResult = {
    criterionId,
    status,
    message,
    evidence,
  };

  if (!exists) {
    return [...results, nextResult];
  }

  return results.map((result) =>
    result.criterionId === criterionId ? nextResult : result,
  );
}

export function buildReliabilityReleaseChecklist(): string[] {
  return [
    "Run focused tests for every changed cipher, hash, protocol, UI, or utility module.",
    "Run the full test suite.",
    "Run lint and formatting checks.",
    "Run the production build.",
    "Manually verify keyboard navigation for touched interactive pages.",
    "Manually verify user-facing error states for touched forms and visualizers.",
    "Confirm docs or PR notes explain the fix and verification evidence.",
    "Confirm the PR does not introduce broad unrelated feature work.",
  ];
}

export function buildReliabilityPrTemplate(): string {
  return [
    "## Reliability Baseline",
    "",
    "- [ ] Focused tests pass",
    "- [ ] Full test suite pass or known unrelated failures documented",
    "- [ ] Lint and formatting pass",
    "- [ ] Production build passes",
    "- [ ] Keyboard/focus behavior checked for touched UI",
    "- [ ] User-facing error states checked",
    "- [ ] Docs or PR notes updated",
    "",
    "## Evidence",
    "",
    "Paste terminal output or screenshots for the checks above.",
  ].join("\n");
}

export function getReliabilityStatusTone(status: ReliabilityStatus): string {
  if (status === "pass") return "Ready";
  if (status === "warn") return "Needs evidence";
  return "Blocked";
}
