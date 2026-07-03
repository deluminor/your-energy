import type { AxiosLikeError } from '@/types/api.ts';

export function extractApiMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;

  const body = data as Record<string, unknown>;
  const keys = ['message', 'error', 'detail'];

  for (const key of keys) {
    const value = body[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export function resolveAxiosErrorMessage(error: AxiosLikeError): string {
  if (error.response) {
    const apiMessage = extractApiMessage(error.response.data);

    if (apiMessage) return apiMessage;

    const { status } = error.response;

    if (status === 404) return 'Not found. Please try again.';

    if (typeof status === 'number' && status >= 500) {
      return 'Server error. Please try later.';
    }

    return 'Request failed. Please check your input.';
  }

  if (error.code === 'ECONNABORTED') return 'Request timed out. Please retry.';

  return 'Network error. Check your connection.';
}
