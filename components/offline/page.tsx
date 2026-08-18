import React from 'react';
import { OfflineStorageManager } from '@/components/offline/OfflineStorageManager';

export default function OfflineDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">CryptoViz Offline Hub</h1>
          <p className="text-slate-400 text-sm">Access curated learning bundles and manage local offline assets.</p>
        </header>

        {/* Existing Offline Package Listings */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-teal-400 mb-2">Curated Packages</h3>
          <p className="text-sm text-slate-400">Browse and download standard cryptographic coursework packages for offline execution.</p>
          {/* Render standard packs grid here */}
        </section>

        {/* Storage Quota & Pack Importer Panel */}
        <section>
          <OfflineStorageManager />
        </section>
      </div>
    </main>
  );
}
