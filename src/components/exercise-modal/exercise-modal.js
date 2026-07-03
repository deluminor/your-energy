import { getExerciseById } from '../../api/exercises.api.js';
import {
  isFavorite,
  toggleFavorite,
} from '../../services/favorites.service.js';
import { LOADER } from '../../utils/constants.js';
import { escapeHtml } from '../../utils/escape-html.js';
import { SPRITE_ICON, renderSpriteIcon } from '../../utils/sprite-icon.js';
import { openRatingModal } from '../rating-modal/rating-modal.js';
import { openModal } from '../ui/modal/modal.js';

/** @typedef {import('../../types/exercise').Exercise} Exercise */

/**
 * Generate content for button
 * @param {boolean} isFav
 * @returns {string} HTML
 */
function getFavButtonContent(isFav) {
  const text = isFav ? 'Remove from favorites' : 'Add to favorites';
  const iconName = isFav ? SPRITE_ICON.TRASH : SPRITE_ICON.HEART;

  const iconHtml = renderSpriteIcon(iconName, {
    className: 'exercise-modal__btn-icon',
    width: 18,
    height: 18,
    viewBox: '0 0 32 32',
    stroke: true,
  });

  return `<span>${text}</span> ${iconHtml}`;
}

/**
 * Render rating
 * @param {number | string} rating
 * @returns {string} HTML
 */
function renderRating(rating) {
  const numericRating = Number(rating) || 0;
  const ratingPercentage = (numericRating / 5) * 100;

  let starsHtml = '';
  for (let i = 0; i < 5; i++) {
    starsHtml += renderSpriteIcon(SPRITE_ICON.STAR, {
      className: 'exercise-modal__star-icon',
      width: 18,
      height: 18,
    });
  }

  return `
    <div class="exercise-modal__rating">
      <span class="exercise-modal__rating-value">${numericRating.toFixed(1)}</span>
      <div class="exercise-modal__stars-wrapper">
        <div class="exercise-modal__stars-background">${starsHtml}</div>
        <div class="exercise-modal__stars-foreground" style="width: ${ratingPercentage}%;">
          ${starsHtml}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render list of exercise features
 * @param {Exercise} exercise
 * @returns {string} HTML
 */
function renderStatsList(exercise) {
  const statsConfig = [
    { label: 'Target', value: exercise.target },
    { label: 'Body Part', value: exercise.bodyPart },
    { label: 'Equipment', value: exercise.equipment },
    { label: 'Popular', value: exercise.popularity },
    { label: 'Burned calories', value: `${exercise.burnedCalories}/3 min` },
  ];

  return `
    <ul class="exercise-modal__stats-list">
      ${statsConfig
        .map(
          (stat) => `
        <li class="exercise-modal__stats-list-item">
          <span class="label">${stat.label}</span>
          <span class="value">${escapeHtml(stat.value)}</span>
        </li>
      `,
        )
        .join('')}
    </ul>
  `;
}

/**
 * Render modal content
 * @param {Exercise} exercise
 * @returns {string} HTML
 */
function renderExerciseContent(exercise) {
  const isFav = isFavorite(exercise._id);

  const imageHtml = exercise.gifUrl
    ? `<img src="${exercise.gifUrl}" alt="${escapeHtml(exercise.name)}" class="exercise-modal__img" />`
    : `<div class="exercise-modal__img-placeholder">No image</div>`;

  return `
    <div class="exercise-modal" data-component="exercise-modal">
      <div class="exercise-modal__container">
        <div class="exercise-modal__media">${imageHtml}</div>

        <div class="exercise-modal__info">
          <h2 class="exercise-modal__title">${escapeHtml(exercise.name)}</h2>

          ${renderRating(Number(exercise.rating))}
          ${renderStatsList(exercise)}

          <p class="exercise-modal__description">${escapeHtml(exercise.description)}</p>

          <div class="exercise-modal__actions">
            <button class="exercise-modal__btn-fav" type="button" data-action="fav">
              ${getFavButtonContent(isFav)}
            </button>
            <button class="exercise-modal__btn-rate" type="button" data-action="rate">
              Give a rating
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

const LOADING_CONTENT = `
  <div
    class="exercise-modal exercise-modal--loading"
    data-component="exercise-modal"
    aria-busy="true"
  >
    <span class="visually-hidden">Loading exercise details...</span>
  </div>
`;

/**
 * @param {Exercise} exerciseData
 * @param {string} exerciseId
 * @param {{ onClose?: () => void, onToggleFavorite?: () => void }} options
 */
function bindExerciseModalActions(exerciseData, exerciseId, options) {
  const modalRoot = document.getElementById('modal-root');
  const actionsContainer = modalRoot?.querySelector('.exercise-modal__actions');

  actionsContainer?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = /** @type {HTMLButtonElement | null} */ (
      target.closest('button')
    );
    if (!button) return;

    const action = button.dataset.action;

    if (action === 'fav') {
      const isNowFavorite = toggleFavorite(exerciseData);
      button.innerHTML = getFavButtonContent(isNowFavorite);

      options.onToggleFavorite?.();
    }

    if (action === 'rate') {
      openRatingModal({
        exerciseId: exerciseData._id,
        onClose: () => openExerciseModal(exerciseId, options),
      });
    }
  });
}

/**
 * @param {string} exerciseId
 * @param {{ onClose?: () => void, onToggleFavorite?: () => void }} [options]
 * @returns {Promise<(() => void) | undefined>}
 */
export async function openExerciseModal(exerciseId, options = {}) {
  const close = openModal({
    name: 'exercise',
    label: 'Exercise details',
    content: LOADING_CONTENT,
    onClose: options.onClose,
  });

  try {
    const exerciseData = /** @type {Exercise} */ (
      await getExerciseById(exerciseId, { loader: LOADER.EXERCISE_MODAL })
    );

    const host = document.querySelector('[data-component="exercise-modal"]');
    if (!host) return close;

    host.outerHTML = renderExerciseContent(exerciseData);

    const dialog = document.querySelector(
      '.modal[data-modal="exercise"] .modal__dialog',
    );
    dialog?.setAttribute(
      'aria-label',
      `Exercise details for ${exerciseData.name}`,
    );

    bindExerciseModalActions(exerciseData, exerciseId, options);

    return close;
  } catch (error) {
    console.error('Failed to load exercise:', error);

    const host = document.querySelector('[data-component="exercise-modal"]');
    if (!host) return close;

    host.classList.remove('exercise-modal--loading');
    host.removeAttribute('aria-busy');
    host.innerHTML =
      '<p class="exercise-modal__error">Failed to load exercise. Please try again.</p>';

    return close;
  }
}
