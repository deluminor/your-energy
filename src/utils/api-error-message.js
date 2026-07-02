/**
 * @param {unknown} data
 * @returns {string | null}
 */
export function extractApiMessage(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;

  const body = /** @type {Record<string, unknown>} */ (data);
  const keys = ['message', 'error', 'detail'];

  for (const key of keys) {
    const value = body[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

/**
 * @param {import('axios').AxiosError} error
 * @returns {string}
 */
export function resolveAxiosErrorMessage(error) {
  if (error.response) {
    const apiMessage = extractApiMessage(error.response.data);

    if (apiMessage) return apiMessage;

    const { status } = error.response;

    if (status === 404) return 'Not found. Please try again.';
    if (status >= 500) return 'Server error. Please try later.';

    return 'Request failed. Please check your input.';
  }

  if (error.code === 'ECONNABORTED') return 'Request timed out. Please retry.';

  return 'Network error. Check your connection.';
}
