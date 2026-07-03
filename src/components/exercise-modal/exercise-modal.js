import { getExerciseById } from '../../api/exercises.api.js';
import {
  isFavorite,
  toggleFavorite,
} from '../../services/favorites.service.js';
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
  `;
}

/**
 * @param {string} exerciseId
 * @returns {Promise<(() => void) | undefined>}
 */
export async function openExerciseModal(exerciseId) {
  try {
    const exerciseData = /** @type {Exercise} */ (
      await getExerciseById(exerciseId)
    );

    const modalContent = renderExerciseContent(exerciseData);
    const close = openModal({
      name: 'exercise',
      label: `Exercise details for ${exerciseData.name}`,
      content: modalContent,
    });

    const modalRoot = document.getElementById('modal-root');
    const actionsContainer = modalRoot?.querySelector(
      '.exercise-modal__actions',
    );

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
      }

      if (action === 'rate') {
        openRatingModal({
          exerciseId: exerciseData._id,
          onClose: () => openExerciseModal(exerciseId),
        });
      }
    });

    return close;
  } catch (error) {
    console.error('Failed to load exercise:', error);
  }
}
