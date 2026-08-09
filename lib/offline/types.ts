export type PackCategory = 'all' | 'classical' | 'symmetric' | 'asymmetric' | 'hash' | 'attacks';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface IncludedDocItem {
  slug: string;
  title: string;
  description: string;
}

export interface IncludedCipherItem {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface OfflinePack {
  id: string;
  title: string;
  description: string;
  category: PackCategory;
  difficulty: DifficultyLevel;
  version: string;
  estimatedSize: string;
  sizeBytes: number;
  itemCount: number;
  icon: string;
  topics: string[];
  docItems: IncludedDocItem[];
  cipherItems: IncludedCipherItem[];
  overviewHtml?: string;
}

export interface OfflineCacheStatus {
  isSupported: boolean;
  isOnline: boolean;
  isServiceWorkerActive: boolean;
  cachedPackIds: string[];
  storageUsedBytes: number;
  storageQuotaBytes: number;
  isCachingInProgress: boolean;
  cachingProgressPct: number;
}

export type ExportFormat = 'single-html' | 'json' | 'markdown';
