export type NavItem = {
  label: string;
  path: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', path: '' },
  { label: 'Favorites', path: 'favorites' },
] as const;