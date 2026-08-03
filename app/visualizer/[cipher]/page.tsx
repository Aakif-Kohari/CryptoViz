import { notFound } from "next/navigation";
import WorkspaceLayout from "../../../components/layout/WorkspaceLayout";
import CipherLayout from "../../../components/cipher/CipherLayout";
import GcmTamperDemo from "../../../components/cipher/GcmTamperDemo";
import WorkerErrorBoundary from "../../../components/error/WorkerErrorBoundary";
import RecentCipherTracker from "../../../components/cipher/RecentCipherTracker";
import { CIPHER_REGISTRY } from "../../../lib/cipher/registry";

// Generate static routes for all ciphers for 'output: export' static build
export async function generateStaticParams() {
  return CIPHER_REGISTRY.map((cipher) => ({
    cipher: cipher.id,
  }));
}

// Next.js dynamic routing expects params to be a Promise in Next 15+
export default async function VisualizerPage({
  params,
}: {
  params: Promise<{ cipher: string }>;
}) {
  const resolvedParams = await params;
  const cipher = CIPHER_REGISTRY.find(
    (item) => item.id === resolvedParams.cipher,
  );

  if (!cipher) {
    notFound();
  }

  const sidebarCiphers = CIPHER_REGISTRY.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
  }));

  return (
    <>
      <RecentCipherTracker cipherId={cipher.id} />

      <WorkspaceLayout activeCipherId={cipher.id}>
          <div className="min-w-0 flex-1 bg-white dark:bg-zinc-900/10">

            <WorkerErrorBoundary>
              <CipherLayout cipher={cipher} />
            </WorkerErrorBoundary>

            {cipher.id === "aes-gcm" && (
              <div className="mx-auto max-w-5xl px-4 pb-8 md:px-6 lg:px-8">
                <GcmTamperDemo />
              </div>
            )}
          
          </div>
      </WorkspaceLayout>
    </>
  );
}
