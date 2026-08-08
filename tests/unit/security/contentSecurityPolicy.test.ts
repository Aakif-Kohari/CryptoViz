import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicy,
  buildCspManualChecklist,
  buildSecurityHeaders,
  createCspNonce,
  cspContainsUnsafeInline,
  serializeContentSecurityPolicy,
  validateStrictContentSecurityPolicy,
} from "../../../lib/security/contentSecurityPolicy";

describe("content security policy hardening", () => {
  it("builds an enforced CSP header by default", () => {
    const csp = buildContentSecurityPolicy({ nonce: "test-nonce" });

    expect(csp.headerName).toBe("Content-Security-Policy");
    expect(csp.headerValue).toContain("script-src 'self' 'nonce-test-nonce' 'strict-dynamic'");
    expect(csp.headerValue).toContain("style-src 'self' 'nonce-test-nonce'");
    expect(csp.headerValue).toContain("object-src 'none'");
    expect(csp.headerValue).toContain("frame-ancestors 'none'");
    expect(cspContainsUnsafeInline(csp.headerValue)).toBe(false);
  });

  it("supports report-only rollout mode", () => {
    const csp = buildContentSecurityPolicy({
      nonce: "report-nonce",
      reportOnly: true,
      reportUri: "https://example.com/csp-report",
    });

    expect(csp.headerName).toBe("Content-Security-Policy-Report-Only");
    expect(csp.headerValue).toContain("report-uri https://example.com/csp-report");
  });

  it("does not include unsafe-inline in strict policy", () => {
    const csp = buildContentSecurityPolicy({ nonce: "strict-nonce" });

    expect(csp.headerValue).not.toContain("'unsafe-inline'");
    expect(validateStrictContentSecurityPolicy(csp.headerValue)).toEqual([]);
  });

  it("allows unsafe-eval only for local development builds", () => {
    const production = buildContentSecurityPolicy({ nonce: "prod" });
    const development = buildContentSecurityPolicy({
      nonce: "dev",
      allowLocalDevUnsafeEval: true,
    });

    expect(production.headerValue).not.toContain("'unsafe-eval'");
    expect(development.headerValue).toContain("'unsafe-eval'");
    expect(development.headerValue).not.toContain("'unsafe-inline'");
  });

  it("validates weak CSP strings", () => {
    expect(validateStrictContentSecurityPolicy("default-src 'self'; script-src 'unsafe-inline'")).toContain(
      "CSP must not contain 'unsafe-inline'.",
    );
  });

  it("serializes empty-value directives", () => {
    expect(
      serializeContentSecurityPolicy({
        "default-src": ["'self'"],
        "upgrade-insecure-requests": [],
      }),
    ).toBe("default-src 'self'; upgrade-insecure-requests");
  });

  it("creates random-looking nonces", () => {
    const first = createCspNonce();
    const second = createCspNonce();

    expect(first.length).toBeGreaterThan(12);
    expect(second.length).toBeGreaterThan(12);
    expect(first).not.toBe(second);
    expect(first).not.toContain("=");
  });

  it("builds companion security headers", () => {
    const headers = buildSecurityHeaders({ nonce: "header-nonce" });

    expect(headers["Content-Security-Policy"]).toContain("nonce-header-nonce");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
  });

  it("builds manual verification checklist", () => {
    const checklist = buildCspManualChecklist();

    expect(checklist).toContain("Confirm the CSP header does not contain 'unsafe-inline'.");
    expect(checklist.some((item) => item.includes("script-src"))).toBe(true);
  });
});
