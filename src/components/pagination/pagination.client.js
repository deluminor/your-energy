import { getState, setState } from '../../services/store.service.js';
import { DEFAULT_FILTER } from '../../utils/constants.js';
import { bindStoreIsland } from '../shared/store-island.js';
import { handlePaginationClick } from './pagination-controls.js';
import { renderPagination } from './pagination-view.js';

/**
 * @typedef {import('../../services/store.service.js').AppState} AppState
 */

/**
 * @param {Readonly<AppState>} state
 * @param {number} ssrPage
 * @param {number} ssrTotalPages
 * @returns {boolean}
 */
function matchesSsrState(state, ssrPage, ssrTotalPages) {
  return (
    state.category === null &&
    state.activeFilter === DEFAULT_FILTER &&
    state.page === ssrPage &&
    state.totalPages === ssrTotalPages
  );
}

/**
 * @param {HTMLElement | null} root
 * @returns {() => void} teardown
 */
export function initPagination(root) {
  if (!root) return () => {};

  const ssrPage = Number(root.dataset.ssrPage);
  const ssrTotalPages = Number(root.dataset.totalPages);
  const hasSsrMarkup = Boolean(root.querySelector('.pagination__page'));
  const canReuseSsr =
    hasSsrMarkup &&
    Number.isFinite(ssrPage) &&
    Number.isFinite(ssrTotalPages) &&
    ssrTotalPages > 1;

  if (
    canReuseSsr &&
    ssrTotalPages !== getState().totalPages &&
    getState().category === null
  ) {
    setState({ totalPages: ssrTotalPages });
  }

  let skipSsrRender =
    canReuseSsr && matchesSsrState(getState(), ssrPage, ssrTotalPages);

  const onClick = (/** @type {Event} */ event) => {
    const state = getState();
    handlePaginationClick(root, state, (page) => setState({ page }), event);
  };

  const sync = (/** @type {Readonly<AppState>} */ state) => {
    if (skipSsrRender && matchesSsrState(state, ssrPage, ssrTotalPages)) {
      skipSsrRender = false;
      root.hidden = state.totalPages <= 1;
      return;
    }

    skipSsrRender = false;
    renderPagination(root, state);
  };

  return bindStoreIsland(sync, { root, listeners: [['click', onClick]] });
}
