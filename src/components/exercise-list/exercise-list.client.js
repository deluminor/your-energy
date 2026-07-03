import { getExercises } from '../../api/exercises.api.js';
import { getState, setState } from '../../services/store.service.js';
import { FILTER_PARAM, LOADER } from '../../utils/constants.js';
import { renderExerciseCard } from '../exercise-card/render-exercise-card.js';
import { openExerciseModal } from '../exercise-modal/exercise-modal.js';
import { createListStatus } from '../shared/list-status.js';
import { bindStoreIsland } from '../shared/store-island.js';

const BLOCK = 'exercise-list';
const status = createListStatus(BLOCK);

/** @type {string | null} */
let inflightKey = null;

/**
 * @typedef {import('../../services/store.service.js').AppState} AppState
 */

/**
 * @param {Readonly<AppState>} state
 * @returns {string}
 */
function requestKeyOf(state) {
  const categoryName = state.category ? state.category.name : '';
  return `${state.activeFilter}|${categoryName}|${state.keyword}|${state.page}`;
}

/**
 * @param {HTMLElement} root
 * @param {object[]} items
 */
function render(root, items) {
  status.hideRefreshing(root);

  if (!items.length) {
    status.renderEmpty(
      root,
      'No exercises found. Try a different keyword or category.',
    );
    return;
  }

  root.innerHTML = items
    .map((item) =>
      renderExerciseCard(/** @type {Record<string, unknown>} */ (item)),
    )
    .join('');
}

/**
 * @param {HTMLElement} root
 */
async function loadExercises(root) {
  const state = getState();

  if (!state.category) return;

  const requestKey = requestKeyOf(state);

  if (inflightKey === requestKey) return;

  inflightKey = requestKey;

  const hasCards = Boolean(root.querySelector('.exercise-card'));

  if (hasCards) {
    status.showRefreshing(root);
  } else {
    status.renderLoading(root, 'Loading exercises…');
  }

  const paramKey = FILTER_PARAM[state.activeFilter];

  try {
    const {
      results,
      totalPages,
      page: responsePage,
    } = await getExercises(
      {
        [paramKey]: state.category.name,
        keyword: state.keyword,
        page: state.page,
      },
      { loader: LOADER.SILENT },
    );

    if (requestKeyOf(getState()) !== requestKey) return;

    render(root, results);

    const current = getState();
    /** @type {Partial<AppState>} */
    const patch = {};

    if (current.totalPages !== totalPages) patch.totalPages = totalPages;
    if (current.page !== responsePage) patch.page = responsePage;

    if (Object.keys(patch).length > 0) setState(patch);
  } catch (error) {
    console.error('exercise-list: failed to load exercises', error);
    status.renderEmpty(root, 'Failed to load exercises.');
  } finally {
    if (inflightKey === requestKey) inflightKey = null;
  }
}

/**
 * @param {HTMLElement | null} root
 * @returns {() => void} teardown
 */
export function initExerciseList(root) {
  if (!root) return () => {};

  /** @type {string} */
  let lastKey = '';

  const onClick = (/** @type {Event} */ event) => {
    const target = /** @type {HTMLElement} */ (event.target);

    const card = target.closest('.exercise-card');
    if (!card || !root.contains(card)) return;

    const startBtn = card.querySelector('.exercise-card__start');
    const id = startBtn?.getAttribute('data-id');

    if (!id) return;

    openExerciseModal(id);
  };

  const sync = (/** @type {Readonly<AppState>} */ state) => {
    const isExercisesView = state.category !== null;

    root.hidden = !isExercisesView;

    if (!isExercisesView) {
      lastKey = '';
      return;
    }

    const key = requestKeyOf(state);

    if (key === lastKey) return;

    lastKey = key;
    loadExercises(root);
  };

  return bindStoreIsland(sync, { root, listeners: [['click', onClick]] });
}
