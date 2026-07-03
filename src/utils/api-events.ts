import type { ApiEventType } from '@/constants/api-events.ts';

const listeners = new Map<ApiEventType, Set<(...args: unknown[]) => void>>();

export function onApiEvent(
  type: ApiEventType,
  handler: (...args: unknown[]) => void,
): () => void {
  let set = listeners.get(type);

  if (!set) {
    set = new Set();
    listeners.set(type, set);
  }

  set.add(handler);

  return () => listeners.get(type)?.delete(handler);
}

export function emitApiEvent(type: ApiEventType, ...args: unknown[]): void {
  listeners.get(type)?.forEach((handler) => handler(...args));
}
