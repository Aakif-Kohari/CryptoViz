export type CertificateValidationStep = {
  id: string;
  title: string;
  description: string;
  concept: string;
  reference: string;
};

export const certificateValidationSteps: CertificateValidationStep[] = [
  {
    id: "end-entity",
    title: "End-Entity Certificate",
    description:
      "The end-entity certificate identifies the server and contains its public key, issuer, validity period, and other X.509 information.",
    concept: "X.509 Certificate",
    reference: "RFC 5280",
  },
  {
    id: "chain-building",
    title: "Build the Certificate Chain",
    description:
      "The issuer information is used to find the certificate that issued the current certificate. This process continues through intermediate certificates toward a trusted root.",
    concept: "Certification Path Building",
    reference: "RFC 4158",
  },
  {
    id: "signature-verification",
    title: "Verify Certificate Signatures",
    description:
      "Each certificate's signature is verified using the public key of its issuer. This establishes that the certificate was signed by the claimed issuer.",
    concept: "Digital Signature Verification",
    reference: "RFC 5280",
  },
  {
    id: "validity-period",
    title: "Check Validity Period",
    description:
      "The certificate must be used within the validity period specified by its Not Before and Not After fields.",
    concept: "Certificate Validity",
    reference: "RFC 5280",
  },
  {
    id: "ca-constraints",
    title: "Check CA Constraints",
    description:
      "CA certificates are checked for constraints such as basicConstraints and appropriate key usage before they can be used to validate certificates below them.",
    concept: "Basic Constraints & Key Usage",
    reference: "RFC 5280",
  },
  {
    id: "trust-anchor",
    title: "Check the Trust Anchor",
    description:
      "The certification path must terminate at a trust anchor that is trusted by the system or application performing validation.",
    concept: "Trust Anchor",
    reference: "RFC 5280",
  },
  {
    id: "validation-result",
    title: "Validation Result",
    description:
      "When the required checks succeed, the certification path satisfies the validation requirements and can be accepted according to the applicable policy.",
    concept: "Certification Path Validation",
    reference: "RFC 5280",
  },
];