import StandardsLibrary from "@/components/StandardsLibrary";

export default function StandardsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-4">
        📚 NIST & RFC Standards Library
      </h1>

      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Explore important cryptographic standards including NIST
        publications and IETF RFCs through an interactive searchable
        reference.
      </p>

      <StandardsLibrary />
    </main>
  );
}