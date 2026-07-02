import { DEFAULT_FILTER, FILTER_PARAM } from '../utils/constants.js';

const URL_PARAM = {
  FILTER: 'filter',
  PAGE: 'page',
  CATEGORY: 'category',
  KEYWORD: 'keyword',
};

const FILTER_BY_PARAM = Object.fromEntries(
  Object.entries(FILTER_PARAM).map(([filter, param]) => [param, filter]),
);

const DEFAULT_FILTER_PARAM = FILTER_PARAM[DEFAULT_FILTER];

/**
 * @typedef {object} PersistedUiState
 * @property {string} activeFilter
 * @property {number} page
 * @property {?{ name: string, filter: string }} category
 * @property {string} keyword
 */

function canUseUrl() {
  return (
    typeof window !== 'undefined' && typeof URLSearchParams !== 'undefined'
  );
}

/**
 * @param {URLSearchParams} params
 * @returns {boolean}
 */
function hasPersistedParams(params) {
  return Object.values(URL_PARAM).some((key) => params.has(key));
}

/**
 * @param {string | null} value
 * @returns {string}
 */
function parseActiveFilter(value) {
  return FILTER_BY_PARAM[value ?? ''] ?? DEFAULT_FILTER;
}

/**
 * @param {string | null} value
 * @returns {number}
 */
function parsePage(value) {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/**
 * @param {string} activeFilter
 * @param {string | null} value
 * @returns {PersistedUiState['category']}
 */
function parseCategory(activeFilter, value) {
  const name = (value ?? '').trim();

  if (!name) return null;

  return {
    name,
    filter: FILTER_PARAM[activeFilter] ?? DEFAULT_FILTER_PARAM,
  };
}

/**
 * @returns {PersistedUiState | null}
 */
export function readUiStateFromUrl() {
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

/**
 * @param {unknown} value
 * @returns {value is PersistedUiState}
 */
function isPersistedUiState(value) {
  return !!value && typeof value === 'object';
}

/**
 * @param {unknown} value
 */
export function writeUiStateToUrl(value) {
  if (!canUseUrl() || !isPersistedUiState(value)) return;

  const state = /** @type {Partial<PersistedUiState>} */ (value);
  const url = new URL(window.location.href);
  const filterParam =
    FILTER_PARAM[state.activeFilter ?? DEFAULT_FILTER] ?? DEFAULT_FILTER_PARAM;
  const page = state.page ?? 1;
  const category = state.category?.name ?? '';
  const keyword = state.keyword ?? '';

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

/**
 * @param {(state: PersistedUiState) => void} callback
 * @returns {() => void}
 */
export function listenUiStateUrlChanges(callback) {
  if (!canUseUrl()) return () => {};

  const onPopState = () => {
    const state = readUiStateFromUrl();

    if (state) callback(state);
  };

  window.addEventListener('popstate', onPopState);

  return () => window.removeEventListener('popstate', onPopState);
}
