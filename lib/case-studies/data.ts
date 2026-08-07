export type CaseStudySeverity = 'Critical' | 'High' | 'Medium' | 'Historical'

export type CaseStudyCategory =
  | 'RNG Flaw'
  | 'Implementation Bug'
  | 'Cryptanalytic Attack'
  | 'Malware / Ransomware'
  | 'CA / PKI Compromise'
  | 'Nonce Reuse'

export interface CaseStudy {
  id: string
  title: string
  subtitle: string
  year: number
  severity: CaseStudySeverity
  category: CaseStudyCategory
  affectedAlgorithms: string[]
  impact: string
  rootCause: string
  keyTakeaway: string
  summary: string
  timeline: { year: string; event: string }[]
  technicalBreakdown: string[]
  codeSnippet?: {
    language: string
    title: string
    code: string
  }
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'enigma',
    title: 'Enigma Machine Cryptanalysis',
    subtitle: 'Wartime rotor cipher breaking by Bletchley Park & Rejewski',
    year: 1939,
    severity: 'Historical',
    category: 'Cryptanalytic Attack',
    affectedAlgorithms: ['Enigma Rotor Cipher', 'Polyalphabetic Substitution'],
    impact:
      'Shortened World War II by an estimated 2 to 4 years, saving millions of lives by decrypting Axis naval and military communications.',
    rootCause:
      'Design flaw where a letter could never encrypt to itself (E(x) ≠ x), combined with operator habit patterns (cillies), predictable cribs (weather reports), and rotor stepping weakness.',
    keyTakeaway:
      'Avoid structural mathematical invariants (like E(x) ≠ x) in cipher design. Never rely on physical secrecy or operator discipline alone.',
    summary:
      'The Enigma machine was an electro-mechanical rotor cipher used by the German military. Marian Rejewski, Alan Turing, Gordon Welchman, and Bletchley Park team exploited mathematical invariants and operator cribs to build the Bombe electromechanical cryptanalysis machine.',
    timeline: [
      { year: '1918', event: 'Arthur Scherbius patents the Enigma commercial rotor machine.' },
      { year: '1932', event: 'Polish cryptanalyst Marian Rejewski uses group theory to reconstruct Enigma rotor wiring.' },
      { year: '1939', event: 'Poland shares Enigma reverse-engineering blueprints with Britain and France.' },
      { year: '1940', event: 'Alan Turing designs the electromechanical Bombe machine at Bletchley Park to automate crib searching.' },
      { year: '1945', event: 'Allied forces decrypt thousands of Axis military transmissions daily (Operation Ultra).' },
    ],
    technicalBreakdown: [
      'Invariant Property: The reflector (Umkehrwalze) ensured encryption was self-inverse, but prevented any character from ever mapping to itself.',
      'Crib Exploitation: Predictable German military message formats (e.g. "OBERKOMMANDO DER WEHRMACHT" or morning weather forecasts) provided known-plaintext samples.',
      'The Bombe Machine: Used logical deduction menus based on rotor cycles to test all possible rotor positions simultaneously, instantly rejecting contradictions.',
    ],
    codeSnippet: {
      language: 'python',
      title: 'Enigma Invariant Flaw (E(x) != x)',
      code: `def enigma_encrypt_char(char, rotors, reflector, plugboard):
    # Enigma reflector guarantees E(x) != x
    encrypted = pass_through_rotors(char, rotors, reflector, plugboard)
    assert encrypted != char, "Enigma can NEVER map a character to itself!"
    return encrypted`,
    },
  },
  {
    id: 'heartbleed',
    title: 'Heartbleed OpenSSL Vulnerability',
    subtitle: 'CVE-2014-0160: Missing buffer bounds check in TLS Heartbeat',
    year: 2014,
    severity: 'Critical',
    category: 'Implementation Bug',
    affectedAlgorithms: ['TLS 1.2 Heartbeat Extension', 'OpenSSL Memory Management'],
    impact:
      'Exposed private RSA keys, user passwords, session tokens, and credit card numbers from over 17% of secured internet web servers.',
    rootCause:
      'OpenSSL failed to check whether the payload length declared in an incoming TLS Heartbeat request matched the actual buffer size, echoing back up to 64KB of contiguous process heap memory.',
    keyTakeaway:
      'Always validate memory allocation bounds and payload length fields against actual buffer sizes. Use memory-safe programming languages (Rust) or rigorous static analysis.',
    summary:
      'Discovered in April 2014, Heartbleed was a catastrophic vulnerability in OpenSSL 1.0.1. An attacker could craft a 1-byte payload with a claimed length of 65,535 bytes, prompting OpenSSL to copy 64KB of secret memory back to the client.',
    timeline: [
      { year: '2011', event: 'TLS Heartbeat extension RFC 6520 implemented in OpenSSL source code.' },
      { year: '2014-04-01', event: 'Vulnerability discovered independently by Codenotary / Neel Mehta (Google Security).' },
      { year: '2014-04-07', event: 'Public disclosure of CVE-2014-0160 and emergency OpenSSL 1.0.1g patch release.' },
      { year: '2014-04-09', event: 'Mass revocation of SSL/TLS certificates worldwide.' },
    ],
    technicalBreakdown: [
      'Missing Bounds Check: `memcpy(bp, pl, payload)` executed without checking if `payload <= actual_buffer_bytes`.',
      'Memory Exposure: OpenSSL used a custom freelist memory pool (`freelist`), so heap allocations contained recently freed private keys, passwords, and cookies.',
      'Silent Exploitation: Attacks left no footprint in server error logs because valid Heartbeat responses were sent without crashing the process.',
    ],
    codeSnippet: {
      language: 'c',
      title: 'Vulnerable OpenSSL Heartbeat Implementation (C)',
      code: `/* Vulnerable code in ssl/t1_lib.c */
hbtype = *p++;
n2s(p, payload); // Unchecked 16-bit payload length provided by attacker!
ptls2 = p;

/* Missing check: if (1 + 2 + payload + 16 > s->s3->rrec.length) return 0; */

buffer = OPENSSL_malloc(1 + 2 + payload + padding);
bp = buffer;

/* Over-reads 64KB of server heap memory! */
memcpy(bp, pl, payload);`,
    },
  },
  {
    id: 'wannacry',
    title: 'WannaCry Ransomware Outbreak',
    subtitle: 'Global ransomware weaponizing EternalBlue & AES-128/RSA-2048',
    year: 2017,
    severity: 'Critical',
    category: 'Malware / Ransomware',
    affectedAlgorithms: ['AES-128-CBC', 'RSA-2048', 'SMBv1 Remote Code Execution'],
    impact:
      'Infected 200,000+ computers across 150 countries, crippling the UK National Health Service (NHS), FedEx, and Deutsche Bahn.',
    rootCause:
      'Exploited SMBv1 vulnerability (MS17-010 / EternalBlue) to spread autonomously across internal networks, encrypting user files with AES-128 and protecting the key with a master RSA-2048 public key.',
    keyTakeaway:
      'Disable legacy network protocols (SMBv1), enforce automatic security patching, and maintain immutable offline backups.',
    summary:
      'WannaCry was a self-propagating worm and ransomware strain that hit global networks in May 2017. It generated a unique AES key per file, encrypted the file, and encrypted the AES key using an embedded RSA-2048 public key.',
    timeline: [
      { year: '2017-03-14', event: 'Microsoft releases security bulletin MS17-010 patching SMBv1.' },
      { year: '2017-04-14', event: 'Shadow Brokers leak NSA EternalBlue exploit tool.' },
      { year: '2017-05-12', event: 'WannaCry outbreak begins globally, encrypting NHS hospital systems.' },
      { year: '2017-05-12', event: 'Security researcher Marcus Hutchins (MalwareTech) registers kill-switch domain to halt worm spread.' },
    ],
    technicalBreakdown: [
      'Hybrid Encryption Architecture: Encrypted files with AES-128-CBC. Each file key was encrypted using a local RSA-2048 public key generated per infected host.',
      'Master Public Key: Local RSA keypair private component was encrypted with hardcoded master attacker RSA-2048 public key.',
      'Worm Mechanism: Scanned random public IP addresses and internal subnets on TCP port 445 (SMB) to inject EternalBlue payload.',
    ],
    codeSnippet: {
      language: 'c',
      title: 'WannaCry Cryptographic Flow (Pseudocode)',
      code: `// Generate 128-bit random AES key per file
CryptGenRandom(hProv, 16, aes_key);

// Encrypt file contents with AES-128-CBC
AES_encrypt_file(target_file, aes_key);

// Encrypt AES key with local host RSA-2048 public key
RSA_public_encrypt(16, aes_key, encrypted_aes_key, hLocalRsaPubKey);`,
    },
  },
  {
    id: 'debian-openssl',
    title: 'Debian OpenSSL PRNG Predictability Bug',
    subtitle: 'CVE-2008-0166: 32,768 total possible SSH & SSL keys across Debian',
    year: 2008,
    severity: 'Critical',
    category: 'RNG Flaw',
    affectedAlgorithms: ['OpenSSL PRNG', 'RSA Keygen', 'DSA Signatures', 'SSH Keys'],
    impact:
      'All SSH, SSL/TLS, and OpenVPN keys generated on Debian, Ubuntu, and derivative Linux distros between 2006 and 2008 were completely predictable.',
    rootCause:
      'A maintainer removed two lines of code in OpenSSL (`MD_Update(&m, &buf, n)`) to fix Valgrind uninitialized memory warnings, eliminating uninitialized stack memory from the PRNG entropy pool.',
    keyTakeaway:
      'Never remove entropy sources from pseudo-random number generators without deep cryptographic review. Static analysis tools must understand intentional entropy gathering.',
    summary:
      'In May 2008, Debian announced that the PRNG in its OpenSSL package had been broken since September 2006. The only random seed remaining was the process ID (PID), capped at 32,768, allowing attackers to pre-compute all possible global keypairs.',
    timeline: [
      { year: '2006-05', event: 'Debian package maintainer removes Valgrind warning code lines from OpenSSL md_rand.c.' },
      { year: '2008-05-13', event: 'Luciano Bello discovers PRNG predictability; Debian issues DSA-1571 patch.' },
      { year: '2008-05-14', event: 'Security community publishes pre-generated lookup tables containing all 32,768 SSH key pairs.' },
    ],
    technicalBreakdown: [
      'Removed Entropy Code: `MD_Update(&m, &buf, n);` was commented out because Valgrind flagged reading uninitialized stack memory as a warning.',
      'PID Entropy Collapse: The PRNG state depended solely on `getpid()`. On Linux, PIDs max out at 32,768 by default.',
      'Pre-computed Exploitation: Attackers generated pre-computed public key lookup tables and scanned SSH servers worldwide, gaining instant root shell access.',
    ],
    codeSnippet: {
      language: 'c',
      title: 'Fatal Code Removal in OpenSSL md_rand.c',
      code: `/* Commented out by Debian maintainer to quiet Valgrind: */
/* MD_Update(&m, &buf, n); */

/* Result: PRNG entropy pool initialized ONLY with process ID (0 to 32767) */
unsigned long pid = getpid();
MD_Update(&m, &pid, sizeof(pid));`,
    },
  },
  {
    id: 'stuxnet',
    title: 'Stuxnet & Stolen Digital Signatures',
    subtitle: 'State-sponsored cyber weapon bypassing Windows Driver Verification',
    year: 2010,
    severity: 'Critical',
    category: 'CA / PKI Compromise',
    affectedAlgorithms: ['VeriSign Code Signing', 'RSA-2048 Signatures', 'Driver Signing'],
    impact:
      'Physically destroyed 1,000+ centrifuges at Iran Natanz enrichment facility while remaining invisible to Windows driver security systems.',
    rootCause:
      'Stuxnet authors stole private signing keys belonging to Realtek Semiconductor and JMicron Technology to sign malicious kernel-mode drivers.',
    keyTakeaway:
      'Protect code signing private keys in Hardware Security Modules (HSMs). Revoke compromised certificates immediately via OCSP / CRL.',
    summary:
      'Stuxnet was a highly complex cyber weapon discovered in 2010. To bypass Windows 64-bit driver signature enforcement without alerting security administrators, it signed its kernel drivers using legitimate stolen digital certificates.',
    timeline: [
      { year: '2009', event: 'Stuxnet deployed targeting Siemens WinCC PLC systems in Iran.' },
      { year: '2010-06', event: 'VirusBlokAda discovers malware using valid Realtek digital certificate.' },
      { year: '2010-07', event: 'VeriSign revokes compromised Realtek and JMicron code signing certificates.' },
    ],
    technicalBreakdown: [
      'Stolen Private Keys: Attacker breached semiconductor companies in Hsinchu Science Park, Taiwan, stealing private keys.',
      'Windows Driver Signature Enforcement (DSE): Windows 64-bit requires all kernel drivers to have a valid PKI signature chain to Microsoft root CAs.',
      'Trusted Execution: Because certificates were validly signed, Windows loaded malicious rootkit drivers without warning dialogs.',
    ],
    codeSnippet: {
      language: 'text',
      title: 'Stuxnet Driver Certificate Properties',
      code: `Signer: Realtek Semiconductor Corp.
Issuer: VeriSign Class 3 Code Signing 2004 CA
Status: Valid (until revoked July 2010)
Algorithm: sha1WithRSAEncryption (RSA 2048-bit)`,
    },
  },
  {
    id: 'diginotar',
    title: 'DigiNotar Certificate Authority Breach',
    subtitle: 'Total compromise of Dutch CA issuing 500+ rogue wildcard SSL certs',
    year: 2011,
    severity: 'Critical',
    category: 'CA / PKI Compromise',
    affectedAlgorithms: ['X.509 PKI Hierarchy', 'RSA Digital Signatures', 'TLS Web Security'],
    impact:
      'Rogue *.google.com certificate was used to intercept web traffic of 300,000+ Iranian Internet users. DigiNotar declared bankruptcy.',
    rootCause:
      'Hackers compromised DigiNotar internal network servers, gained access to root CA private keys, and issued unauthorized SSL certificates for google.com, microsoft.com, and intelligence agencies.',
    keyTakeaway:
      'Implement HTTP Public Key Pinning (HPKP), Certificate Transparency (CT) logs, and strict multi-factor access for Root CAs.',
    summary:
      'In July 2011, attackers breached DigiNotar, a Dutch Certificate Authority. They issued rogue wildcard certificates for major domain names, allowing man-in-the-middle attacks on web users.',
    timeline: [
      { year: '2011-07-10', event: 'Rogue wildcard certificate for *.google.com issued by DigiNotar root CA.' },
      { year: '2011-08-27', event: 'Iranian user posts on Google forum reporting SSL warning in Chrome.' },
      { year: '2011-08-29', event: 'Google Chrome triggers hardcoded certificate pin violation.' },
      { year: '2011-09-03', event: 'Dutch government assumes control of DigiNotar; root CA revoked globally.' },
      { year: '2011-09-20', event: 'DigiNotar files for bankruptcy.' },
    ],
    technicalBreakdown: [
      'Wildcard Certificate Issuance: Issued `*.google.com` certificate matching all Google web services.',
      'Chrome Certificate Pinning: Chrome hardcoded Google domain public keys. When Chrome detected a DigiNotar-signed Google cert, it blocked the connection.',
      'Birth of Certificate Transparency: Event spurred RFC 6962 Certificate Transparency (CT) requiring public log auditability.',
    ],
    codeSnippet: {
      language: 'json',
      title: 'Rogue Certificate Audit Log Entry',
      code: `{
  "subject": "CN=*.google.com, O=Google Inc",
  "issuer": "CN=DigiNotar Root CA, O=DigiNotar",
  "validFrom": "2011-07-10T19:00:00Z",
  "fingerprintSHA1": "0A:6F:68:59:E8:29:F6:DA:5B:3F:8A:2F:E9:9D:4F"
}`,
    },
  },
  {
    id: 'sony-ps3',
    title: 'Sony PlayStation 3 ECDSA Nonce Reuse',
    subtitle: 'Derivation of master signing key via constant ECDSA nonce (k)',
    year: 2010,
    severity: 'Critical',
    category: 'Nonce Reuse',
    affectedAlgorithms: ['ECDSA (Elliptic Curve Digital Signature Algorithm)', 'Secp256k1 / Secp256r1'],
    impact:
      'Complete compromise of PS3 security architecture, allowing arbitrary homebrew code and custom firmware execution on all console hardware.',
    rootCause:
      'Sony developers hardcoded the random nonce parameter k in ECDSA signature generation to a static constant value across all system software updates.',
    keyTakeaway:
      'ECDSA nonces (k) MUST be cryptographically unique per signature, or derived deterministically via RFC 6979. Nonce reuse completely exposes the private key.',
    summary:
      'At 27C3 in December 2010, fail0verflow demonstrated that Sony used a constant value for the random nonce k in ECDSA code signatures. Given two signatures with the same nonce, simple algebra yields the master private key.',
    timeline: [
      { year: '2006', event: 'Sony releases PlayStation 3 featuring Hypervisor and ECDSA code signatures.' },
      { year: '2010-12-29', event: 'fail0verflow presents PS3 security breakdown at 27C3 conference.' },
      { year: '2011-01', event: 'Geohot publishes PS3 master private root key online.' },
    ],
    technicalBreakdown: [
      'ECDSA Equation: Signature consists of $r = (k \cdot G)_x \pmod n$ and $s = k^{-1}(z + r \cdot d) \pmod n$.',
      'Constant Nonce Flaw: If $k$ is constant, $r_1 = r_2$. Given two signatures $(r, s_1)$ and $(r, s_2)$ for messages $z_1, z_2$:',
      'Math Derivation: $s_1 - s_2 = k^{-1}(z_1 - z_2) \implies k = \frac{z_1 - z_2}{s_1 - s_2} \pmod n$.',
      'Private Key Recovery: $d = r^{-1}(s_1 \cdot k - z_1) \pmod n$. Attacker recovers private key $d$ instantly.',
    ],
    codeSnippet: {
      language: 'python',
      title: 'ECDSA Private Key Recovery from Constant Nonce',
      code: `def recover_ecdsa_private_key(z1, z2, s1, s2, r, n):
    # k = (z1 - z2) / (s1 - s2) mod n
    k = ((z1 - z2) * pow(s1 - s2, -1, n)) % n
    # d = (s1 * k - z1) / r mod n
    d = ((s1 * k - z1) * pow(r, -1, n)) % n
    return d`,
    },
  },
  {
    id: 'shattered-sha1',
    title: 'SHAttered: Practical SHA-1 Hash Collision',
    subtitle: 'First real-world SHA-1 collision generated by CIGIT & Google',
    year: 2017,
    severity: 'High',
    category: 'Cryptanalytic Attack',
    affectedAlgorithms: ['SHA-1 Hash Function', 'Merkle-Damgård Construction'],
    impact:
      'Forced immediate retirement of SHA-1 in Git, digital certificates, web browsers, and software distribution repositories worldwide.',
    rootCause:
      'Identified differential paths in SHA-1 compression function requiring 2^63.1 SHA-1 evaluations (9,223,372,036,854,775,808 evaluations) to craft two distinct PDF documents with identical SHA-1 hashes.',
    keyTakeaway:
      'Deprecate legacy cryptographic primitives (SHA-1, MD5) before practical collision attacks emerge. Migrate to SHA-256, SHA-3, or BLAKE2.',
    summary:
      'In February 2017, researchers from CWI Amsterdam and Google announced SHAttered, producing two distinct PDF documents that generated the exact same SHA-1 hash (3870678d4804757c0f5840cb93f1205a271f2601).',
    timeline: [
      { year: '2005', event: 'Xiaoyun Wang proves theoretical SHA-1 collision attack in 2^69 operations.' },
      { year: '2011', event: 'NIST formally deprecates SHA-1 for digital signatures.' },
      { year: '2017-02-23', event: 'CWI and Google publish SHAttered attack details and 2 distinct PDFs.' },
    ],
    technicalBreakdown: [
      'Identical Hash: PDF 1 and PDF 2 differed in JPEG image payload bytes, but compressed to identical SHA-1 digest.',
      'Computation Scale: Required 9 quintillion SHA-1 calculations (~6,500 years of single-CPU computation or 110 GPU-years).',
      'Git & SVN Impact: Demonstrated SVN repository corruption where committing PDF 2 overwrote PDF 1.',
    ],
    codeSnippet: {
      language: 'bash',
      title: 'SHAttered SHA-1 Collision Verification',
      code: `# Both files have identical SHA-1 hashes:
$ sha1sum shattered-1.pdf shattered-2.pdf
3870678d4804757c0f5840cb93f1205a271f2601  shattered-1.pdf
3870678d4804757c0f5840cb93f1205a271f2601  shattered-2.pdf

# SHA-256 correctly produces distinct hashes:
$ sha256sum shattered-1.pdf shattered-2.pdf
2570889f1d59bc36b0630f... shattered-1.pdf
71b239df6822b6131d234a... shattered-2.pdf`,
    },
  },
  {
    id: 'dual-ec-drbg',
    title: 'Dual_EC_DRBG Kleptographic Backdoor',
    subtitle: 'NSA-designed backdoor in NIST SP 800-90A Elliptic Curve PRNG',
    year: 2013,
    severity: 'Critical',
    category: 'RNG Flaw',
    affectedAlgorithms: ['Dual_EC_DRBG', 'NIST SP 800-90A', 'RSA BSAFE'],
    impact:
      'Enabled silent decryption of TLS connections, IPsec VPN tunnels, and encrypted sessions using RSA Security BSAFE toolkit.',
    rootCause:
      'Elliptic curve generator points P and Q were chosen such that Q = d * P, where secret scalar d was known exclusively to NSA cryptanalysts.',
    keyTakeaway:
      'Standardization processes must require provably rigid, non-arbitrary domain parameters (e.g. "nothing-up-my-sleeve" numbers).',
    summary:
      'Dual_EC_DRBG was a standardized pseudorandom number generator promoted by NIST and NSA. Edward Snowden documents confirmed in 2013 that the NSA engineered a backdoor using secret elliptic curve relationships.',
    timeline: [
      { year: '2004', event: 'Dual_EC_DRBG submitted to NIST SP 800-90A standard.' },
      { year: '2007', event: 'Shumow & Ferguson present theoretical backdoor at Crypto 2007.' },
      { year: '2013-09', event: 'Snowden leaks confirm NSA paid RSA Security $10M to default to Dual_EC_DRBG in BSAFE.' },
      { year: '2014-04', event: 'NIST formally revokes Dual_EC_DRBG from SP 800-90A standard.' },
    ],
    technicalBreakdown: [
      'Kleptographic Relation: Point Q on P-256 curve was generated using secret scalar d: Q = d * P.',
      'State Recovery: An observer knowing d and 32 bytes of PRNG output could calculate internal state `s` via `s = d * x_point`, predicting all future encryption keys.',
    ],
    codeSnippet: {
      language: 'python',
      title: 'Dual_EC_DRBG Backdoor Mechanism',
      code: `# Attacker knows secret scalar 'e' such that P = e * Q
# Given output point R = s * Q:
# Attacker computes e * R = e * (s * Q) = s * (e * Q) = s * P
# Reconstructs internal state 's' instantly!`,
    },
  },
]
