/**
 * Client entry for the pagination island. Owns the page controls — render page
 * buttons from the active list's `totalPages`, and on click set the page in the
 * store (services/store) to drive a reload. Hidden when there is a single page.
 * See `quote/quote.client.js` for the reference pattern.
 *
 * @param {HTMLElement | null} root
 * @returns {void}
 */
export function initPagination(root) {
  if (!root) return;
}
