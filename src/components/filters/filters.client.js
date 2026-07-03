import { getState, setState } from '../../services/store.service.js';
import { bindStoreIsland } from '../shared/store-island.js';
import { renderFiltersMarkup } from './render-filters.js';

/**
 * @param {HTMLElement} root
 * @param {string} activeFilter
 */
function render(root, activeFilter) {
  const tabs = root.querySelectorAll('[data-filter]');

  if (tabs.length > 0) {
    for (const tab of tabs) {
      const filter = tab.getAttribute('data-filter') ?? '';
      const isActive = filter === activeFilter;

      tab.classList.toggle('filters__tab--active', isActive);
      tab.setAttribute('aria-pressed', String(isActive));
    }

    return;
  }

  root.innerHTML = renderFiltersMarkup(activeFilter);
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
