import { describe, expect, it } from 'vitest';
import {
  extractApiMessage,
  resolveAxiosErrorMessage,
} from '../../src/utils/api-error-message.js';

describe('extractApiMessage', () => {
  it('returns message when present', () => {
    expect(extractApiMessage({ message: 'Subscription already exists' })).toBe(
      'Subscription already exists',
    );
  });

  it('falls back to error and detail keys', () => {
    expect(extractApiMessage({ error: 'Invalid email' })).toBe('Invalid email');
    expect(extractApiMessage({ detail: 'Not allowed' })).toBe('Not allowed');
  });

  it('returns null for non-object or empty values', () => {
    expect(extractApiMessage(null)).toBeNull();
    expect(extractApiMessage('error')).toBeNull();
    expect(extractApiMessage({ message: '   ' })).toBeNull();
  });
});

describe('resolveAxiosErrorMessage', () => {
  it('prefers API message over generic fallback', () => {
    const message = resolveAxiosErrorMessage({
      response: {
        status: 409,
        data: { message: 'Subscription already exists' },
      },
    });

    expect(message).toBe('Subscription already exists');
  });

  it('returns status-based fallback when API message is missing', () => {
    expect(
      resolveAxiosErrorMessage({ response: { status: 404, data: {} } }),
    ).toBe('Not found. Please try again.');

    expect(
      resolveAxiosErrorMessage({ response: { status: 500, data: {} } }),
    ).toBe('Server error. Please try later.');

    expect(
      resolveAxiosErrorMessage({ response: { status: 400, data: {} } }),
    ).toBe('Request failed. Please check your input.');
  });

  it('handles network and timeout errors', () => {
    expect(resolveAxiosErrorMessage({ code: 'ECONNABORTED' })).toBe(
      'Request timed out. Please retry.',
    );

    expect(resolveAxiosErrorMessage({})).toBe(
      'Network error. Check your connection.',
    );
  });
});
