import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import OfflineStatusBadge from '@/components/offline/OfflineStatusBadge';
import OfflinePackCard from '@/components/offline/OfflinePackCard';
import OfflineVisualizer from '@/components/offline/OfflineVisualizer';
import { OFFLINE_PACKS } from '@/lib/offline/packData';

vi.mock('next/navigation', () => ({
  usePathname: () => '/offline',
}));

describe('Offline Learning Pack Accessibility (a11y)', () => {
  it('has zero axe accessibility violations on OfflineStatusBadge', async () => {
    const sampleStatus = {
      isSupported: true,
      isOnline: true,
      isServiceWorkerActive: true,
      cachedPackIds: ['symmetric-classical'],
      storageUsedBytes: 2000000,
      storageQuotaBytes: 50000000,
      isCachingInProgress: false,
      cachingProgressPct: 0,
    };

    const { container } = render(<OfflineStatusBadge status={sampleStatus} onClearCache={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has zero axe accessibility violations on OfflinePackCard', async () => {
    const pack = OFFLINE_PACKS[0];
    const { container } = render(
      <OfflinePackCard
        pack={pack}
        isCached={false}
        onCache={() => {}}
        onExport={() => {}}
        onOpenDetails={() => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has zero axe accessibility violations on OfflineVisualizer', async () => {
    const { container } = render(<OfflineVisualizer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
