import { escapeHtml } from '../../utils/escape-html.js';
import { renderBadge } from '../ui/badge/badge.js';

// TODO: add to SVG sprite
const RUNNER_ICON = `<svg class="exercise-card__icon-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="16" cy="5" r="1.6"/><path d="M6 19l3.2-3.6 2.6 1.9L13 12"/><path d="M8.6 10.6 12.4 8l3 2.8 2.6-.2"/></svg>`;
const STAR_ICON = `<svg class="exercise-card__star" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.3l6.5-.9L12 2.5Z"/></svg>`;
const ARROW_ICON = `<svg class="exercise-card__arrow" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10"/></svg>`;

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
 * @param {{ _id?: unknown, name?: unknown, rating?: unknown, burnedCalories?: unknown, bodyPart?: unknown, target?: unknown }} exercise
 * @returns {string}
 * @example
 * renderExerciseCard({ _id: '1', name: 'Air bike', rating: 4, burnedCalories: 312, bodyPart: 'waist', target: 'abs' });
 */
export function renderExerciseCard(exercise) {
  const id = String(exercise._id ?? '');
  const name = String(exercise.name ?? '');
  const bodyPart = String(exercise.bodyPart ?? '');
  const target = String(exercise.target ?? '');

  return `
    <li class="exercise-card">
      <div class="exercise-card__top">
        ${renderBadge()}
        <span class="exercise-card__rating">
          <span class="exercise-card__rating-value">${formatRating(exercise.rating)}</span>
          ${STAR_ICON}
        </span>
        <button
          type="button"
          class="exercise-card__start"
          data-id="${escapeHtml(id)}"
        >
          <span>Start</span>
          ${ARROW_ICON}
        </button>
      </div>

      <div class="exercise-card__title">
        <span class="exercise-card__icon">${RUNNER_ICON}</span>
        <h3 class="exercise-card__name">${escapeHtml(name)}</h3>
      </div>

      <ul class="exercise-card__meta">
        ${renderMetaItem('Burned calories:', formatCalories(exercise.burnedCalories))}
        ${renderMetaItem('Body part:', bodyPart)}
        ${renderMetaItem('Target:', target)}
      </ul>
    </li>`;
}
