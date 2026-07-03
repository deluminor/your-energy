export const SPRITE_ICON = {
  CHEVRON_LEFT: 'icon-chevron-left',
  CHEVRON_RIGHT: 'icon-chevron-right',
  RUNNING: 'icon-running',
  STAR: 'icon-star',
  TRASH: 'icon-trash',
  CLOSE: 'icon-close',
  ARROW_UP_RIGHT: 'icon-arrow-up-right',
  SEARCH: 'icon-search',
  HEART: 'icon-heart',
};

/**
 * @param {string} iconId
 * @param {{
 *   className?: string;
 *   width?: number | string;
 *   height?: number | string;
 *   viewBox?: string;
 *   stroke?: boolean;
 * }} [options]
 * @returns {string}
 * @example
 */
export function renderSpriteIcon(iconId, options = {}) {
  const {
    className = '',
    width,
    height,
    viewBox = '0 0 32 32',
    stroke = false,
  } = options;

  const paintAttrs = stroke
    ? 'fill="none" stroke="currentColor"'
    : 'fill="currentColor"';

  const sizeAttrs = [
    width !== undefined && width !== null ? `width="${width}"` : '',
    height !== undefined && height !== null ? `height="${height}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const classAttr = className ? ` class="${className}"` : '';

  return `<svg${classAttr} ${sizeAttrs} viewBox="${viewBox}" ${paintAttrs} aria-hidden="true"><use href="#${iconId}"></use></svg>`;
}
