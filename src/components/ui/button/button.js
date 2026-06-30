import { escapeHtml } from '../../../utils/escape-html.js';

/**
 * @param {{ label?: string, type?: string }} [props]
 * @returns {string}
 */
export function renderButton({ label = 'Button', type = 'button' } = {}) {
  return `<button class="button" type="${escapeHtml(type)}">${escapeHtml(label)}</button>`;
}

/**
 * Toggles a button's loading state: disables it and shows an inline spinner.
 * @param {HTMLButtonElement} button
 * @param {boolean} isLoading
 */
export function setButtonLoading(button, isLoading) {
  button.classList.toggle('button--loading', isLoading);
  button.disabled = isLoading;
  button.setAttribute('aria-busy', String(isLoading));
}
