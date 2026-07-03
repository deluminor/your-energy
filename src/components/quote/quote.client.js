import { getQuote } from '../../api/quote.api.js';
import { readJSON, writeJSON } from '../../services/storage.service.js';
import { LOADER, STORAGE_KEYS } from '../../utils/constants.js';

/**
 * @typedef {{ date: string, quote: string, author: string }} CachedQuote
 */

/**
 * @returns {string}
 */
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * @param {HTMLElement} root
 * @returns {{ quote: string, author: string } | null}
 */
function readSsrQuote(root) {
  const quote = root.querySelector('[data-quote-text]')?.textContent?.trim();
  const author = root.querySelector('[data-quote-author]')?.textContent?.trim();

  if (!quote || !author) return null;

  return { quote, author };
}

/**
 * @param {HTMLElement} root
 * @param {CachedQuote} cached
 */
function renderCachedQuote(root, cached) {
  const textEl = root.querySelector('[data-quote-text]');
  const authorEl = root.querySelector('[data-quote-author]');

  if (!textEl || !authorEl) return;

  if (
    textEl.textContent === cached.quote &&
    authorEl.textContent === cached.author
  ) {
    return;
  }

  textEl.textContent = cached.quote;
  authorEl.textContent = cached.author;
}

/**
 * @param {HTMLElement} root
 * @param {string} quote
 * @param {string} author
 */
function renderQuote(root, quote, author) {
  const textEl = root.querySelector('[data-quote-text]');
  const authorEl = root.querySelector('[data-quote-author]');

  if (!textEl || !authorEl) return;

  textEl.textContent = quote;
  authorEl.textContent = author;
}

/**
 * @param {HTMLElement | null} root
 * @returns {Promise<void>}
 */
export async function initQuote(root) {
  if (!root) return;

  const today = getTodayKey();
  const ssrQuote = readSsrQuote(root);
  const cached = readJSON(
    STORAGE_KEYS.QUOTE,
    /** @type {CachedQuote | null} */ (null),
  );

  if (cached?.date === today) {
    renderCachedQuote(root, cached);
    return;
  }

  if (ssrQuote) {
    writeJSON(STORAGE_KEYS.QUOTE, {
      date: today,
      quote: ssrQuote.quote,
      author: ssrQuote.author,
    });
    return;
  }

  try {
    const { quote, author } = await getQuote({ loader: LOADER.SILENT });
    renderQuote(root, quote, author);
    writeJSON(STORAGE_KEYS.QUOTE, { date: today, quote, author });
  } catch (error) {
    console.error('quote: failed to load quote', error);
  }
}
