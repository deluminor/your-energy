export const API_BASE_URL = 'https://your-energy.b.goit.study/api';

export const ENDPOINTS = {
  filters: '/filters',
  exercises: '/exercises',
  /** @param {string} id */
  exerciseById: (id) => `/exercises/${id}`,
  /** @param {string} id */
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
  UI_STATE: 'your-energy:ui-state',
};

export const FILTER_PARAM = {
  [FILTER.MUSCLES]: 'muscles',
  [FILTER.BODY_PARTS]: 'bodypart',
  [FILTER.EQUIPMENT]: 'equipment',
};

export const EMAIL_PATTERN = /^\w+(\.\w+)?@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;

export const CACHE_TTL_MS = 5 * 60 * 1000;

export const LOADER = {
  GLOBAL: 'global',
  SILENT: 'silent',
};

export const API_EVENT = {
  LOADER_SHOW: 'loader:show',
  LOADER_HIDE: 'loader:hide',
  NOTIFY_ERROR: 'notify:error',
};
