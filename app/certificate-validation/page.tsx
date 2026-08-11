import CertificateValidationVisualizer from "@/components/security/CertificateValidationVisualizer";

export default function CertificateValidationPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">

        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Certificate Validation
          </h1>

          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-3xl">
            Explore how X.509 certificates are chained,
            verified, and anchored to a trusted certificate
            authority.
          </p>
        </div>

        <CertificateValidationVisualizer />

      </div>
    </main>
  );
}