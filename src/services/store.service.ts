import { DEFAULT_FILTER } from '@/constants/filters.ts';
import { STORAGE_KEYS } from '@/constants/storage-keys.ts';
import type { AppState } from '@/types/app-state.ts';
import type { Category } from '@/types/category.ts';
import { readJSON, writeJSON } from './storage.service.ts';
import { listenUiStateUrlChanges } from './url-state.service.ts';

const state: AppState = {
  activeFilter: DEFAULT_FILTER,
  category: null,
  page: 1,
  totalPages: 1,
  keyword: '',
};

const listeners = new Set<(state: Readonly<AppState>) => void>();

function isCategory(value: unknown): value is Category {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as Category).name === 'string' &&
    typeof (value as Category).filter === 'string'
  );
}

const PERSISTED_KEYS: (keyof AppState)[] = [
  'activeFilter',
  'page',
  'category',
  'keyword',
];

function shouldPersist(patch: Partial<AppState>): boolean {
  return PERSISTED_KEYS.some((key) => key in patch);
}

function hydrateFromStorage(): void {
  const saved = readJSON<Partial<AppState> | null>(STORAGE_KEYS.UI_STATE, null);

  if (!saved || typeof saved !== 'object') {
    persistState();
    return;
  }

  if (typeof saved.activeFilter === 'string') {
    state.activeFilter = saved.activeFilter;
  }

  if (typeof saved.page === 'number' && saved.page >= 1) {
    state.page = saved.page;
  }

  if (saved.category === null) {
    state.category = null;
  } else if (isCategory(saved.category)) {
    state.category = saved.category;
  }

  if (typeof saved.keyword === 'string') {
    state.keyword = saved.keyword;
  }
}

function persistState(): void {
  writeJSON(STORAGE_KEYS.UI_STATE, {
    activeFilter: state.activeFilter,
    page: state.page,
    category: state.category,
    keyword: state.keyword,
  });
}

function snapshot(): Readonly<AppState> {
  return Object.freeze({ ...state });
}

hydrateFromStorage();

export function getState(): Readonly<AppState> {
  return snapshot();
}

export function setState(patch: Partial<AppState>): void {
  Object.assign(state, patch);

  if (shouldPersist(patch)) {
    persistState();
  }

  const frozen = snapshot();

  for (const listener of listeners) listener(frozen);
}

export function subscribe(
  listener: (state: Readonly<AppState>) => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

listenUiStateUrlChanges((urlState) => setState(urlState));

export type { AppState };
