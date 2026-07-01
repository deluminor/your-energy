import { getFilters } from '../../api/filters.api.js';
import { getState, setState } from '../../services/store.service.js';
import { LOADER } from '../../utils/constants.js';
import { renderCategoryCard } from '../category-card/render-category-card.js';
import { createListStatus } from '../shared/list-status.js';
import { bindStoreIsland } from '../shared/store-island.js';

const BLOCK = 'category-list';
const status = createListStatus(BLOCK);

/** @type {string | null} */
let inflightKey = null;

/**
 * @typedef {import('../../services/store.service.js').AppState} AppState
 * @typedef {{ name?: unknown, filter?: unknown, imgURL?: unknown }} CategoryItem
 */

/**
 * @param {HTMLElement} root
 * @param {CategoryItem[]} items
 * @param {string} caption
 */
function render(root, items, caption) {
  status.hideRefreshing(root);

  if (!items.length) {
    status.renderEmpty(root, 'No categories found.');
    return;
  }

  root.innerHTML = items
    .map((item) =>
      renderCategoryCard({
        name: String(item.name ?? ''),
        filter: String(item.filter ?? ''),
        imgURL: String(item.imgURL ?? ''),
        caption,
      }),
    )
    .join('');

  root.classList.add('category-list--revealing');

  requestAnimationFrame(() => {
    root.classList.remove('category-list--revealing');
  });
}

/**
 * @param {HTMLElement} root
 */
async function loadCategories(root) {
  const { activeFilter, page } = getState();
  const requestKey = `${activeFilter}:${page}`;

  if (inflightKey === requestKey) return;

  inflightKey = requestKey;

  const hasCards = Boolean(root.querySelector('.category-card'));

  if (hasCards) {
    status.showRefreshing(root);
  } else {
    status.renderLoading(root, 'Loading categories…');
  }

  try {
    const {
      results,
      totalPages,
      page: responsePage,
    } = await getFilters(
      { filter: activeFilter, page },
      { loader: LOADER.SILENT },
    );

    const current = getState();
    const responseKey = `${current.activeFilter}:${current.page}`;

    if (responseKey !== requestKey) return;

    render(root, results, current.activeFilter);

    /** @type {Partial<AppState>} */
    const patch = {};

    if (current.totalPages !== totalPages) patch.totalPages = totalPages;
    if (current.page !== responsePage) patch.page = responsePage;

    if (Object.keys(patch).length > 0) setState(patch);
  } catch (error) {
    console.error('category-list: failed to load categories', error);
    status.renderEmpty(root, 'Failed to load categories.');
  } finally {
    if (inflightKey === requestKey) inflightKey = null;
  }
}

/**
 * @param {HTMLElement | null} root
 * @returns {() => void} teardown
 */
export function initCategoryList(root) {
  if (!root) return () => {};

  /** @type {string} */
  let lastKey = '';

  const onClick = (/** @type {Event} */ event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const card = target.closest('.category-card');

    if (!card || !root.contains(card)) return;

    const name = card.getAttribute('data-name');
    const filter = card.getAttribute('data-filter');

    if (!name || !filter) return;

    setState({ category: { name, filter }, page: 1, keyword: '' });
  };

  const sync = (/** @type {Readonly<AppState>} */ state) => {
    const isCategoriesView = state.category === null;

    root.hidden = !isCategoriesView;

    if (!isCategoriesView) {
      lastKey = '';
      return;
    }

    const key = `${state.activeFilter}:${state.page}`;

    if (key === lastKey) return;

    lastKey = key;
    loadCategories(root);
  };

  return bindStoreIsland(sync, { root, listeners: [['click', onClick]] });
}
