import { describe, expect, it } from 'vitest';
import { isValidEmail, normalizeQuery } from '../../src/utils/validators.js';

describe('isValidEmail', () => {
  it('accepts a valid address', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('john.doe@mail.io')).toBe(true);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user@site')).toBe(false);
    expect(isValidEmail('userexample.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('rejects non-string input', () => {
    // @ts-expect-error runtime guard for untrusted input
    expect(isValidEmail(null)).toBe(false);
    // @ts-expect-error runtime guard for untrusted input
    expect(isValidEmail(42)).toBe(false);
  });
});

describe('normalizeQuery', () => {
  it('trims and collapses internal whitespace', () => {
    expect(normalizeQuery('  push   up  ')).toBe('push up');
  });

  it('returns empty string for nullish input', () => {
    // @ts-expect-error runtime guard for untrusted input
    expect(normalizeQuery(null)).toBe('');
    // @ts-expect-error runtime guard for untrusted input
    expect(normalizeQuery(undefined)).toBe('');
  });

  it('leaves a clean single-word query unchanged', () => {
    expect(normalizeQuery('squat')).toBe('squat');
  });
});
