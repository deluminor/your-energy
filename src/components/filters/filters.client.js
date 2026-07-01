import { getState, setState } from '../../services/store.service.js';
import { FILTER } from '../../utils/constants.js';
import { escapeHtml } from '../../utils/escape-html.js';
import { bindStoreIsland } from '../shared/store-island.js';

const FILTER_TABS = [FILTER.MUSCLES, FILTER.BODY_PARTS, FILTER.EQUIPMENT];

/**
 * @param {HTMLElement} root
 * @param {string} activeFilter
 */
function render(root, activeFilter) {
  const tabs = FILTER_TABS.map((label) => {
    const isActive = label === activeFilter;

    return `
      <button
        type="button"
        class="filters__tab${isActive ? ' filters__tab--active' : ''}"
        aria-pressed="${isActive}"
        data-filter="${escapeHtml(label)}"
      >
        <span class="filters__label">${escapeHtml(label)}</span>
        <span class="filters__underline" aria-hidden="true"></span>
      </button>`;
  }).join('');

  root.innerHTML = tabs;
}

/**
 * @param {string} filter
 */
function selectFilter(filter) {
  const { activeFilter } = getState();

  if (filter === activeFilter) return;

  setState({
    activeFilter: filter,
    page: 1,
    category: null,
    keyword: '',
  });
}

/**
 * @param {HTMLElement | null} root
 * @returns {() => void} teardown
 */
export function initFilters(root) {
  if (!root) return () => {};

  const onClick = (/** @type {Event} */ event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const tab = target.closest('[data-filter]');

    if (!tab || !root.contains(tab)) return;

    selectFilter(tab.getAttribute('data-filter') ?? '');
  };

  const sync = (
    /** @type {import('../../services/store.service.js').AppState} */ state,
  ) => render(root, state.activeFilter);

  return bindStoreIsland(sync, { root, listeners: [['click', onClick]] });
}
