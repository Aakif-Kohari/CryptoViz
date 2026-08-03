'use client';

import { useState, useEffect, useCallback } from 'react';
import { OfflineCacheStatus } from './types';
import { safeGetItemJson, safeSetItemJson, safeRemoveItem } from '../utils/storage';

const CACHE_NAME = 'cryptoviz-offline-v1';

export function useOfflinePackManager() {
  const [status, setStatus] = useState<OfflineCacheStatus>({
    isSupported: false,
    isOnline: true,
    isServiceWorkerActive: false,
    cachedPackIds: [],
    storageUsedBytes: 1250000,
    storageQuotaBytes: 50000000,
    isCachingInProgress: false,
    cachingProgressPct: 0,
  });

  // Check online status and storage estimate
  const updateStatus = useCallback(async () => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator;
    let isSwActive = false;
    let cachedIds: string[] = [];

    if (isSupported && navigator.serviceWorker.controller) {
      isSwActive = true;
    }

    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        if (keys.length > 0) {
          // Look for cached pack indicators
          const storedPacks = safeGetItemJson<string[] | null>(
            'cryptoviz_cached_packs',
            null,
            (val): val is string[] => Array.isArray(val),
          );
          if (storedPacks) {
            cachedIds = storedPacks;
          } else {
            cachedIds = ['symmetric-classical'];
          }
        }
      } catch (e) {
        console.warn('Error reading offline caches:', e);
      }
    }

    let used = 1450000;
    let quota = 50000000;
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) used = estimate.usage;
        if (estimate.quota) quota = estimate.quota;
      } catch (_e) {
        // Fallback defaults
      }
    }

    setStatus(prev => ({
      ...prev,
      isSupported,
      isOnline,
      isServiceWorkerActive: isSwActive,
      cachedPackIds: cachedIds,
      storageUsedBytes: used,
      storageQuotaBytes: quota,
    }));
  }, []);

  useEffect(() => {
    updateStatus();

    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => updateStatus())
        .catch(err => console.warn('SW Registration note:', err));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateStatus]);

  // Pre-cache a specific offline pack
  const cachePack = async (packId: string) => {
    setStatus(prev => ({ ...prev, isCachingInProgress: true, cachingProgressPct: 10 }));

    try {
      if ('caches' in window) {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll([
          '/',
          '/offline',
          '/docs',
          '/resources',
          '/visualizer/caesar/',
          '/icon.svg',
          '/globals.css',
        ]);
      }

      // Simulate step progress for user feedback
      for (let p = 20; p <= 100; p += 20) {
        await new Promise(r => setTimeout(r, 100));
        setStatus(prev => ({ ...prev, cachingProgressPct: p }));
      }

      const current = status.cachedPackIds;
      const updated = Array.from(new Set([...current, packId]));
      safeSetItemJson('cryptoviz_cached_packs', updated);

      setStatus(prev => ({
        ...prev,
        cachedPackIds: updated,
        isCachingInProgress: false,
        cachingProgressPct: 100,
      }));
    } catch (err) {
      console.error('Failed to cache pack:', err);
      setStatus(prev => ({ ...prev, isCachingInProgress: false, cachingProgressPct: 0 }));
    }
  };

  // Clear all offline cached packs
  const clearCache = async () => {
    if ('caches' in window) {
      try {
        await caches.delete(CACHE_NAME);
      } catch (e) {
        console.error('Failed to delete cache:', e);
      }
    }
    safeRemoveItem('cryptoviz_cached_packs');
    setStatus(prev => ({
      ...prev,
      cachedPackIds: [],
      storageUsedBytes: 0,
    }));
  };

  return {
    status,
    cachePack,
    clearCache,
    refreshStatus: updateStatus,
  };
}
