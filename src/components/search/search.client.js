import { getState, setState } from '../../services/store.service.js';
import { normalizeQuery } from '../../utils/validators.js';
import { bindStoreIsland } from '../shared/store-island.js';

/**
 * @typedef {import('../../services/store.service.js').AppState} AppState
 */

/**
 * @param {HTMLFormElement | null} root
 * @returns {() => void} teardown
 */
export function initSearch(root) {
  if (!root) return () => {};

  const input = /** @type {HTMLInputElement | null} */ (
    root.querySelector('.search__input')
  );

  if (!input) return () => {};

  const onSubmit = (/** @type {Event} */ event) => {
    event.preventDefault();

    const keyword = normalizeQuery(input.value);

    input.value = keyword;

    if (keyword === getState().keyword) return;

    setState({ keyword, page: 1 });
  };

  const sync = (/** @type {Readonly<AppState>} */ state) => {
    root.hidden = state.category === null;

    if (document.activeElement !== input) {
      input.value = state.keyword;
    }
  };

  return bindStoreIsland(sync, { root, listeners: [['submit', onSubmit]] });
}
