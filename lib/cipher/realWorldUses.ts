export interface UseCategory {
  title: string;
  items: string[];
}

export const REAL_WORLD_USES: Record<string, UseCategory[]> = {
  aes: [
    {
      title: "🌐 Web Security",
      items: ["HTTPS / TLS", "VPNs", "SSL Certificates"],
    },
    {
      title: "💬 Secure Messaging",
      items: ["WhatsApp", "Signal", "Telegram Secret Chats"],
    },
    {
      title: "💾 Disk Encryption",
      items: ["BitLocker", "FileVault", "LUKS"],
    },
    {
      title: "☁️ Cloud Services",
      items: ["AWS KMS", "Azure Key Vault", "Google Cloud KMS"],
    },
  ],

  rsa: [
    {
      title: "🔐 Public Key Infrastructure",
      items: [
        "HTTPS Certificates",
        "Digital Signatures",
        "SSH Authentication",
      ],
    },
  ],

  des: [
    {
      title: "📚 Legacy Systems",
      items: [
        "Older Banking Systems",
        "Legacy POS Devices",
        "Educational Demonstrations",
      ],
    },
  ],

  "3des": [
    {
      title: "🏦 Banking",
      items: [
        "EMV Smart Cards",
        "Payment Terminals",
        "ATM Networks",
      ],
    },
  ],

  sha256: [
    {
      title: "⛓ Blockchain",
      items: [
        "Bitcoin",
        "Git",
        "Certificate Fingerprints",
        "Password Hashing",
      ],
    },
  ],

  md5: [
    {
      title: "⚠ Legacy Usage",
      items: [
        "File Checksums",
        "Old Software Verification",
      ],
    },
  ],
};