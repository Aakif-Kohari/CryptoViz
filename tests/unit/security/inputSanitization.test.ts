import { describe, expect, it } from "vitest";
import {
  buildSanitizationChecklist,
  escapeHtml,
  sanitizeHexInput,
  sanitizeIdentifier,
  sanitizeMarkdown,
  sanitizePlainText,
  sanitizeRecord,
  sanitizeSearchQuery,
  sanitizeUrl,
  sanitizeUserInput,
  sanitizedValue,
  stripControlCharacters,
} from "../../../lib/security/inputSanitization";

describe("shared input sanitization", () => {
  it("escapes HTML-sensitive characters", () => {
    expect(escapeHtml(`<img src=x onerror=alert(1)>`)).toBe(
      "&lt;img src=x onerror=alert(1)&gt;",
    );
  });

  it("strips control characters while preserving optional newlines", () => {
    expect(stripControlCharacters("hello\u0000\tworld\nagain")).toBe("hello world again");
    expect(stripControlCharacters("hello\r\nworld", true)).toBe("hello\nworld");
  });

  it("sanitizes plain text with trimming and whitespace collapse", () => {
    const result = sanitizePlainText("  hello   <b>world</b>  ");

    expect(result.value).toBe("hello &lt;b&gt;world&lt;/b&gt;");
    expect(result.changed).toBe(true);
  });

  it("truncates plain text and reports warning", () => {
    const result = sanitizePlainText("abcdef", { maxLength: 3 });

    expect(result.value).toBe("abc");
    expect(result.warnings).toContain("Input was truncated to 3 characters.");
  });

  it("sanitizes search queries", () => {
    const result = sanitizeSearchQuery("  lattice   <script>  ", 80);

    expect(result.value).toContain("lattice");
    expect(result.value).not.toContain("<");
    expect(result.value).not.toContain(">");
  });

  it("sanitizes hex input before cipher helpers use it", () => {
    const result = sanitizeHexInput("0x 00 11 zz aa");

    expect(result.value).toBe("0011AA");
    expect(result.warnings).toContain("Non-hexadecimal characters were removed.");
  });

  it("sanitizes identifiers", () => {
    expect(sanitizeIdentifier("  My Unsafe/Identifier!  ").value).toBe("My-Unsafe-Identifier-");
    expect(sanitizeIdentifier("!!!").warnings).toContain("Identifier became empty after sanitization.");
  });

  it("sanitizes URLs and rejects dangerous protocols", () => {
    expect(sanitizeUrl("https://example.com/path#secret").value).toBe("https://example.com/path");
    expect(sanitizeUrl("javascript:alert(1)").value).toBe("");
    expect(sanitizeUrl("javascript:alert(1)").warnings[0]).toMatch(/not allowed/i);
  });

  it("neutralizes dangerous markdown links and raw HTML", () => {
    const result = sanitizeMarkdown("[click](javascript:alert(1))\n<script>alert(1)</script>");

    expect(result.value).toContain("[click](#)");
    expect(result.value).not.toMatch(/script/i);
  });

  it("routes through sanitizeUserInput by kind", () => {
    expect(sanitizeUserInput("0x ab cd", { kind: "hex" }).value).toBe("ABCD");
    expect(sanitizeUserInput("Hello <x>", { kind: "plain-text" }).value).toBe("Hello &lt;x&gt;");
    expect(sanitizeUserInput("Find <x>", { kind: "search" }).value).not.toContain("<");
  });

  it("sanitizes records using field schema", () => {
    const result = sanitizeRecord(
      {
        query: "  lattice <x> ",
        block: "0x 00 gg 11",
      },
      {
        query: { kind: "search" },
        block: { kind: "hex" },
      },
    );

    expect(result.query.value).toBe("lattice x");
    expect(result.block.value).toBe("0011");
  });

  it("returns only the sanitized value when requested", () => {
    expect(sanitizedValue("<hello>", { kind: "plain-text" })).toBe("&lt;hello&gt;");
  });

  it("builds integration checklist", () => {
    const checklist = buildSanitizationChecklist();

    expect(checklist).toContain("Use sanitizeHexInput before passing values into cipher or hash helpers.");
    expect(checklist.some((item) => item.includes("sanitizeRecord"))).toBe(true);
  });
});
