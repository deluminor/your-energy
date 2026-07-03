export const API_EVENT = {
  LOADER_SHOW: 'loader:show',
  LOADER_HIDE: 'loader:hide',
  NOTIFY_ERROR: 'notify:error',
} as const;

export type ApiEventType = (typeof API_EVENT)[keyof typeof API_EVENT];
