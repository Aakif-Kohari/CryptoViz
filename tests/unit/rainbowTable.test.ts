import { describe, it, expect, beforeEach } from "vitest";
import {
  buildRainbowTable,
  computeHash,
  computeHashWithSalt,
  lookupInTable,
  demonstrateSalting,
  generateRandomSalt,
  DEFAULT_PASSWORDS,
  getUserFriendlyErrorMessage,
  validatePassword,
  validateAlgorithm,
} from "@/lib/rainbowTable/rainbowTable";
import type { HashAlgorithm } from "@/lib/rainbowTable/types";

describe("Rainbow Table Algorithm", () => {
  // =========================================================================
  // HASH FUNCTION TESTS
  // =========================================================================

  describe("computeHash", () => {
    it("should compute hash consistently (deterministic)", () => {
      const hash1 = computeHash("password", "sha1");
      const hash2 = computeHash("password", "sha1");
      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different inputs", () => {
      const hash1 = computeHash("password1", "sha1");
      const hash2 = computeHash("password2", "sha1");
      expect(hash1).not.toBe(hash2);
    });

    it("should produce different results for different algorithms", () => {
      const sha1Hash = computeHash("test", "sha1");
      const md5Hash = computeHash("test", "md5");
      expect(sha1Hash).not.toBe(md5Hash);
    });

    it("should return hex string output", () => {
      const hash = computeHash("test", "sha1");
      expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    });

    it("should reject empty password", () => {
      expect(() => computeHash("", "sha1")).toThrow();
    });

    it("should reject non-string input", () => {
      expect(() => computeHash(null as any, "sha1")).toThrow();
    });

    it("should reject unsupported algorithms", () => {
      expect(() => computeHash("test", "invalid" as HashAlgorithm)).toThrow();
    });

    it("should handle special characters", () => {
      const hash1 = computeHash("!@#$%^&*()", "sha1");
      const hash2 = computeHash("normal", "sha1");
      expect(hash1).not.toBe(hash2);
    });

    it("should handle unicode characters", () => {
      const hash = computeHash("你好世界", "sha1");
      expect(hash).toBeTruthy();
      expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    });

    it("should handle very long passwords", () => {
      const longPassword = "a".repeat(1000);
      const hash = computeHash(longPassword, "sha1");
      expect(hash).toBeTruthy();
    });
  });

  describe("computeHashWithSalt", () => {
    it("should produce different hash when salt is added", () => {
      const unsalted = computeHash("password", "sha1");
      const salted = computeHashWithSalt("password", "salt123", "sha1");
      expect(unsalted).not.toBe(salted);
    });

    it("should produce different hashes for different salts", () => {
      const salted1 = computeHashWithSalt("password", "salt1", "sha1");
      const salted2 = computeHashWithSalt("password", "salt2", "sha1");
      expect(salted1).not.toBe(salted2);
    });

    it("should be deterministic with same salt", () => {
      const salted1 = computeHashWithSalt("password", "salt", "sha1");
      const salted2 = computeHashWithSalt("password", "salt", "sha1");
      expect(salted1).toBe(salted2);
    });

    it("should reject empty salt", () => {
      expect(() => computeHashWithSalt("password", "", "sha1")).toThrow();
    });

    it("should reject non-string salt", () => {
      expect(() => computeHashWithSalt("password", null as any, "sha1")).toThrow();
    });
  });

  // =========================================================================
  // RAINBOW TABLE BUILDING TESTS
  // =========================================================================

  describe("buildRainbowTable", () => {
    it("should create a table with correct size", () => {
      const passwords = ["password", "admin", "test"];
      const table = buildRainbowTable(passwords, "sha1");
      expect(table.size).toBe(3);
    });

    it("should map hash → plaintext correctly", () => {
      const passwords = ["password"];
      const table = buildRainbowTable(passwords, "sha1");

      const expectedHash = computeHash("password", "sha1");
      expect(table.has(expectedHash)).toBe(true);
      expect(table.get(expectedHash)).toBe("password");
    });

    it("should work with default passwords", () => {
      const table = buildRainbowTable(DEFAULT_PASSWORDS, "sha1");
      expect(table.size).toBe(DEFAULT_PASSWORDS.length);
    });

    it("should work with different algorithms", () => {
      const table1 = buildRainbowTable(DEFAULT_PASSWORDS, "sha1");
      const table2 = buildRainbowTable(DEFAULT_PASSWORDS, "md5");
      // Tables might have different sizes due to hash collisions
      expect(table1.size).toBeGreaterThan(0);
      expect(table2.size).toBeGreaterThan(0);
    });

    it("should reject empty password array", () => {
      expect(() => buildRainbowTable([], "sha1")).toThrow("must not be empty");
    });

    it("should reject oversized arrays", () => {
      const hugeArray = Array.from({ length: 50000 }, (_, i) => `pwd${i}`);
      expect(() => buildRainbowTable(hugeArray, "sha1")).toThrow("limited to 10,000");
    });

    it("should skip empty or invalid passwords", () => {
      const passwords = ["password", "", "admin", null as any];
      const table = buildRainbowTable(passwords, "sha1");
      // Should skip empty and null entries
      expect(table.size).toBe(2);
    });

    it("should handle duplicate passwords", () => {
      const passwords = ["password", "password", "admin"];
      const table = buildRainbowTable(passwords, "sha1");
      // Duplicates map to same hash, so table.size should be 2
      expect(table.size).toBe(2);
    });
  });

  // =========================================================================
  // LOOKUP TESTS
  // =========================================================================

  describe("lookupInTable", () => {
    let table: Map<string, string>;
    let knownHash: string;

    beforeEach(() => {
      const passwords = ["password", "admin", "test"];
      table = buildRainbowTable(passwords, "sha1");
      knownHash = computeHash("password", "sha1");
    });

    it("should find existing hash", () => {
      const result = lookupInTable(knownHash, table);

      expect(result.found).toBe(true);
      expect(result.plaintext).toBe("password");
    });

    it("should not find unknown hash", () => {
      const result = lookupInTable("0000000000000000000000000000", table);

      expect(result.found).toBe(false);
      expect(result.plaintext).toBe(null);
    });

    it("should normalize hash (uppercase)", () => {
      const upperHash = knownHash.toUpperCase();
      const result = lookupInTable(upperHash, table);

      expect(result.found).toBe(true);
    });

    it("should normalize hash (with spaces)", () => {
      const spacedHash = `  ${knownHash}  `;
      const result = lookupInTable(spacedHash, table);

      expect(result.found).toBe(true);
    });

    it("should measure lookup time", () => {
      const result = lookupInTable(knownHash, table);

      expect(result.lookupTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.lookupTime).toBe("number");
    });

    it("should include table size in result", () => {
      const result = lookupInTable(knownHash, table);

      expect(result.tableSize).toBe(3);
    });

    it("should include the searched hash in result", () => {
      const result = lookupInTable(knownHash, table);

      expect(result.hash).toBe(knownHash.toLowerCase());
    });

    it("should reject empty hash", () => {
      expect(() => lookupInTable("", table)).toThrow();
    });

    it("should reject non-string hash", () => {
      expect(() => lookupInTable(null as any, table)).toThrow();
    });

    it("should reject hash with only whitespace", () => {
      expect(() => lookupInTable("   ", table)).toThrow();
    });
  });

  // =========================================================================
  // SALTING TESTS
  // =========================================================================

  describe("demonstrateSalting", () => {
    it("should produce different hashes with/without salt", () => {
      const result = demonstrateSalting("password", "salt123", "sha1");

      expect(result.unsaltedHash).not.toBe(result.saltedHash);
    });

    it("should include explanation text", () => {
      const result = demonstrateSalting("password", "salt", "sha1");

      expect(result.explanation).toBeTruthy();
      expect(result.explanation.length).toBeGreaterThan(0);
      expect(result.explanation).toContain("salt");
    });

    it("should preserve password and salt in result", () => {
      const result = demonstrateSalting("mypassword", "mysalt", "sha1");

      expect(result.password).toBe("mypassword");
      expect(result.salt).toBe("mysalt");
    });

    it("should reject missing password", () => {
      expect(() => demonstrateSalting("", "salt", "sha1")).toThrow("Password is required");
    });

    it("should reject missing salt", () => {
      expect(() => demonstrateSalting("password", "", "sha1")).toThrow(
        "Salt is required"
      );
    });

    it("should work with different algorithms", () => {
      const result1 = demonstrateSalting("password", "salt", "sha1");
      const result2 = demonstrateSalting("password", "salt", "md5");

      // Both should produce different unsalted and salted hashes
      expect(result1.unsaltedHash).not.toBe(result1.saltedHash);
      expect(result2.unsaltedHash).not.toBe(result2.saltedHash);
    });
  });

  // =========================================================================
  // INTEGRATION TESTS
  // =========================================================================

  describe("Full Attack Scenario", () => {
    it("should simulate a successful rainbow table attack", () => {
      // Attacker builds table
      const table = buildRainbowTable(DEFAULT_PASSWORDS, "sha1");

      // User chooses password in the table
      const userPassword = "password";
      const userHash = computeHash(userPassword, "sha1");

      // Attacker looks it up
      const result = lookupInTable(userHash, table);

      expect(result.found).toBe(true);
      expect(result.plaintext).toBe(userPassword);
    });

    it("should simulate rainbow table defense with salt", () => {
      // Build table
      const table = buildRainbowTable(DEFAULT_PASSWORDS, "sha1");

      // User password (in table)
      const userPassword = "password";

      // But user's password is salted before storage
      const salt = generateRandomSalt();
      const saltedDemo = demonstrateSalting(userPassword, salt, "sha1");

      // Attacker tries original hash (table hit)
      const unsaltedResult = lookupInTable(saltedDemo.unsaltedHash, table);
      expect(unsaltedResult.found).toBe(true); // Would be cracked without salt!

      // But attacker has salted hash (table miss!)
      const saltedResult = lookupInTable(saltedDemo.saltedHash, table);
      expect(saltedResult.found).toBe(false); // Salt defeats the attack!
    });

    it("should work through complete flow", () => {
      // Setup
      const passwords = ["admin", "test123", "password"];
      const table = buildRainbowTable(passwords, "sha1");
      const targetPassword = "admin";

      // Compute hash
      const hash = computeHash(targetPassword, "sha1");

      // Lookup
      const lookup = lookupInTable(hash, table);

      // Verify
      expect(lookup.found).toBe(true);
      expect(lookup.plaintext).toBe(targetPassword);
      expect(lookup.tableSize).toBe(3);

      // Show salting
      const salt = generateRandomSalt();
      const salted = demonstrateSalting(targetPassword, salt, "sha1");

      expect(salted.unsaltedHash).toBe(lookup.hash);
      expect(salted.saltedHash).not.toBe(lookup.hash);
    });
  });

  // =========================================================================
  // UTILITY TESTS
  // =========================================================================

  describe("generateRandomSalt", () => {
    it("should generate random salts", () => {
      const salt1 = generateRandomSalt();
      const salt2 = generateRandomSalt();

      expect(salt1).toBeTruthy();
      expect(salt2).toBeTruthy();
      expect(salt1).not.toBe(salt2); // Should be different
    });

    it("should generate hex format salts", () => {
      const salt = generateRandomSalt();
      expect(/^[a-f0-9]+$/.test(salt)).toBe(true);
    });

    it("should allow configurable salt length", () => {
      const salt8 = generateRandomSalt(8);
      const salt16 = generateRandomSalt(16);

      expect(salt8.length).toBe(16); // 8 bytes = 16 hex chars
      expect(salt16.length).toBe(32); // 16 bytes = 32 hex chars
    });

    it("should generate cryptographically random values", () => {
      const salts = Array.from({ length: 10 }, () => generateRandomSalt());
      const uniqueSalts = new Set(salts);

      expect(uniqueSalts.size).toBe(10); // All should be unique
    });
  });

  describe("getUserFriendlyErrorMessage", () => {
    it("should convert hash errors", () => {
      const error = new Error("Target hash is required");
      const message = getUserFriendlyErrorMessage(error);

      expect(message).toContain("hash");
      expect(message).not.toContain("Target");
    });

    it("should convert algorithm errors", () => {
      const error = new Error("Unsupported algorithm");
      const message = getUserFriendlyErrorMessage(error);

      expect(message).toContain("algorithm");
    });

    it("should convert empty errors", () => {
      const error = new Error("Cannot be empty");
      const message = getUserFriendlyErrorMessage(error);

      expect(message).toContain("empty");
    });

    it("should return original message if not recognized", () => {
      const error = new Error("Some custom error");
      const message = getUserFriendlyErrorMessage(error);

      expect(message).toBe("Some custom error");
    });

    it("should handle non-Error objects", () => {
      const message = getUserFriendlyErrorMessage("plain string");

      expect(message).toBe("Something went wrong. Please try again.");
    });
  });

  describe("validatePassword", () => {
    it("should accept valid password", () => {
      const result = validatePassword("password123");

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject empty password", () => {
      const result = validatePassword("");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Password must be a string");
    });

    it("should reject non-string password", () => {
      const result = validatePassword(null as any);

      expect(result.valid).toBe(false);
    });

    it("should reject very long password", () => {
      const longPassword = "a".repeat(2000);
      const result = validatePassword(longPassword);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("too long");
    });
  });

  describe("validateAlgorithm", () => {
    it("should accept sha1", () => {
      const result = validateAlgorithm("sha1");

      expect(result.valid).toBe(true);
    });

    it("should accept md5", () => {
      const result = validateAlgorithm("md5");

      expect(result.valid).toBe(true);
    });

    it("should reject invalid algorithm", () => {
      const result = validateAlgorithm("invalid");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("must be");
    });
  });

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  describe("Edge Cases", () => {
    it("should handle empty table lookup", () => {
      const emptyTable = new Map<string, string>();
      const result = lookupInTable("anyHash", emptyTable);

      expect(result.found).toBe(false);
      expect(result.plaintext).toBe(null);
    });

    it("should handle case sensitivity correctly", () => {
      const hash1 = computeHash("Password", "sha1");
      const hash2 = computeHash("password", "sha1");

      expect(hash1).not.toBe(hash2);
    });

    it("should handle whitespace sensitivity", () => {
      const hash1 = computeHash("password ", "sha1");
      const hash2 = computeHash("password", "sha1");

      expect(hash1).not.toBe(hash2);
    });

    it("should handle numeric-looking passwords", () => {
      const hash = computeHash("12345", "sha1");
      expect(hash).toBeTruthy();
      expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    });
  });
});