import { getState, setState } from '../../services/store.service.js';
import { bindStoreIsland } from '../shared/store-island.js';
import { handlePaginationClick } from './pagination-controls.js';
import { renderPagination } from './pagination-view.js';

/**
 * @param {HTMLElement | null} root
 * @returns {() => void} teardown
 */
export function initPagination(root) {
  if (!root) return () => {};

  const onClick = (/** @type {Event} */ event) => {
    const state = getState();
    handlePaginationClick(root, state, (page) => setState({ page }), event);
  };

  const sync = (
    /** @type {import('../../services/store.service.js').AppState} */ state,
  ) => renderPagination(root, state);

  return bindStoreIsland(sync, { root, listeners: [['click', onClick]] });
}
