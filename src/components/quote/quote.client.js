import { getQuote } from '../../api/quote.api.js';
import { readJSON, writeJSON } from '../../services/storage.service.js';
import { STORAGE_KEYS } from '../../utils/constants.js';
import { escapeHtml } from '../../utils/escape-html.js';

const QUOTE_SELECTOR = '[data-component="quote"]';

/**
 * Today's date key (YYYY-MM-DD), used to cache the quote of the day.
 * @returns {string}
 */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns the cached quote only if it was stored today.
 * @returns {{ author: string, quote: string } | null}
 */
function readCachedQuote() {
  const cached = readJSON(STORAGE_KEYS.QUOTE, null);

  if (cached && cached.date === todayKey()) {
    return { author: cached.author, quote: cached.quote };
  }

  return null;
}

/**
 * @param {HTMLElement} root
 * @param {{ author: string, quote: string }} data
 */
function render(root, { author, quote }) {
  root.innerHTML = `
    <blockquote class="quote__text">${escapeHtml(quote)}</blockquote>
    <figcaption class="quote__author">${escapeHtml(author)}</figcaption>`;
}

/**
 * Reference island showing where component logic lives: a co-located client
 * module imported by the component's `<script>`, reusing api/services/utils.
 * Fetches the quote of the day (cached per day via the storage service) and
 * renders it into the static `[data-component="quote"]` host.
 *
 * @param {HTMLElement | null} root
 * @returns {Promise<void>}
 */
export async function initQuote(root) {
  if (!root) return;

  const cached = readCachedQuote();

  if (cached) {
    render(root, cached);
    return;
  }

  try {
    const { author, quote } = await getQuote({ loader: QUOTE_SELECTOR });

    render(root, { author, quote });
    writeJSON(STORAGE_KEYS.QUOTE, { author, quote, date: todayKey() });
  } catch (error) {
    // The Axios interceptor already surfaced a toast; keep the placeholder
    // visible and log for diagnostics instead of throwing inside the island.
    console.error('quote: failed to load quote of the day', error);
  }
}
