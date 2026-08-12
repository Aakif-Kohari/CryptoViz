import {
  safeGetItemJson,
  safeSetItemJson,
} from './storage'

export const STEP_ANNOTATIONS_STORAGE_KEY = 'cryptoviz-step-annotations'
export const STEP_NOTE_MAX_LENGTH = 500
export const STEP_ANNOTATIONS_VERSION = 1

export interface StepAnnotation {
  stepId: string
  stepLabel: string
  note: string
  bookmarked: boolean
  updatedAt: string
}

export interface StepAnnotationScope {
  cipherId: string
  direction: 'encrypt' | 'decrypt'
}

export interface StepAnnotationStore {
  version: typeof STEP_ANNOTATIONS_VERSION
  scopes: Record<string, StepAnnotation[]>
}

const EMPTY_STORE: StepAnnotationStore = {
  version: STEP_ANNOTATIONS_VERSION,
  scopes: {},
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function getStepAnnotationScopeKey({
  cipherId,
  direction,
}: StepAnnotationScope): string {
  return `${cipherId}:${direction}`
}

export function createStableStepId(label: string, index: number): string {
  const normalized = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `${index}-${normalized || 'step'}`
}

function normalizeAnnotation(value: unknown): StepAnnotation | null {
  if (!isRecord(value)) return null

  const stepId = typeof value.stepId === 'string' ? value.stepId.trim() : ''
  const stepLabel =
    typeof value.stepLabel === 'string' ? value.stepLabel.trim().slice(0, 160) : ''
  const note =
    typeof value.note === 'string'
      ? value.note.trim().slice(0, STEP_NOTE_MAX_LENGTH)
      : ''
  const bookmarked = value.bookmarked === true
  const updatedAt =
    typeof value.updatedAt === 'string' &&
    !Number.isNaN(Date.parse(value.updatedAt))
      ? value.updatedAt
      : new Date(0).toISOString()

  if (!stepId || !stepLabel || (!note && !bookmarked)) return null

  return {
    stepId,
    stepLabel,
    note,
    bookmarked,
    updatedAt,
  }
}

export function normalizeStepAnnotationStore(
  value: unknown,
): StepAnnotationStore {
  if (
    !isRecord(value) ||
    value.version !== STEP_ANNOTATIONS_VERSION ||
    !isRecord(value.scopes)
  ) {
    return EMPTY_STORE
  }

  const scopes: Record<string, StepAnnotation[]> = {}

  for (const [scopeKey, rawAnnotations] of Object.entries(value.scopes)) {
    if (!Array.isArray(rawAnnotations)) continue

    const seen = new Set<string>()
    const annotations: StepAnnotation[] = []

    for (const rawAnnotation of rawAnnotations) {
      const annotation = normalizeAnnotation(rawAnnotation)
      if (!annotation || seen.has(annotation.stepId)) continue
      seen.add(annotation.stepId)
      annotations.push(annotation)
    }

    if (annotations.length > 0) {
      scopes[scopeKey] = annotations
    }
  }

  return {
    version: STEP_ANNOTATIONS_VERSION,
    scopes,
  }
}

export function loadStepAnnotationStore(): StepAnnotationStore {
  const parsed = safeGetItemJson<unknown>(STEP_ANNOTATIONS_STORAGE_KEY, null)
  return parsed !== null ? normalizeStepAnnotationStore(parsed) : EMPTY_STORE
}

export function saveStepAnnotationStore(
  store: StepAnnotationStore,
): StepAnnotationStore {
  const normalized = normalizeStepAnnotationStore(store)
  safeSetItemJson(STEP_ANNOTATIONS_STORAGE_KEY, normalized)
  return normalized
}

export function getScopeAnnotations(
  store: StepAnnotationStore,
  scope: StepAnnotationScope,
): StepAnnotation[] {
  return store.scopes[getStepAnnotationScopeKey(scope)] ?? []
}

export function updateStepNote(
  store: StepAnnotationStore,
  scope: StepAnnotationScope,
  stepId: string,
  stepLabel: string,
  note: string,
): StepAnnotationStore {
  const scopeKey = getStepAnnotationScopeKey(scope)
  const annotations = [...(store.scopes[scopeKey] ?? [])]
  const index = annotations.findIndex((item) => item.stepId === stepId)
  const nextNote = note.trim().slice(0, STEP_NOTE_MAX_LENGTH)
  const previous = index >= 0 ? annotations[index] : null

  if (!nextNote && !previous?.bookmarked) {
    if (index >= 0) annotations.splice(index, 1)
  } else {
    const next: StepAnnotation = {
      stepId,
      stepLabel: stepLabel.trim().slice(0, 160),
      note: nextNote,
      bookmarked: previous?.bookmarked ?? false,
      updatedAt: new Date().toISOString(),
    }

    if (index >= 0) annotations[index] = next
    else annotations.push(next)
  }

  const scopes = { ...store.scopes }
  if (annotations.length > 0) scopes[scopeKey] = annotations
  else delete scopes[scopeKey]

  return saveStepAnnotationStore({
    version: STEP_ANNOTATIONS_VERSION,
    scopes,
  })
}

export function toggleStepBookmark(
  store: StepAnnotationStore,
  scope: StepAnnotationScope,
  stepId: string,
  stepLabel: string,
): StepAnnotationStore {
  const scopeKey = getStepAnnotationScopeKey(scope)
  const annotations = [...(store.scopes[scopeKey] ?? [])]
  const index = annotations.findIndex((item) => item.stepId === stepId)
  const previous = index >= 0 ? annotations[index] : null
  const bookmarked = !(previous?.bookmarked ?? false)

  if (!bookmarked && !previous?.note) {
    if (index >= 0) annotations.splice(index, 1)
  } else {
    const next: StepAnnotation = {
      stepId,
      stepLabel: stepLabel.trim().slice(0, 160),
      note: previous?.note ?? '',
      bookmarked,
      updatedAt: new Date().toISOString(),
    }

    if (index >= 0) annotations[index] = next
    else annotations.push(next)
  }

  const scopes = { ...store.scopes }
  if (annotations.length > 0) scopes[scopeKey] = annotations
  else delete scopes[scopeKey]

  return saveStepAnnotationStore({
    version: STEP_ANNOTATIONS_VERSION,
    scopes,
  })
}

export function removeStepNote(
  store: StepAnnotationStore,
  scope: StepAnnotationScope,
  stepId: string,
): StepAnnotationStore {
  return updateStepNote(store, scope, stepId, '', '')
}

export function clearScopeAnnotations(
  store: StepAnnotationStore,
  scope: StepAnnotationScope,
): StepAnnotationStore {
  const scopeKey = getStepAnnotationScopeKey(scope)
  const scopes = { ...store.scopes }
  delete scopes[scopeKey]

  return saveStepAnnotationStore({
    version: STEP_ANNOTATIONS_VERSION,
    scopes,
  })
}
