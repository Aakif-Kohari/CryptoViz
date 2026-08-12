import Link from "next/link";

export default function TLS13HandshakeDocs() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-6">
        TLS 1.3 Handshake
      </h1>

      <p className="mb-6">
        TLS 1.3 establishes a secure encrypted connection between a
        client and a server using ephemeral key exchange and modern
        cryptographic algorithms.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        Handshake Flow
      </h2>

      <ol className="list-decimal pl-6 space-y-3">
        <li>ClientHello</li>
        <li>ServerHello</li>
        <li>ECDHE Key Exchange</li>
        <li>Handshake Key Derivation</li>

        {/* Certificate */}
        <li>
          <div className="flex flex-wrap items-center gap-3">
            <span>Certificate</span>

            <Link
              href="/certificate-validation"
              className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Explore Certificate Validation →
            </Link>
          </div>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Explore how the server certificate is validated,
            how the certification path is built, and how it
            terminates at a trusted root certificate.
          </p>
        </li>

        <li>Certificate Verify</li>
        <li>Finished Messages</li>
        <li>Encrypted Application Data</li>
      </ol>

      {/* Certificate Validation Integration */}
      <section className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
        <h2 className="text-2xl font-semibold">
          Explore Certificate Validation
        </h2>

        <p className="mt-3 text-gray-700 dark:text-gray-300">
          During the TLS handshake, the server presents a certificate
          chain. The client must validate that chain before trusting
          the server identity.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 dark:bg-slate-900">
            <h3 className="font-semibold">
              1. Build the Chain
            </h3>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Connect the end-entity certificate to its issuing
              certificate authorities.
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 dark:bg-slate-900">
            <h3 className="font-semibold">
              2. Verify Certificates
            </h3>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Check signatures, validity periods, and certificate
              constraints.
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 dark:bg-slate-900">
            <h3 className="font-semibold">
              3. Reach Trust Anchor
            </h3>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Determine whether the certification path terminates
              at a trusted root.
            </p>
          </div>
        </div>

        <Link
          href="/certificate-validation"
          className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
        >
          Open Interactive Certificate Validator →
        </Link>
      </section>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        Learning Objectives
      </h2>

      <ul className="list-disc pl-6 space-y-2">
        <li>Understand the TLS 1.3 handshake.</li>
        <li>Learn how forward secrecy works.</li>
        <li>Understand ECDHE key exchange.</li>
        <li>Learn how session keys are derived.</li>
        <li>Understand how certificates are validated.</li>
        <li>Understand certificate chains and trust anchors.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        References
      </h2>

      <ul className="list-disc pl-6 space-y-2">
        <li>
          RFC 8446 – The Transport Layer Security (TLS)
          Protocol Version 1.3
        </li>

        <li>
          RFC 5280 – Internet X.509 Public Key Infrastructure
          Certificate and CRL Profile
        </li>

        <li>
          RFC 4158 – Internet X.509 Public Key Infrastructure:
          Certification Path Building
        </li>

        <li>
          <a
            href="https://www.rfc-editor.org/rfc/rfc8446"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            RFC 8446
          </a>
        </li>
      </ul>
    </main>
  );
}