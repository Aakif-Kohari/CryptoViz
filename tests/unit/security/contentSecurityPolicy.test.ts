import { describe, expect, it, vi } from "vitest";
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
    expect(csp.headerValue).toContain(
      "script-src 'self' 'nonce-test-nonce' 'strict-dynamic'",
    );
    expect(csp.headerValue).toContain(
      "style-src 'self' 'nonce-test-nonce'",
    );
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

    expect(csp.headerName).toBe(
      "Content-Security-Policy-Report-Only",
    );
    expect(csp.headerValue).toContain(
      "report-uri https://example.com/csp-report",
    );
  });

  it("does not include unsafe-inline in strict policy", () => {
    const csp = buildContentSecurityPolicy({
      nonce: "strict-nonce",
    });

    expect(csp.headerValue).not.toContain("'unsafe-inline'");
    expect(validateStrictContentSecurityPolicy(csp.headerValue)).toEqual(
      [],
    );
  });

  it("allows unsafe-eval only for local development builds", () => {
    const production = buildContentSecurityPolicy({
      nonce: "prod",
    });

    const development = buildContentSecurityPolicy({
      nonce: "dev",
      allowLocalDevUnsafeEval: true,
    });

    expect(production.headerValue).not.toContain("'unsafe-eval'");
    expect(development.headerValue).toContain("'unsafe-eval'");
    expect(development.headerValue).not.toContain("'unsafe-inline'");
  });

  describe("cspContainsUnsafeInline", () => {
    it("detects lowercase unsafe-inline", () => {
      expect(
        cspContainsUnsafeInline("script-src 'unsafe-inline'"),
      ).toBe(true);
    });

    it("detects uppercase unsafe-inline", () => {
      expect(
        cspContainsUnsafeInline("script-src 'UNSAFE-INLINE'"),
      ).toBe(true);
    });

    it("detects mixed-case unsafe-inline", () => {
      expect(
        cspContainsUnsafeInline("script-src 'Unsafe-InLine'"),
      ).toBe(true);
    });

    it("detects semicolon-delimited unsafe-inline", () => {
      expect(
        cspContainsUnsafeInline(
          "script-src 'unsafe-inline'; style-src 'self'",
        ),
      ).toBe(true);
    });

    it("detects comma-delimited unsafe-inline", () => {
      expect(
        cspContainsUnsafeInline(
          "script-src 'unsafe-inline', style-src 'self'",
        ),
      ).toBe(true);
    });

    it("detects unsafe-inline after an unspaced comma", () => {
      expect(
        cspContainsUnsafeInline(
          "script-src 'self','unsafe-inline'",
        ),
      ).toBe(true);
    });

    it("detects unsafe-inline before an unspaced comma", () => {
      expect(
        cspContainsUnsafeInline(
          "script-src 'unsafe-inline','self'",
        ),
      ).toBe(true);
    });

    it("detects unsafe-inline with surrounding whitespace", () => {
      expect(
        cspContainsUnsafeInline(
          "script-src   'unsafe-inline'   ",
        ),
      ).toBe(true);
    });

    it("does not detect unrelated CSP values", () => {
      expect(
        cspContainsUnsafeInline("script-src 'self'"),
      ).toBe(false);

      expect(
        cspContainsUnsafeInline("script-src 'unsafe-eval'"),
      ).toBe(false);

      expect(
        cspContainsUnsafeInline("style-src 'self'"),
      ).toBe(false);
    });

    it("does not match unquoted unsafe-inline", () => {
      expect(
        cspContainsUnsafeInline("script-src unsafe-inline"),
      ).toBe(false);
    });

    it("does not match unsafe-inline as part of another token", () => {
      expect(
        cspContainsUnsafeInline(
          "script-src 'unsafe-inline-value'",
        ),
      ).toBe(false);

      expect(
        cspContainsUnsafeInline(
          "script-src 'not-unsafe-inline'",
        ),
      ).toBe(false);
    });
  });

  describe("validateStrictContentSecurityPolicy", () => {
    it("rejects unsafe-inline", () => {
      const findings = validateStrictContentSecurityPolicy(
        "default-src 'self'; script-src 'unsafe-inline'",
      );

      expect(findings).toContain(
        "CSP must not contain 'unsafe-inline'.",
      );
    });

    it("rejects unsafe-inline after an unspaced comma", () => {
      const findings = validateStrictContentSecurityPolicy(
        "script-src 'nonce-script' 'self','unsafe-inline'; style-src 'nonce-style'",
      );

      expect(findings).toContain(
        "CSP must not contain 'unsafe-inline'.",
      );
    });

    it("rejects uppercase unsafe-inline", () => {
      const findings = validateStrictContentSecurityPolicy(
        "script-src 'nonce-script' 'UNSAFE-INLINE'; style-src 'nonce-style'",
      );

      expect(findings).toContain(
        "CSP must not contain 'unsafe-inline'.",
      );
    });

    it("accepts additional sources after a style nonce", () => {
      const findings = validateStrictContentSecurityPolicy(
        "script-src 'self' 'nonce-script'; style-src 'nonce-style' 'self'",
      );

      expect(findings).not.toContain(
        "style-src should include a nonce.",
      );
    });

    it("accepts additional sources before a style nonce", () => {
      const findings = validateStrictContentSecurityPolicy(
        "script-src 'self' 'nonce-script'; style-src 'self' 'nonce-style'",
      );

      expect(findings).not.toContain(
        "style-src should include a nonce.",
      );
    });

    it("accepts whitespace before directive separators", () => {
      const findings = validateStrictContentSecurityPolicy(
        "script-src 'self' 'nonce-script' ; " +
          "style-src 'self' 'nonce-style' ; " +
          "object-src 'none' ; " +
          "frame-ancestors 'none' ; " +
          "base-uri 'self' ;",
      );

      expect(findings).toEqual([]);
    });

    it("accepts a valid strict CSP with multiple sources", () => {
      const findings = validateStrictContentSecurityPolicy(
        "default-src 'self'; " +
          "script-src 'self' 'nonce-script' 'strict-dynamic'; " +
          "style-src 'self' 'nonce-style' https://example.com; " +
          "object-src 'none'; " +
          "frame-ancestors 'none'; " +
          "base-uri 'self'",
      );

      expect(findings).toEqual([]);
    });

    it("reports missing script nonce", () => {
      const findings = validateStrictContentSecurityPolicy(
        "style-src 'self' 'nonce-style'; " +
          "object-src 'none'; " +
          "frame-ancestors 'none'; " +
          "base-uri 'self'",
      );

      expect(findings).toContain(
        "script-src should include a nonce.",
      );
    });

    it("reports missing style nonce", () => {
      const findings = validateStrictContentSecurityPolicy(
        "script-src 'self' 'nonce-script'; " +
          "object-src 'none'; " +
          "frame-ancestors 'none'; " +
          "base-uri 'self'",
      );

      expect(findings).toContain(
        "style-src should include a nonce.",
      );
    });

    it("reports an unlocked object source", () => {
      const findings = validateStrictContentSecurityPolicy(
        "script-src 'self' 'nonce-script'; " +
          "style-src 'self' 'nonce-style'; " +
          "object-src 'self'; " +
          "frame-ancestors 'none'; " +
          "base-uri 'self'",
      );

      expect(findings).toContain(
        "object-src should be locked down to 'none'.",
      );
    });

    it("reports an unlocked frame ancestors policy", () => {
      const findings = validateStrictContentSecurityPolicy(
        "script-src 'self' 'nonce-script'; " +
          "style-src 'self' 'nonce-style'; " +
          "object-src 'none'; " +
          "frame-ancestors 'self'; " +
          "base-uri 'self'",
      );

      expect(findings).toContain(
        "frame-ancestors should be locked down to 'none'.",
      );
    });

    it("reports an unlocked base URI policy", () => {
      const findings = validateStrictContentSecurityPolicy(
        "script-src 'self' 'nonce-script'; " +
          "style-src 'self' 'nonce-style'; " +
          "object-src 'none'; " +
          "frame-ancestors 'none'; " +
          "base-uri https://example.com",
      );

      expect(findings).toContain(
        "base-uri should be locked down to 'self'.",
      );
    });
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

  it("does not use Math.random for nonce generation", () => {
    const mathRandomSpy = vi.spyOn(Math, "random");

    try {
      createCspNonce();

      expect(mathRandomSpy).not.toHaveBeenCalled();
    } finally {
      mathRandomSpy.mockRestore();
    }
  });

  it("throws an explicit error when no CSPRNG is available", () => {
    const originalCrypto = globalThis.crypto;

    Object.defineProperty(globalThis, "crypto", {
      value: {
        getRandomValues: undefined,
      },
      configurable: true,
    });

    try {
      expect(() => createCspNonce()).toThrow(
        "CSPRNG not available",
      );
    } finally {
      Object.defineProperty(globalThis, "crypto", {
        value: originalCrypto,
        configurable: true,
      });
    }
  });

  it("builds companion security headers", () => {
    const headers = buildSecurityHeaders({
      nonce: "header-nonce",
    });

    expect(headers["Content-Security-Policy"]).toContain(
      "nonce-header-nonce",
    );
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Permissions-Policy"]).toContain(
      "camera=()",
    );
  });

  it("builds manual verification checklist", () => {
    const checklist = buildCspManualChecklist();

    expect(checklist).toContain(
      "Confirm the CSP header does not contain 'unsafe-inline'.",
    );
    expect(
      checklist.some((item) => item.includes("script-src")),
    ).toBe(true);
  });
});