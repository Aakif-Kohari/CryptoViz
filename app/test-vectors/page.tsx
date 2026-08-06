import TestVectorManager from "@/components/TestVectorManager";

export default function TestVectorsPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-4">
         Import / Export Test Vectors
      </h1>

      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Import, view and export cryptographic test vectors in JSON format.
      </p>

      <TestVectorManager />
    </main>
  );
}
