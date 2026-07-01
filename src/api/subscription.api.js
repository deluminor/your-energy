import { ENDPOINTS } from '../utils/constants.js';
import { http } from './instance.js';
import { normalizeEntity } from './normalizers.js';

/**
 * @param {string} email
 * @param {{ loader?: string }} [options]
 * @returns {Promise<object>}
 */
export async function subscribe(email, { loader } = {}) {
  const { data } = await http.post(
    ENDPOINTS.subscription,
    { email },
    { meta: { loader } },
  );

  return normalizeEntity(data);
}
