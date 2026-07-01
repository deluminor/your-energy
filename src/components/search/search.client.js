import { getState, setState } from '../../services/store.service.js';
import { normalizeQuery } from '../../utils/validators.js';
import { bindStoreIsland } from '../shared/store-island.js';

/**
 * @typedef {import('../../services/store.service.js').AppState} AppState
 */

/**
 * @param {HTMLInputElement} input
 * @param {HTMLButtonElement | null} clearButton
 */
function updateClearVisibility(input, clearButton) {
  if (!clearButton) return;

  clearButton.hidden = input.value.length === 0;
}

/**
 * @param {HTMLFormElement | null} root
 * @returns {() => void} teardown
 */
export function initSearch(root) {
  if (!root) return () => {};

  const input = /** @type {HTMLInputElement | null} */ (
    root.querySelector('.search__input')
  );
  const clearButton = /** @type {HTMLButtonElement | null} */ (
    root.querySelector('.search__clear')
  );

  if (!input) return () => {};

  const applyKeyword = (/** @type {string} */ keyword) => {
    input.value = keyword;
    updateClearVisibility(input, clearButton);

    if (keyword === getState().keyword) return;

    setState({ keyword, page: 1 });
  };

  const onSubmit = (/** @type {Event} */ event) => {
    event.preventDefault();
    applyKeyword(normalizeQuery(input.value));
  };

  const onInput = () => {
    updateClearVisibility(input, clearButton);
  };

  const onClear = () => {
    applyKeyword('');
    input.focus();
  };

  const sync = (/** @type {Readonly<AppState>} */ state) => {
    root.hidden = state.category === null;

    if (document.activeElement !== input) {
      input.value = state.keyword;
      updateClearVisibility(input, clearButton);
    }
  };

  updateClearVisibility(input, clearButton);

  const storeTeardown = bindStoreIsland(sync, {
    root,
    listeners: [
      ['submit', onSubmit],
      ['input', onInput],
    ],
  });

  clearButton?.addEventListener('click', onClear);

  return () => {
    storeTeardown();
    clearButton?.removeEventListener('click', onClear);
  };
}
