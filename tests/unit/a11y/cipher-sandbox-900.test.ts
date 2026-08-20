import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("CipherSandbox accessibility contract (#900)", () => {
  const source = fs.readFileSync(
    path.resolve(process.cwd(), "components/cipher-sandbox/CipherSandbox.tsx"),
    "utf8",
  );

  it("names stage movement/removal controls", () => {
    expect(source).toContain('aria-label="Move stage up"');
    expect(source).toContain('aria-label="Move stage down"');
    expect(source).toContain('aria-label={`Remove stage ${idx + 1}`}');
  });

  it("names copy and pipeline controls", () => {
    expect(source).toContain('aria-label="Copy output"');
    expect(source).toContain('aria-label="Add stage"');
    expect(source).toContain('aria-label="Copy pipeline JSON"');
  });

  it("names the remaining interactive controls in the sandbox", () => {
    expect(source).toContain('aria-label="Number of rounds"');
    expect(source).toContain('aria-label={`Enable stage ${idx + 1}`}');
    expect(source).toContain('aria-label="Show step trace"');
    expect(source).toContain('aria-label="Show security metrics"');
    expect(source).toContain('aria-label="Show export and import"');
  });
});
