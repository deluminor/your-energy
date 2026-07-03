import { FILTER } from '../../utils/constants.js';
import { escapeHtml } from '../../utils/escape-html.js';

export const FILTER_TABS = [
  FILTER.MUSCLES,
  FILTER.BODY_PARTS,
  FILTER.EQUIPMENT,
];

/**
 * @param {string} activeFilter
 * @returns {string}
 */
export function renderFiltersMarkup(activeFilter) {
  return FILTER_TABS.map((label) => {
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
}
