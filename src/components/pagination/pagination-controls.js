import { renderPagination, resolveActionPage } from './pagination-view.js';

/**
 * @typedef {object} PaginationState
 * @property {number} page
 * @property {number} totalPages
 */

/**
 * @param {HTMLElement} root
 * @param {PaginationState} state
 * @param {(page: number) => void} onPageChange
 * @param {Event} event
 */
export function handlePaginationClick(root, state, onPageChange, event) {
  const target = /** @type {HTMLElement} */ (event.target);
  const control = target.closest('[data-page], [data-action]');

  if (!control || !root.contains(control)) return;
  if (control.hasAttribute('disabled')) return;

  const { page, totalPages } = state;
  const action = control.getAttribute('data-action');

  if (action) {
    const nextPage = resolveActionPage(action, page, totalPages);

    if (
      nextPage === null ||
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page
    ) {
      return;
    }

    onPageChange(nextPage);
    return;
  }

  const nextPage = Number(control.getAttribute('data-page'));

  if (!Number.isFinite(nextPage) || nextPage < 1 || nextPage === page) return;

  onPageChange(nextPage);
}

/**
 * @param {HTMLElement | null} root
 * @param {{
 *   getState: () => PaginationState;
 *   onPageChange: (page: number) => void;
 * }} options
 * @returns {() => void} teardown
 */
export function bindPaginationControls(root, { getState, onPageChange }) {
  if (!root) return () => {};

  const sync = () => {
    renderPagination(root, getState());
  };

  const onClick = (/** @type {Event} */ event) => {
    handlePaginationClick(root, getState(), onPageChange, event);
  };

  root.addEventListener('click', onClick);
  sync();

  return () => {
    root.removeEventListener('click', onClick);
  };
}
