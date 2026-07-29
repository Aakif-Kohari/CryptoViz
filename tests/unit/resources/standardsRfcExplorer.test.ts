import { describe, expect, it } from "vitest";
import {
  CRYPTO_STANDARDS,
  DEFAULT_STANDARDS_FILTER,
  buildStandardsExplorerResult,
  buildStandardsManualChecklist,
  filterStandards,
  getStandardStatuses,
  getStandardTopics,
  getStandardTypes,
  standardMatchesSearch,
} from "../../../lib/resources/standardsRfcExplorer";

describe("standards RFC explorer utilities", () => {
  it("contains RFC, FIPS, and NIST entries", () => {
    expect(CRYPTO_STANDARDS.some((standard) => standard.type === "RFC")).toBe(
      true,
    );
    expect(CRYPTO_STANDARDS.some((standard) => standard.type === "FIPS")).toBe(
      true,
    );
    expect(
      CRYPTO_STANDARDS.some((standard) => standard.type.startsWith("NIST")),
    ).toBe(true);
    expect(
      CRYPTO_STANDARDS.every((standard) => standard.url.startsWith("https://")),
    ).toBe(true);
  });

  it("builds filter option lists", () => {
    expect(getStandardTypes()).toContain("RFC");
    expect(getStandardTopics()).toContain("Hashing");
    expect(getStandardStatuses()).toContain("Active");
  });

  it("matches search across title, number, summary, relevance, and tags", () => {
    const tls = CRYPTO_STANDARDS.find((standard) => standard.id === "rfc-8446");
    expect(tls).toBeDefined();
    expect(standardMatchesSearch(tls!, "TLS")).toBe(true);
    expect(standardMatchesSearch(tls!, "AEAD")).toBe(true);
    expect(standardMatchesSearch(tls!, "not-present")).toBe(false);
  });

  it("filters standards by type, topic, status, and search", () => {
    expect(
      filterStandards({ ...DEFAULT_STANDARDS_FILTER, type: "FIPS" }).every(
        (standard) => standard.type === "FIPS",
      ),
    ).toBe(true);
    expect(
      filterStandards({ ...DEFAULT_STANDARDS_FILTER, topic: "Hashing" }).every(
        (standard) => standard.topic === "Hashing",
      ),
    ).toBe(true);
    expect(
      filterStandards({ ...DEFAULT_STANDARDS_FILTER, status: "Active" }).every(
        (standard) => standard.status === "Active",
      ),
    ).toBe(true);
    expect(
      filterStandards({ ...DEFAULT_STANDARDS_FILTER, search: "HKDF" }),
    ).toHaveLength(1);
  });

  it("builds complete explorer result", () => {
    const result = buildStandardsExplorerResult(DEFAULT_STANDARDS_FILTER);

    expect(result.standards.length).toBe(CRYPTO_STANDARDS.length);
    expect(result.featured).toBeTruthy();
    expect(result.summary.total).toBe(CRYPTO_STANDARDS.length);
    expect(result.summary.rfc).toBeGreaterThan(0);
    expect(result.summary.fips).toBeGreaterThan(0);
    expect(result.summary.nist).toBeGreaterThan(0);
  });

  it("returns no featured standard when no entries match", () => {
    const result = buildStandardsExplorerResult({
      ...DEFAULT_STANDARDS_FILTER,
      search: "definitely-no-match",
    });

    expect(result.standards).toHaveLength(0);
    expect(result.featured).toBeNull();
  });

  it("builds manual testing checklist", () => {
    const checklist = buildStandardsManualChecklist();

    expect(checklist[0]).toMatch(/open the standards/i);
    expect(checklist).toContain("Search for TLS and confirm RFC 8446 appears.");
  });
});
