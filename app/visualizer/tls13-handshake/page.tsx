import TLSHandshakeVisualizer from "@/components/TLSHandshakeVisualizer";

export default function TLS13HandshakePage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-3">
        🔐 TLS 1.3 Handshake Visualizer
      </h1>

      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Explore how a secure TLS 1.3 connection is established through an
        interactive step-by-step visualization.
      </p>

      <TLSHandshakeVisualizer />
    </main>
  );
}