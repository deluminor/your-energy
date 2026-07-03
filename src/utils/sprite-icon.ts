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
} as const;

export type SpriteIconId = (typeof SPRITE_ICON)[keyof typeof SPRITE_ICON];

export interface RenderSpriteIconOptions {
  className?: string;
  width?: number | string;
  height?: number | string;
  viewBox?: string;
  stroke?: boolean;
}

export function renderSpriteIcon(
  iconId: string,
  options: RenderSpriteIconOptions = {},
): string {
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
