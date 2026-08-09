export interface HandshakeStep {
  id: number;
  title: string;
  description: string;
  clientMessage?: string;
  serverMessage?: string;
  encryption: string;
  rfc: string;
}

export const handshakeSteps: HandshakeStep[] = [
  {
    id: 1,
    title: "ClientHello",
    description:
      "The client initiates the handshake by sending supported TLS versions, cipher suites, extensions, and an ECDHE key share.",
    clientMessage: "ClientHello",
    encryption: "Not Encrypted",
    rfc: "RFC 8446 §4.1.2",
  },
  {
    id: 2,
    title: "ServerHello",
    description:
      "The server selects the TLS version, cipher suite, and returns its own key share.",
    serverMessage: "ServerHello",
    encryption: "Not Encrypted",
    rfc: "RFC 8446 §4.1.3",
  },
  {
    id: 3,
    title: "Handshake Keys",
    description:
      "Both parties derive shared secrets using ECDHE and generate handshake traffic keys with HKDF.",
    encryption: "Handshake Encryption",
    rfc: "RFC 8446 §7.1",
  },
  {
    id: 4,
    title: "Certificate",
    description:
      "The server sends its certificate chain to authenticate its identity.",
    serverMessage: "Certificate",
    encryption: "Encrypted",
    rfc: "RFC 8446 §4.4.2",
  },
  {
    id: 5,
    title: "Certificate Verify",
    description:
      "The server proves ownership of the private key associated with the certificate.",
    serverMessage: "CertificateVerify",
    encryption: "Encrypted",
    rfc: "RFC 8446 §4.4.3",
  },
  {
    id: 6,
    title: "Finished",
    description:
      "Both client and server verify that the handshake has not been modified.",
    clientMessage: "Finished",
    serverMessage: "Finished",
    encryption: "Encrypted",
    rfc: "RFC 8446 §4.4.4",
  },
  {
    id: 7,
    title: "Application Data",
    description:
      "The TLS handshake is complete. All application traffic is now protected using session keys.",
    encryption: "Fully Encrypted",
    rfc: "RFC 8446 §5",
  },
];