import SecretRecoveryVisualizer from "@/components/SecretRecoveryVisualizer";

export default function SecretRecoveryPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-4">
        🔐 Interactive Secret Recovery Simulator
      </h1>

      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Learn how Shamir's Secret Sharing reconstructs a secret from multiple
        shares through an interactive simulation.
      </p>

      <SecretRecoveryVisualizer />
    </main>
  );
}