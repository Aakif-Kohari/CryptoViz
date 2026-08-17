/**
 * Validates the schema of an imported JSON pack matching exportPayload format.
 */
export function validatePackSchema(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Support both direct metadata objects and flattened schemas
  const meta = data.metadata || data;
  if (!meta || typeof meta !== 'object') return false;
  
  if (typeof meta.id !== 'string') return false;
  if (typeof meta.title !== 'string') return false;
  if (typeof meta.version !== 'string') return false;
  
  // Verify topics/documentation arrays exist
  if (!Array.isArray(data.topics) && !Array.isArray(meta.topics)) return false;
  
  return true;
}

/**
 * Imports and persists a parsed JSON pack into local offline storage.
 */
export async function importPackFromJson(jsonData: any): Promise<void> {
  if (!validatePackSchema(jsonData)) {
    throw new Error("Invalid pack format: Missing required metadata fields (id, title, version) or topics array.");
  }

  const packId = jsonData.metadata?.id || jsonData.id;
  const packTitle = jsonData.metadata?.title || jsonData.title;

  const storageKey = 'cryptoviz_offline_packs';
  const existingPacksStr = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
  const existingPacks = existingPacksStr ? JSON.parse(existingPacksStr) : [];

  const isDuplicate = existingPacks.some((p: any) => (p.metadata?.id || p.id) === packId);
  if (isDuplicate) {
    throw new Error(`Pack "${packTitle}" is already imported in offline storage.`);
  }

  existingPacks.push(jsonData);
  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey, JSON.stringify(existingPacks));
  }
}
