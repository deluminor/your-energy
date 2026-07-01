/**
 * @param {unknown} data
 * @param {string} label
 * @returns {Record<string, unknown>}
 */
function assertObject(data, label) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`API: invalid ${label} response`);
  }

  return /** @type {Record<string, unknown>} */ (data);
}

/**
 * @param {unknown} data
 * @returns {{ results: object[], totalPages: number, page: number }}
 */
export function normalizePaginated(data) {
  const body = assertObject(data, 'paginated');
  const { results, totalPages, page } = body;

  if (!Array.isArray(results)) {
    throw new Error('API: paginated results must be an array');
  }

  const normalizedPage = Number(page);
  const normalizedTotalPages = Number(totalPages);

  if (
    !Number.isFinite(normalizedPage) ||
    !Number.isFinite(normalizedTotalPages)
  ) {
    throw new Error('API: paginated page metadata must be numeric');
  }

  return {
    results,
    totalPages: normalizedTotalPages,
    page: normalizedPage,
  };
}

/**
 * @param {unknown} data
 * @returns {{ author: string, quote: string }}
 */
export function normalizeQuote(data) {
  const body = assertObject(data, 'quote');
  const { author, quote } = body;

  if (typeof author !== 'string' || typeof quote !== 'string') {
    throw new Error('API: quote must include author and quote strings');
  }

  return { author, quote };
}

/**
 * @param {unknown} data
 * @returns {object}
 */
export function normalizeEntity(data) {
  return assertObject(data, 'entity');
}
