export interface Standard {
  id: string;
  title: string;
  organization: string;
  category: string;
  description: string;
  reference: string;
}

export const standards: Standard[] = [
  {
    id: "fips-197",
    title: "FIPS 197 - Advanced Encryption Standard (AES)",
    organization: "NIST",
    category: "Encryption",
    description: "Defines the AES symmetric encryption standard.",
    reference: "https://csrc.nist.gov/publications/detail/fips/197/final",
  },
  {
    id: "fips-180-4",
    title: "FIPS 180-4 - Secure Hash Standard",
    organization: "NIST",
    category: "Hashing",
    description: "Defines SHA-1 and SHA-2 family hash functions.",
    reference: "https://csrc.nist.gov/publications/detail/fips/180/4/final",
  },
  {
    id: "rfc8446",
    title: "RFC 8446 - TLS 1.3",
    organization: "IETF",
    category: "Protocols",
    description: "Defines the TLS 1.3 protocol.",
    reference: "https://www.rfc-editor.org/rfc/rfc8446",
  },
  {
    id: "rfc5869",
    title: "RFC 5869 - HKDF",
    organization: "IETF",
    category: "Key Derivation",
    description: "HMAC-based Extract-and-Expand Key Derivation Function.",
    reference: "https://www.rfc-editor.org/rfc/rfc5869",
  },
];