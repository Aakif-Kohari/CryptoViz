// Algorithm options for hashing
export type HashAlgorithm = "sha1" | "md5";

// A single entry in the rainbow table (hash → plaintext mapping)
export interface RainbowTableEntry {
  plaintext: string;
  hash: string;
}

// Result of looking up a hash in the rainbow table
export interface RainbowTableLookupResult {
  found: boolean;
  plaintext: string | null; 
  hash: string; 
  lookupTime: number;
  tableSize: number; 
}

// Result of demonstrating salting defense
export interface SaltedHashResult {
  password: string;
  salt: string;
  unsaltedHash: string; 
  saltedHash: string; 
  explanation: string;
}

// Visualization step for educational purposes
export interface RainbowTableStep {
  stepNumber: number;
  title: string;
  description: string;
  data?: Record<string, any>;
}

// Error handling
export interface RainbowTableError {
  code: string;
  message: string;
  userFriendlyMessage: string;
}