export const ROUTES = {
  HOME: '',
  FAVORITES: 'favorites',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export type NavItem = {
  label: string;
  path: RoutePath;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', path: ROUTES.HOME },
  { label: 'Favorites', path: ROUTES.FAVORITES },
] as const;
