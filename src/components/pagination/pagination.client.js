/**
 * Client entry for the pagination island. Owns the page controls — render page
 * buttons from the active list's `totalPages`, and on click set the page in the
 * store (services/store) to drive a reload. Hidden when there is a single page.
 * See `quote/quote.client.js` for the reference pattern.
 *
 * Teardown contract: capture the `subscribe()` unsubscribe fn and return a
 * teardown that calls it (see `services/store.service.js`) so store listeners
 * do not accumulate across re-init.
 *
 * @param {HTMLElement | null} root
 * @returns {() => void} teardown
 */
export function initPagination(root) {
  if (!root) return () => {};

  return () => {};
}
