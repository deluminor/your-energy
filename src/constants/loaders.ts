export const LOADER = {
  GLOBAL: 'global',
  SILENT: 'silent',
  EXERCISE_MODAL: '[data-component="exercise-modal"]',
} as const;

export type LoaderType = (typeof LOADER)[keyof typeof LOADER];
