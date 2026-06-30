import { DEFAULT_FILTER } from '../utils/constants.js';

/**
 * @typedef {object} AppState
 * @property {string} activeFilter   Active filter tab (Muscles / Body parts / Equipment).
 * @property {?{ name: string, filter: string }} category  Selected category, or null on the categories view.
 * @property {number} page           Current page of the active list.
 * @property {string} keyword        Search keyword (exercises list only).
 */

/** @type {AppState} */
const state = {
  activeFilter: DEFAULT_FILTER,
  category: null,
  page: 1,
  keyword: '',
};

/** @type {Set<(state: Readonly<AppState>) => void>} */
const listeners = new Set();

/** @returns {Readonly<AppState>} */
function snapshot() {
  return Object.freeze({ ...state });
}

/** @returns {Readonly<AppState>} */
export function getState() {
  return snapshot();
}

/**
 * Shallow-merges a patch and notifies all subscribers.
 * @param {Partial<AppState>} patch
 */
export function setState(patch) {
  Object.assign(state, patch);
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
