export const API_BASE_URL = 'https://your-energy.b.goit.study/api';

export const ENDPOINTS = {
  filters: '/filters',
  exercises: '/exercises',
  exerciseById: (id) => `/exercises/${id}`,
  rating: (id) => `/exercises/${id}/rating`,
  quote: '/quote',
  subscription: '/subscription',
};

export const FILTER = {
  MUSCLES: 'Muscles',
  BODY_PARTS: 'Body parts',
  EQUIPMENT: 'Equipment',
};

export const DEFAULT_FILTER = FILTER.MUSCLES;

export const PAGE_LIMIT = {
  CATEGORIES: 12,
  EXERCISES: 10,
};

export const STORAGE_KEYS = {
  FAVORITES: 'your-energy:favorites',
  QUOTE: 'your-energy:quote-of-the-day',
};

export const EMAIL_PATTERN = /^\w+(\.\w+)?@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;

export const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Loader modes passed per-request via Axios `config.meta.loader`.
 * GLOBAL — full-screen overlay (default when meta omitted).
 * SILENT — no loader (the component shows its own, e.g. a button spinner).
 * For a LOCAL loader pass a CSS selector string of the target container instead,
 * e.g. `{ meta: { loader: '[data-component="category-list"]' } }`.
 */
export const LOADER = {
  GLOBAL: 'global',
  SILENT: 'silent',
};
