import { ENDPOINTS } from '../utils/constants.js';
import { http } from './instance.js';
import { normalizeQuote } from './normalizers.js';

/**
 * @param {{ loader?: string }} [options]
 * @returns {Promise<{ author: string, quote: string }>}
 */
export async function getQuote({ loader } = {}) {
  const { data } = await http.get(ENDPOINTS.quote, { meta: { loader } });
  return normalizeQuote(data);
}
