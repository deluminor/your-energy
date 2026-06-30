import { escapeHtml } from '../../../utils/escape-html.js';

/**
 * @param {string} [label]
 */
export function renderBadge(label = 'WORKOUT') {
  return `<span class="badge">${escapeHtml(label)}</span>`;
}
