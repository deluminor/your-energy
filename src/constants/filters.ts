export const FILTER = {
  MUSCLES: 'Muscles',
  BODY_PARTS: 'Body parts',
  EQUIPMENT: 'Equipment',
} as const;

export type FilterType = (typeof FILTER)[keyof typeof FILTER];

export const DEFAULT_FILTER: FilterType = FILTER.MUSCLES;

export const FILTER_PARAM: Record<FilterType, string> = {
  [FILTER.MUSCLES]: 'muscles',
  [FILTER.BODY_PARTS]: 'bodypart',
  [FILTER.EQUIPMENT]: 'equipment',
};
