import {
  getFavorites,
  removeFavorite,
} from '../../services/favorites.service.js';
import { PAGE_LIMIT, STORAGE_KEYS } from '../../utils/constants.js';
import { openExerciseModal } from '../exercise-modal/exercise-modal.js';
import { bindPaginationControls } from '../pagination/pagination-controls.js';
import { renderPagination } from '../pagination/pagination-view.js';
import { createListStatus } from '../shared/list-status.js';
import { renderFavoriteExerciseCard } from './render-exercise-card.js';

const status = createListStatus('favorites-list');

/**
 * @param {unknown[]} items
 * @param {number} page
 * @returns {{ items: unknown[], page: number, totalPages: number }}
 */
function paginate(items, page) {
  const totalPages = Math.max(
    1,
    Math.ceil(items.length / PAGE_LIMIT.EXERCISES),
  );
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * PAGE_LIMIT.EXERCISES;

  return {
    items: items.slice(start, start + PAGE_LIMIT.EXERCISES),
    page: safePage,
    totalPages,
  };
}

/**
 * @param {HTMLElement | null} root
 * @returns {() => void} teardown
 */
export function initFavoritesList(root) {
  if (!root) return () => {};

  const listRoot = root.querySelector('.favorites-list');
  const paginationRoot = root.querySelector('[data-favorites-pagination]');

  if (
    !(listRoot instanceof HTMLElement) ||
    !(paginationRoot instanceof HTMLElement)
  ) {
    return () => {};
  }

  /** @type {import('../../types/exercise').Exercise[]} */
  let favorites = [];
  let currentPage = 1;

  const renderList = () => {
    if (!favorites.length) {
      status.renderEmpty(
        listRoot,
        "It appears that you haven't added any exercises to your favorites yet. To get started, you can add exercises that you like to your favorites for easier access in the future.",
      );

      renderPagination(paginationRoot, { page: 1, totalPages: 1 });

      return;
    }

    const slice = paginate(favorites, currentPage);
    currentPage = slice.page;

    listRoot.innerHTML = slice.items
      .map((item) =>
        renderFavoriteExerciseCard(
          /** @type {Record<string, unknown>} */ (item),
        ),
      )
      .join('');

    renderPagination(paginationRoot, {
      page: slice.page,
      totalPages: slice.totalPages,
    });
  };

  const refresh = (/** @type {number} */ page = currentPage) => {
    favorites = getFavorites();
    currentPage = page;
    renderList();
  };

  const paginationTeardown = bindPaginationControls(paginationRoot, {
    getState: () => paginate(favorites, currentPage),
    onPageChange: (nextPage) => {
      currentPage = nextPage;
      renderList();
    },
  });

  const onClick = (/** @type {Event} */ event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const removeButton = target.closest('[data-remove-id]');

    if (removeButton && listRoot.contains(removeButton)) {
      const id = removeButton.getAttribute('data-remove-id');

      if (!id) return;

      removeFavorite(id);
      refresh(currentPage);
      return;
    }

    const startButton = target.closest('.exercise-card__start');

    if (startButton && listRoot.contains(startButton)) {
      const exerciseId = startButton.getAttribute('data-id');

      if (!exerciseId) return;

      openExerciseModal(exerciseId, {
        onToggleFavorite: () => {
          refresh(currentPage);
        },
      });
    }
  };

  const onStorage = (/** @type {StorageEvent} */ event) => {
    if (event.key !== null && event.key !== STORAGE_KEYS.FAVORITES) return;

    refresh(currentPage);
  };

  root.addEventListener('click', onClick);
  window.addEventListener('storage', onStorage);
  refresh(1);

  return () => {
    paginationTeardown();
    root.removeEventListener('click', onClick);
    window.removeEventListener('storage', onStorage);
  };
}
