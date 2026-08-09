"use strict";

import type {
  HashAlgorithm,
  RainbowTableEntry,
  RainbowTableLookupResult,
  SaltedHashResult,
  RainbowTableStep,
} from "./types";

// ============================================================================
// DEFAULT DATA - Common passwords for demo rainbow table
// ============================================================================

export const DEFAULT_PASSWORDS = [
  "password",
  "123456",
  "qwerty",
  "admin",
  "letmein",
  "welcome",
  "monkey",
  "dragon",
  "123123",
  "password123",
  "iloveyou",
  "trustno1",
  "abc123",
  "sunshine",
  "master",
  "football",
  "shadow",
  "michael",
  "superman",
  "batman",
];

// ============================================================================
// HASH FUNCTIONS
// ============================================================================

/**
 * Compute simple hash for demonstration.
 * ⚠️ These are NOT cryptographically secure. For education only!
 */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Compute SHA-1 hash using built-in crypto.
 * ⚠️ SHA-1 is weak! For education only!
 */
async function sha1Hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Compute MD5-like hash (simplified, not real MD5).
 * ⚠️ This is a simplified demo, not actual MD5!
 */
function md5LikeHash(input: string): string {
  // Simple hash function that mimics MD5 output length
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  // Convert to hex string (32 characters like real MD5)
  const hex = Math.abs(hash).toString(16);
  return hex.padStart(32, "0").substring(0, 32);
}

/**
 * Universal hash function that supports different algorithms.
 * Returns synchronously for fast demo execution.
 */
export function computeHash(plaintext: string, algorithm: HashAlgorithm): string {
  if (!plaintext || typeof plaintext !== "string") {
    throw new Error("Plaintext must be a non-empty string");
  }

  try {
    if (algorithm === "sha1") {
      // For SHA-1, use simple hash (avoids async complexity)
      return simpleHash(plaintext);
    } else if (algorithm === "md5") {
      return md5LikeHash(plaintext);
    } else {
      throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
  } catch (err) {
    throw new Error(
      `Failed to compute hash: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}

/**
 * Compute hash with salt prepended.
 * Demonstrates why salts defeat rainbow tables.
 */
export function computeHashWithSalt(
  plaintext: string,
  salt: string,
  algorithm: HashAlgorithm
): string {
  if (!salt || typeof salt !== "string") {
    throw new Error("Salt must be a non-empty string");
  }

  const combined = salt + plaintext;
  return computeHash(combined, algorithm);
}

// ============================================================================
// RAINBOW TABLE CONSTRUCTION
// ============================================================================

/**
 * Build a rainbow table: Map from hash -> plaintext.
 * 
 * This represents an "offline" dictionary attack scenario where
 * an attacker has precomputed hashes of common passwords.
 * 
 * @returns Map<hash, plaintext> for O(1) lookup
 */
export function buildRainbowTable(
  passwords: string[],
  algorithm: HashAlgorithm
): Map<string, string> {
  // Validate input
  if (!Array.isArray(passwords) || passwords.length === 0) {
    throw new Error("Passwords array must not be empty");
  }

  if (passwords.length > 10000) {
    throw new Error("Table size limited to 10,000 passwords for performance");
  }

  const table = new Map<string, string>();

  // For each password, compute its hash and store the mapping
  for (const password of passwords) {
    if (typeof password !== "string" || password.length === 0) {
      continue; // Skip invalid entries
    }

    try {
      const hash = computeHash(password, algorithm);
      table.set(hash, password); // Map: hash -> plaintext
    } catch (err) {
      // Log but continue with other passwords
      console.warn(`Failed to hash password "${password}":`, err);
    }
  }

  return table;
}

// ============================================================================
// RAINBOW TABLE LOOKUP
// ============================================================================

/**
 * Look up a hash in the rainbow table.
 * 
 * This represents an attacker searching their precomputed table
 * for a stolen password hash.
 * 
 * Returns:
 * - found=true if hash is in table (password cracked!)
 * - found=false if hash is not in table (password safe)
 */
export function lookupInTable(
  targetHash: string,
  table: Map<string, string>
): RainbowTableLookupResult {
  // Validate input
  if (!targetHash || typeof targetHash !== "string") {
    throw new Error("Target hash is required and must be a string");
  }

  // Normalize hash
  const normalizedHash = targetHash.trim().toLowerCase();

  if (normalizedHash.length === 0) {
    throw new Error("Target hash cannot be empty");
  }

  // Measure lookup time
  const startTime =
    typeof performance !== "undefined" ? performance.now() : Date.now();

  // Search in table (O(1) operation!)
  const found = table.has(normalizedHash);
  const plaintext = found ? table.get(normalizedHash) ?? null : null;

  const endTime =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const lookupTime = endTime - startTime;

  return {
    found,
    plaintext,
    hash: normalizedHash,
    lookupTime,
    tableSize: table.size,
  };
}

// ============================================================================
// SALTING DEMONSTRATION
// ============================================================================

/**
 * Demonstrate why salting defeats rainbow tables.
 * 
 * Shows the same password with and without salt,
 * proving that salts break rainbow table attacks.
 */
export function demonstrateSalting(
  password: string,
  salt: string,
  algorithm: HashAlgorithm
): SaltedHashResult {
  // Validate inputs
  if (!password || typeof password !== "string") {
    throw new Error("Password is required");
  }

  if (!salt || typeof salt !== "string") {
    throw new Error("Salt is required");
  }

  // Compute both hashes
  const unsaltedHash = computeHash(password, algorithm);
  const saltedHash = computeHashWithSalt(password, salt, algorithm);

  // Create educational explanation
  const explanation =
    `Without salt, an attacker's rainbow table would instantly find this hash and crack the password. ` +
    `With salt "${salt.substring(0, 8)}...", the attacker needs a completely different rainbow table. ` +
    `For even modest salt sizes (128+ bits), precomputing all tables is computationally impossible!`;

  return {
    password,
    salt,
    unsaltedHash,
    saltedHash,
    explanation,
  };
}

// ============================================================================
// VISUALIZATION STEPS
// ============================================================================

/**
 * Create step-by-step visualization of the attack process.
 * Educational: helps users understand each stage.
 */
export function createAttackSteps(
  password: string,
  table: Map<string, string>,
  algorithm: HashAlgorithm
): RainbowTableStep[] {
  const steps: RainbowTableStep[] = [];

  // Step 1: Show the password being searched
  steps.push({
    stepNumber: 1,
    title: "Attacker has a stolen password hash",
    description: `The attacker obtained this hash from a stolen database: "${password}"`,
    data: { password },
  });

  // Step 2: Compute what we're looking for
  try {
    const hash = computeHash(password, algorithm);
    steps.push({
      stepNumber: 2,
      title: "Compute target hash",
      description: `Hashing the password gives: ${hash}`,
      data: { hash, algorithm },
    });

    // Step 3: Search the table
    const startTime =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const found = table.has(hash);
    const endTime =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    steps.push({
      stepNumber: 3,
      title: "Search precomputed table",
      description: `Searching through ${table.size} precomputed hashes took ${(endTime - startTime).toFixed(2)}ms...`,
      data: {
        tableSize: table.size,
        found,
        lookupTimeMs: endTime - startTime,
      },
    });

    // Step 4: Result
    if (found) {
      const cracked = table.get(hash);
      steps.push({
        stepNumber: 4,
        title: "✗ Password cracked!",
        description: `Found in table! Original password was: "${cracked}"`,
        data: { cracked },
      });
    } else {
      steps.push({
        stepNumber: 4,
        title: "✓ Password not in table",
        description: `This hash was not precomputed. Rainbow table attack failed!`,
        data: {},
      });
    }
  } catch (err) {
    steps.push({
      stepNumber: 2,
      title: "Error",
      description: `Failed to compute hash: ${err instanceof Error ? err.message : "Unknown error"}`,
      data: {},
    });
  }

  return steps;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a random hex salt for demonstration.
 * In production, use crypto.getRandomValues() with proper entropy.
 */
export function generateRandomSalt(bytes: number = 16): string {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert error to user-friendly message.
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Known error types
    if (error.message.includes("Target hash")) {
      return "Please provide a hash to search for.";
    }
    if (error.message.includes("algorithm")) {
      return "Invalid algorithm selected. Please choose SHA-1 or MD5.";
    }
    if (error.message.includes("empty")) {
      return "Password and salt cannot be empty.";
    }
    // Return original message if it's already user-friendly
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

/**
 * Validate password input.
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password must be a string" };
  }

  if (password.length === 0) {
    return { valid: false, error: "Password cannot be empty" };
  }

  if (password.length > 1000) {
    return { valid: false, error: "Password is too long (max 1000 characters)" };
  }

  return { valid: true };
}

/**
 * Validate algorithm selection.
 */
export function validateAlgorithm(algorithm: string): { valid: boolean; error?: string } {
  if (algorithm !== "sha1" && algorithm !== "md5") {
    return { valid: false, error: "Algorithm must be 'sha1' or 'md5'" };
  }

  return { valid: true };
}