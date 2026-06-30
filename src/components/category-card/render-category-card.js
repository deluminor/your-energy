import { escapeHtml } from '../../utils/escape-html.js';

/**
 * @param {{ name: string, filter: string, imgURL: string, caption: string }} props
 * @returns {string}
 */
export function renderCategoryCard({ name, filter, imgURL, caption }) {
  const safeUrl = encodeURI(String(imgURL ?? '')).replace(/'/g, '%27');

  return `
    <li class="category-list__item">
      <button
        type="button"
        class="category-card"
        data-name="${escapeHtml(name)}"
        data-filter="${escapeHtml(filter)}"
        style="--card-image: url('${safeUrl}')"
      >
        <span class="category-card__name">${escapeHtml(name)}</span>
        <span class="category-card__caption">${escapeHtml(caption)}</span>
      </button>
    </li>`;
}
