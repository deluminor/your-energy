import { ENDPOINTS, PAGE_LIMIT } from '../utils/constants.js';
import { http } from './instance.js';
import { normalizePaginated } from './normalizers.js';

/**
 * @param {object} params
 * @param {string} params.filter
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @param {{ loader?: string }} [options]
 * @returns {Promise<{ results: object[], totalPages: number, page: number }>}
 */
export async function getFilters(
  { filter, page = 1, limit = PAGE_LIMIT.CATEGORIES },
  { loader } = {},
) {
  const { data } = await http.get(ENDPOINTS.filters, {
    params: { filter, page, limit },
    meta: { loader },
  });

  return normalizePaginated(data);
}
