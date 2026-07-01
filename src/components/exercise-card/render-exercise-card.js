import { escapeHtml } from '../../utils/escape-html.js';
import { renderSpriteIcon, SPRITE_ICON } from '../../utils/sprite-icon.js';
import { renderBadge } from '../ui/badge/badge.js';

const RUNNER_ICON = renderSpriteIcon(SPRITE_ICON.RUNNING, {
  className: 'exercise-card__icon-glyph',
  width: 14,
  height: 14,
});

const STAR_ICON = renderSpriteIcon(SPRITE_ICON.STAR, {
  className: 'exercise-card__star',
  width: 18,
  height: 18,
});

const TRASH_ICON = renderSpriteIcon(SPRITE_ICON.TRASH, {
  className: 'exercise-card__trash-icon',
  width: 18,
  height: 18,
  stroke: true,
});

const ARROW_ICON = renderSpriteIcon(SPRITE_ICON.ARROW_UP_RIGHT, {
  className: 'exercise-card__arrow',
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  stroke: true,
});

/**
 * @param {unknown} rating
 * @returns {string}
 */
function formatRating(rating) {
  const value = Number(rating);
  return (Number.isFinite(value) ? value : 0).toFixed(1);
}

/**
 * @param {unknown} calories
 * @returns {string}
 */
function formatCalories(calories) {
  const value = Number(calories);
  return Number.isFinite(value) ? `${value} / 3 min` : '—';
}

/**
 * @param {string} label
 * @param {string} value
 * @returns {string}
 */
function renderMetaItem(label, value) {
  return `
    <li class="exercise-card__meta-item">
      <span class="exercise-card__meta-label">${escapeHtml(label)}</span>
      <span class="exercise-card__meta-value">${escapeHtml(value || '—')}</span>
    </li>`;
}

/**
 * @param {string} id
 * @returns {string}
 */
function renderStartButton(id) {
  return `
    <button
      type="button"
      class="exercise-card__start"
      data-id="${escapeHtml(id)}"
    >
      <span>Start</span>
      ${ARROW_ICON}
    </button>`;
}

/**
 * @param {string} id
 * @param {unknown} rating
 * @returns {string}
 */
function renderRating(id, rating) {
  void id;

  return `
    <span class="exercise-card__rating">
      <span class="exercise-card__rating-value">${formatRating(rating)}</span>
      ${STAR_ICON}
    </span>`;
}

/**
 * @param {string} id
 * @returns {string}
 */
function renderRemoveButton(id) {
  return `
    <button
      type="button"
      class="exercise-card__remove"
      data-remove-id="${escapeHtml(id)}"
      aria-label="Remove from favorites"
    >
      ${TRASH_ICON}
    </button>`;
}

/**
 * @param {string} id
 * @param {'catalog' | 'favorite'} variant
 * @param {unknown} rating
 * @returns {string}
 */
function renderCardTop(id, variant, rating) {
  const actionMarkup =
    variant === 'favorite' ? renderRemoveButton(id) : renderRating(id, rating);

  return `
    <div class="exercise-card__top">
      ${renderBadge()}
      ${actionMarkup}
      ${renderStartButton(id)}
    </div>`;
}

/**
 * @param {{ _id?: unknown, name?: unknown, rating?: unknown, burnedCalories?: unknown, bodyPart?: unknown, target?: unknown }} exercise
 * @param {{ variant?: 'catalog' | 'favorite' }} [options]
 * @returns {string}
 * @example
 * renderExerciseCard({ _id: '1', name: 'Air bike', rating: 4, burnedCalories: 312, bodyPart: 'waist', target: 'abs' });
 */
export function renderExerciseCard(exercise, options = {}) {
  const variant = options.variant ?? 'catalog';
  const id = String(exercise._id ?? '');
  const name = String(exercise.name ?? '');
  const bodyPart = String(exercise.bodyPart ?? '');
  const target = String(exercise.target ?? '');

  return `
    <li class="exercise-card">
      ${renderCardTop(id, variant, exercise.rating)}

      <div class="exercise-card__title">
        <span class="exercise-card__icon">${RUNNER_ICON}</span>
        <h3 class="exercise-card__name"${name ? ` title="${escapeHtml(name)}"` : ''}>${escapeHtml(name)}</h3>
      </div>

      <ul class="exercise-card__meta">
        ${renderMetaItem('Burned cal.:', formatCalories(exercise.burnedCalories))}
        ${renderMetaItem('Body part:', bodyPart)}
        ${renderMetaItem('Target:', target)}
      </ul>
    </li>`;
}

/**
 * @param {Parameters<typeof renderExerciseCard>[0]} exercise
 * @returns {string}
 */
export function renderFavoriteExerciseCard(exercise) {
  return renderExerciseCard(exercise, { variant: 'favorite' });
}
