import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/api/quote.api.ts', () => ({
  getQuote: vi.fn(),
}));

vi.mock('@/services/storage.service.ts', () => ({
  readJSON: vi.fn(),
  writeJSON: vi.fn(),
}));

import { getQuote } from '@/api/quote.api.ts';
import { initQuote } from '@/components/quote/quote.client.ts';
import { STORAGE_KEYS } from '@/constants/storage-keys.ts';
import { readJSON, writeJSON } from '@/services/storage.service.ts';

describe('initQuote', () => {
  let root: HTMLElement;

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

  it('fetches and caches quote when cache is missing', async () => {
    const today = new Date().toISOString().slice(0, 10);

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

  it('fetches fresh quote when cache date is stale', async () => {
    const today = new Date().toISOString().slice(0, 10);

    vi.mocked(readJSON).mockReturnValue({
      date: '2000-01-01',
      quote: 'Old quote',
      author: 'Old author',
    });
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

  it('falls back to SSR quote when cache is stale and API fails', async () => {
    const today = new Date().toISOString().slice(0, 10);

    vi.mocked(readJSON).mockReturnValue({
      date: '2000-01-01',
      quote: 'Old quote',
      author: 'Old author',
    });
    vi.mocked(getQuote).mockRejectedValue(new Error('Network error'));

    await initQuote(root);

    expect(getQuote).toHaveBeenCalledOnce();
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
