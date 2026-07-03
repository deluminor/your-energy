import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/api/quote.api.js', () => ({
  getQuote: vi.fn(),
}));

vi.mock('../../src/services/storage.service.js', () => ({
  readJSON: vi.fn(),
  writeJSON: vi.fn(),
}));

import { getQuote } from '../../src/api/quote.api.js';
import { initQuote } from '../../src/components/quote/quote.client.js';
import { readJSON, writeJSON } from '../../src/services/storage.service.js';
import { STORAGE_KEYS } from '../../src/utils/constants.js';

describe('initQuote', () => {
  /** @type {HTMLElement} */
  let root;

  beforeEach(() => {
    root = document.createElement('div');
    root.innerHTML = `
      <p data-quote-text>SSR quote</p>
      <p data-quote-author>SSR author</p>
    `;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses cached quote when date matches today', async () => {
    const today = new Date().toISOString().slice(0, 10);

    vi.mocked(readJSON).mockReturnValue({
      date: today,
      quote: 'Cached quote',
      author: 'Cached author',
    });

    await initQuote(root);

    expect(getQuote).not.toHaveBeenCalled();
    expect(root.querySelector('[data-quote-text]')?.textContent).toBe(
      'Cached quote',
    );
    expect(root.querySelector('[data-quote-author]')?.textContent).toBe(
      'Cached author',
    );
  });

  it('fetches and caches quote when cache is missing and SSR is empty', async () => {
    const today = new Date().toISOString().slice(0, 10);

    root.innerHTML = `
      <p data-quote-text></p>
      <p data-quote-author></p>
    `;

    vi.mocked(readJSON).mockReturnValue(null);
    vi.mocked(getQuote).mockResolvedValue({
      quote: 'Fresh quote',
      author: 'Fresh author',
    });

    await initQuote(root);

    expect(getQuote).toHaveBeenCalledOnce();
    expect(writeJSON).toHaveBeenCalledWith(STORAGE_KEYS.QUOTE, {
      date: today,
      quote: 'Fresh quote',
      author: 'Fresh author',
    });
    expect(root.querySelector('[data-quote-text]')?.textContent).toBe(
      'Fresh quote',
    );
  });

  it('seeds cache from SSR quote instead of fetching when cache is stale', async () => {
    const today = new Date().toISOString().slice(0, 10);

    vi.mocked(readJSON).mockReturnValue({
      date: '2000-01-01',
      quote: 'Old quote',
      author: 'Old author',
    });

    await initQuote(root);

    expect(getQuote).not.toHaveBeenCalled();
    expect(writeJSON).toHaveBeenCalledWith(STORAGE_KEYS.QUOTE, {
      date: today,
      quote: 'SSR quote',
      author: 'SSR author',
    });
    expect(root.querySelector('[data-quote-text]')?.textContent).toBe(
      'SSR quote',
    );
  });

  it('does not rewrite DOM when cached quote already matches SSR', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const textEl = root.querySelector('[data-quote-text]');
    const authorEl = root.querySelector('[data-quote-author]');

    vi.mocked(readJSON).mockReturnValue({
      date: today,
      quote: 'SSR quote',
      author: 'SSR author',
    });

    await initQuote(root);

    expect(getQuote).not.toHaveBeenCalled();
    expect(textEl?.textContent).toBe('SSR quote');
    expect(authorEl?.textContent).toBe('SSR author');
  });
});
