import { getFilters } from '../../api/filters.api.js';
import { getState, setState, subscribe } from '../../services/store.service.js';
import { LOADER } from '../../utils/constants.js';
import { escapeHtml } from '../../utils/escape-html.js';
import { renderCategoryCard } from '../category-card/render-category-card.js';

const REFRESH_CLASS = 'category-list__refresh';

/** @type {string | null} */
let inflightKey = null;

/**
 * @typedef {{ name?: unknown, filter?: unknown, imgURL?: unknown }} CategoryItem
 */

/**
 * @param {HTMLElement} root
 */
function showRefreshing(root) {
  root.classList.add('category-list--refreshing');
  root.setAttribute('aria-busy', 'true');

  if (root.querySelector(`.${REFRESH_CLASS}`)) return;

  const refresh = document.createElement('li');

  refresh.className = REFRESH_CLASS;
  refresh.setAttribute('aria-hidden', 'true');
  refresh.innerHTML =
    '<span class="loader__spinner" aria-hidden="true"></span>';

  root.append(refresh);
}

/**
 * @param {HTMLElement} root
 */
function hideRefreshing(root) {
  root.classList.remove('category-list--refreshing');
  root.removeAttribute('aria-busy');
  root.querySelector(`.${REFRESH_CLASS}`)?.remove();
}

/**
 * @param {HTMLElement} root
 */
function renderLoading(root) {
  hideRefreshing(root);

  root.innerHTML = `
    <li class="category-list__status category-list__status--loading">
      <span class="loader__spinner" aria-hidden="true"></span>
      <span class="visually-hidden">Loading categories…</span>
    </li>`;

  root.setAttribute('aria-busy', 'true');
}

/**
 * @param {HTMLElement} root
 * @param {string} message
 */
function renderEmpty(root, message) {
  hideRefreshing(root);

  root.innerHTML = `
    <li class="category-list__status category-list__status--empty">
      <div class="placeholder">${escapeHtml(message)}</div>
    </li>`;
}

/**
 * @param {HTMLElement} root
 * @param {CategoryItem[]} items
 * @param {string} caption
 */
function render(root, items, caption) {
  hideRefreshing(root);

  if (!items.length) {
    renderEmpty(root, 'No categories found.');
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
    showRefreshing(root);
  } else {
    renderLoading(root);
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

    const patch = /** @type {Record<string, number>} */ ({});

    if (current.totalPages !== totalPages) {
      patch.totalPages = totalPages;
    }

    if (current.page !== responsePage) {
      patch.page = responsePage;
    }

    if (Object.keys(patch).length > 0) {
      setState(patch);
    }
  } catch (error) {
    console.error('category-list: failed to load categories', error);
    renderEmpty(root, 'Failed to load categories.');
  } finally {
    if (inflightKey === requestKey) {
      inflightKey = null;
    }
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

  const onClick = (/** @type {MouseEvent} */ event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const card = target.closest('.category-card');

    if (!card || !root.contains(card)) return;

    const name = card.getAttribute('data-name');
    const filter = card.getAttribute('data-filter');

    if (!name || !filter) return;

    setState({ category: { name, filter } });
  };

  const stop = subscribe((state) => {
    const key = `${state.activeFilter}:${state.page}`;

    if (key === lastKey) return;

    lastKey = key;
    loadCategories(root);
  });

  const initialKey = `${getState().activeFilter}:${getState().page}`;
  lastKey = initialKey;
  loadCategories(root);

  root.addEventListener('click', onClick);

  return () => {
    stop();
    root.removeEventListener('click', onClick);
  };
}
