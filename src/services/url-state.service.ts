import {
  DEFAULT_FILTER,
  FILTER_PARAM,
  type FilterType,
} from '@/constants/filters.ts';
import type { PersistedUiState } from '@/types/app-state.ts';

const URL_PARAM = {
  FILTER: 'filter',
  PAGE: 'page',
  CATEGORY: 'category',
  KEYWORD: 'keyword',
} as const;

const FILTER_BY_PARAM = Object.fromEntries(
  Object.entries(FILTER_PARAM).map(([filter, param]) => [param, filter]),
) as Record<string, FilterType>;

const DEFAULT_FILTER_PARAM = FILTER_PARAM[DEFAULT_FILTER];

function canUseUrl(): boolean {
  return (
    typeof window !== 'undefined' && typeof URLSearchParams !== 'undefined'
  );
}

function hasPersistedParams(params: URLSearchParams): boolean {
  return Object.values(URL_PARAM).some((key) => params.has(key));
}

function parseActiveFilter(value: string | null): string {
  return FILTER_BY_PARAM[value ?? ''] ?? DEFAULT_FILTER;
}

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

function parseCategory(
  activeFilter: string,
  value: string | null,
): PersistedUiState['category'] {
  const name = (value ?? '').trim();

  if (!name) return null;

  return {
    name,
    filter: FILTER_PARAM[activeFilter as FilterType] ?? DEFAULT_FILTER_PARAM,
  };
}

export function readUiStateFromUrl(): PersistedUiState | null {
  if (!canUseUrl()) return null;

  const params = new URLSearchParams(window.location.search);

  if (!hasPersistedParams(params)) return null;

  const activeFilter = parseActiveFilter(params.get(URL_PARAM.FILTER));

  return {
    activeFilter,
    page: parsePage(params.get(URL_PARAM.PAGE)),
    category: parseCategory(activeFilter, params.get(URL_PARAM.CATEGORY)),
    keyword: params.get(URL_PARAM.KEYWORD) ?? '',
  };
}

function isPersistedUiState(value: unknown): value is PersistedUiState {
  return !!value && typeof value === 'object';
}

export function writeUiStateToUrl(value: unknown): void {
  if (!canUseUrl() || !isPersistedUiState(value)) return;

  const url = new URL(window.location.href);
  const filterParam =
    FILTER_PARAM[(value.activeFilter ?? DEFAULT_FILTER) as FilterType] ??
    DEFAULT_FILTER_PARAM;
  const page = value.page ?? 1;
  const category = value.category?.name ?? '';
  const keyword = value.keyword ?? '';

  url.searchParams.set(URL_PARAM.FILTER, filterParam);
  url.searchParams.set(URL_PARAM.PAGE, String(Math.max(1, page)));

  if (category) {
    url.searchParams.set(URL_PARAM.CATEGORY, category);
  } else {
    url.searchParams.delete(URL_PARAM.CATEGORY);
  }

  if (keyword) {
    url.searchParams.set(URL_PARAM.KEYWORD, keyword);
  } else {
    url.searchParams.delete(URL_PARAM.KEYWORD);
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl !== currentUrl) {
    window.history.replaceState(window.history.state, '', nextUrl);
  }
}

export function listenUiStateUrlChanges(
  callback: (state: PersistedUiState) => void,
): () => void {
  if (!canUseUrl()) return () => {};

  const onPopState = () => {
    const urlState = readUiStateFromUrl();

    if (urlState) callback(urlState);
  };

  window.addEventListener('popstate', onPopState);

  return () => window.removeEventListener('popstate', onPopState);
}
