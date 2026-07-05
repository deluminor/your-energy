import { getQuote } from '@/api/quote.api.ts';
import { LOADER } from '@/constants/loaders.ts';
import { STORAGE_KEYS } from '@/constants/storage-keys.ts';
import { readJSON, writeJSON } from '@/services/storage.service.ts';
import type { CachedQuote } from '@/types/quote.ts';

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readSsrQuote(
  root: HTMLElement,
): { quote: string; author: string } | null {
  const quote = root.querySelector('[data-quote-text]')?.textContent?.trim();
  const author = root.querySelector('[data-quote-author]')?.textContent?.trim();

  if (!quote || !author) return null;

  return { quote, author };
}

function renderCachedQuote(root: HTMLElement, cached: CachedQuote): void {
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

function renderQuote(root: HTMLElement, quote: string, author: string): void {
  const textEl = root.querySelector('[data-quote-text]');
  const authorEl = root.querySelector('[data-quote-author]');

  if (!textEl || !authorEl) return;

  textEl.textContent = quote;
  authorEl.textContent = author;
}

function cacheQuote(today: string, quote: string, author: string): void {
  writeJSON(STORAGE_KEYS.QUOTE, { date: today, quote, author });
}

export async function initQuote(root: HTMLElement | null): Promise<void> {
  if (!root) return;

  const today = getTodayKey();
  const cached = readJSON<CachedQuote | null>(STORAGE_KEYS.QUOTE, null);

  if (cached?.date === today) {
    renderCachedQuote(root, cached);
    return;
  }

  const data = await getQuote({ loader: LOADER.SILENT }).catch(() => null);

  if (data) {
    renderQuote(root, data.quote, data.author);
    cacheQuote(today, data.quote, data.author);
    return;
  }

  const ssrQuote = readSsrQuote(root);

  if (ssrQuote) {
    cacheQuote(today, ssrQuote.quote, ssrQuote.author);
  }
}
