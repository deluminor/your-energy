import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCache, withCache } from '../../src/services/cache.service.js';

describe('cache.service', () => {
  beforeEach(() => {
    clearCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('caches the resolved value and skips the producer on a hit', async () => {
    const producer = vi.fn().mockResolvedValue('value');

    const first = await withCache('k', producer);
    const second = await withCache('k', producer);

    expect(first).toBe('value');
    expect(second).toBe('value');
    expect(producer).toHaveBeenCalledOnce();
  });

  it('deduplicates concurrent in-flight requests', async () => {
    const producer = vi.fn(
      () => new Promise((resolve) => setTimeout(() => resolve('v'), 100)),
    );

    const p1 = withCache('k', producer);
    const p2 = withCache('k', producer);

    await vi.advanceTimersByTimeAsync(100);

    expect(await p1).toBe('v');
    expect(await p2).toBe('v');
    expect(producer).toHaveBeenCalledOnce();
  });

  it('re-runs the producer after the TTL expires', async () => {
    const producer = vi
      .fn()
      .mockResolvedValueOnce('a')
      .mockResolvedValueOnce('b');

    const first = await withCache('k', producer, 1000);
    expect(first).toBe('a');

    vi.advanceTimersByTime(1001);

    const second = await withCache('k', producer, 1000);
    expect(second).toBe('b');
    expect(producer).toHaveBeenCalledTimes(2);
  });

  it('evicts a rejected entry so the next call retries', async () => {
    const producer = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('recovered');

    await expect(withCache('k', producer)).rejects.toThrow('boom');
    await expect(withCache('k', producer)).resolves.toBe('recovered');
    expect(producer).toHaveBeenCalledTimes(2);
  });

  it('clearCache drops all entries', async () => {
    const producer = vi.fn().mockResolvedValue('value');

    await withCache('k', producer);
    clearCache();
    await withCache('k', producer);

    expect(producer).toHaveBeenCalledTimes(2);
  });
});
