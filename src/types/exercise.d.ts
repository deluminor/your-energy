/**
 * Exercise entity as persisted in favorites and returned by the API.
 * The catalog payload carries many fields; only `_id` is relied upon by the
 * domain logic, the rest are passed through opaquely.
 */
export interface Exercise {
  _id: string;
  [key: string]: unknown;
}
