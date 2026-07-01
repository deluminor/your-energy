// TODO: add to SVG sprite
const CHEVRON_LEFT = `<svg class="pagination__icon" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M11.77 5.23a.75.75 0 0 1 0 1.06L7.06 11l4.71 4.71a.75.75 0 0 1-1.06 1.06l-5.24-5.24a.75.75 0 0 1 0-1.06l5.24-5.24a.75.75 0 0 1 1.06 0Z"/></svg>`;
const CHEVRON_RIGHT = `<svg class="pagination__icon" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M8.23 5.23a.75.75 0 0 0 0 1.06L12.94 11l-4.71 4.71a.75.75 0 0 0 1.06 1.06l5.24-5.24a.75.75 0 0 0 0-1.06l-5.24-5.24a.75.75 0 0 0-1.06 0Z"/></svg>`;

/**
 * @param {'left' | 'right'} direction
 * @returns {string}
 */
export function renderChevronIcon(direction) {
  return direction === 'left' ? CHEVRON_LEFT : CHEVRON_RIGHT;
}

/**
 * @param {'left' | 'right'} direction
 * @returns {string}
 */
export function renderDoubleChevronIcon(direction) {
  const icon = direction === 'left' ? CHEVRON_LEFT : CHEVRON_RIGHT;
  return `<span class="pagination__icon-set pagination__icon-set--double">${icon}${icon}</span>`;
}
