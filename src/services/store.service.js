import { DEFAULT_FILTER, STORAGE_KEYS } from '../utils/constants.js';
import { readJSON, writeJSON } from './storage.service.js';

/**
 * @typedef {object} AppState
 * @property {string} activeFilter   Active filter tab (Muscles / Body parts / Equipment).
 * @property {?{ name: string, filter: string }} category  Selected category, or null on the categories view.
 * @property {number} page           Current page of the active list.
 * @property {number} totalPages     Total pages for the active list (not persisted).
 * @property {string} keyword        Search keyword (exercises list only).
 */

/** @type {AppState} */
const state = {
  activeFilter: DEFAULT_FILTER,
  category: null,
  page: 1,
  totalPages: 1,
  keyword: '',
};

/** @type {Set<(state: Readonly<AppState>) => void>} */
const listeners = new Set();

/**
 * @param {unknown} value
 * @returns {value is { name: string, filter: string }}
 */
function isCategory(value) {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (
      /** @type {{ name?: unknown, filter?: unknown }} */ (value).name
    ) === 'string' &&
    typeof (
      /** @type {{ name?: unknown, filter?: unknown }} */ (value).filter
    ) === 'string'
  );
}

/** @type {(keyof AppState)[]} */
const PERSISTED_KEYS = ['activeFilter', 'page', 'category', 'keyword'];

/**
 * @param {Partial<AppState>} patch
 * @returns {boolean}
 */
function shouldPersist(patch) {
  return PERSISTED_KEYS.some((key) => key in patch);
}

function hydrateFromStorage() {
  const saved = readJSON(STORAGE_KEYS.UI_STATE, null);

  if (!saved || typeof saved !== 'object') return;

  const record = /** @type {Record<string, unknown>} */ (saved);

  if (typeof record.activeFilter === 'string') {
    state.activeFilter = record.activeFilter;
  }

  if (typeof record.page === 'number' && record.page >= 1) {
    state.page = record.page;
  }

  if (record.category === null) {
    state.category = null;
  } else if (isCategory(record.category)) {
    state.category = record.category;
  }

  if (typeof record.keyword === 'string') {
    state.keyword = record.keyword;
  }
}

function persistState() {
  writeJSON(STORAGE_KEYS.UI_STATE, {
    activeFilter: state.activeFilter,
    page: state.page,
    category: state.category,
    keyword: state.keyword,
  });
}

hydrateFromStorage();

/** @returns {Readonly<AppState>} */
function snapshot() {
  return Object.freeze({ ...state });
}

/** @returns {Readonly<AppState>} */
export function getState() {
  return snapshot();
}

/**
 * @param {Partial<AppState>} patch
 */
export function setState(patch) {
  Object.assign(state, patch);

  if (shouldPersist(patch)) {
    persistState();
  }

  const frozen = snapshot();

  for (const listener of listeners) listener(frozen);
}

/**
 * Subscribes to state changes. Returns an unsubscribe fn —
 * ALWAYS call it when tearing down a component (e.g. closing a modal)
 * to avoid leaking listeners.
 *
 * Island teardown contract — every island that subscribes MUST capture the
 * returned fn and call it on teardown. Recommended shape for feature islands:
 *
 * ```js
 * export function initFilters(root) {
 *   if (!root) return () => {};
 *   const stop = subscribe((state) => render(root, state));
 *   // ...wire DOM listeners...
 *   return () => { stop(); }; // also remove any DOM listeners here
 * }
 * ```
 *
 * The island's `.astro` `<script>` invokes the returned teardown on
 * `astro:before-swap` once client navigation is enabled.
 *
 * @param {(state: Readonly<AppState>) => void} listener
 * @returns {() => void}
 */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
