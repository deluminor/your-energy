import { STORAGE_KEYS } from '@/constants/storage-keys.ts';
import { readUiStateFromUrl, writeUiStateToUrl } from './url-state.service.ts';

function writeLocalJSON(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    if (key === STORAGE_KEYS.UI_STATE) {
      const urlState = readUiStateFromUrl();

      if (urlState) {
        writeLocalJSON(key, urlState);
        return urlState as T;
      }
    }

    const raw = localStorage.getItem(key);

    if (raw === null) return fallback;

    const value = JSON.parse(raw) as T;

    if (key === STORAGE_KEYS.UI_STATE) {
      writeUiStateToUrl(value);
    }

    return value;
  } catch (error) {
    console.error(`storage: failed to read "${key}"`, error);
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    writeLocalJSON(key, value);

    if (key === STORAGE_KEYS.UI_STATE) {
      writeUiStateToUrl(value);
    }
  } catch (error) {
    console.error(`storage: failed to write "${key}"`, error);
  }
}
