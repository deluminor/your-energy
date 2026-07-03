import { EMAIL_PATTERN } from '@/constants/patterns.ts';

export function isValidEmail(value: string): boolean {
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim());
}

export function normalizeQuery(value: string): string {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ');
}
