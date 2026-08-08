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

      <ol className="list-decimal pl-6 space-y-2">
        <li>ClientHello</li>
        <li>ServerHello</li>
        <li>ECDHE Key Exchange</li>
        <li>Handshake Key Derivation</li>
        <li>Certificate</li>
        <li>Certificate Verify</li>
        <li>Finished Messages</li>
        <li>Encrypted Application Data</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        Learning Objectives
      </h2>

      <ul className="list-disc pl-6 space-y-2">
        <li>Understand the TLS 1.3 handshake.</li>
        <li>Learn how forward secrecy works.</li>
        <li>Understand ECDHE key exchange.</li>
        <li>Learn how session keys are derived.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        References
      </h2>

      <ul className="list-disc pl-6">
        <li>RFC 8446 – The Transport Layer Security (TLS) Protocol Version 1.3</li>
        <li>https://www.rfc-editor.org/rfc/rfc8446</li>
      </ul>
    </main>
  );
}