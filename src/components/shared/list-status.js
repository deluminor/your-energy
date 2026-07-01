import { escapeHtml } from '../../utils/escape-html.js';

/**
 * @typedef {object} ListStatus
 * @property {(root: HTMLElement) => void} showRefreshing  Overlays a spinner over an already-populated list.
 * @property {(root: HTMLElement) => void} hideRefreshing  Removes the refreshing overlay.
 * @property {(root: HTMLElement, srLabel: string) => void} renderLoading  First-load spinner state.
 * @property {(root: HTMLElement, message: string) => void} renderEmpty    Empty / failure message state.
 */

/**
 * @param {string} block  BEM block name, e.g. `'exercise-list'`.
 * @returns {ListStatus}
 */
export function createListStatus(block) {
  const REFRESH_CLASS = `${block}__refresh`;
  const REFRESHING_MODIFIER = `${block}--refreshing`;

  /** @param {HTMLElement} root */
  function hideRefreshing(root) {
    root.classList.remove(REFRESHING_MODIFIER);
    root.removeAttribute('aria-busy');
    root.querySelector(`.${REFRESH_CLASS}`)?.remove();
  }

  /** @param {HTMLElement} root */
  function showRefreshing(root) {
    root.classList.add(REFRESHING_MODIFIER);
    root.setAttribute('aria-busy', 'true');

    if (root.querySelector(`.${REFRESH_CLASS}`)) return;

    const refresh = document.createElement('li');

    refresh.className = REFRESH_CLASS;
    refresh.setAttribute('aria-hidden', 'true');
    refresh.innerHTML =
      '<span class="loader__spinner" aria-hidden="true"></span>';

    root.append(refresh);
  }

  /**
   * @param {HTMLElement} root
   * @param {string} srLabel  Screen-reader label announced while loading.
   */
  function renderLoading(root, srLabel) {
    hideRefreshing(root);

    root.innerHTML = `
      <li class="${block}__status ${block}__status--loading">
        <span class="loader__spinner" aria-hidden="true"></span>
        <span class="visually-hidden">${escapeHtml(srLabel)}</span>
      </li>`;

    root.setAttribute('aria-busy', 'true');
  }

  /**
   * @param {HTMLElement} root
   * @param {string} message
   */
  function renderEmpty(root, message) {
    hideRefreshing(root);

    root.innerHTML = `
      <li class="${block}__status ${block}__status--empty">
        <div class="placeholder">${escapeHtml(message)}</div>
      </li>`;
  }

  return { showRefreshing, hideRefreshing, renderLoading, renderEmpty };
}
