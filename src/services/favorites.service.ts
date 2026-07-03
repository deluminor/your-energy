import { STORAGE_KEYS } from '@/constants/storage-keys.ts';
import type { Exercise } from '@/types/exercise.ts';
import { readJSON, writeJSON } from './storage.service.ts';

export function getFavorites(): Exercise[] {
  return readJSON<Exercise[]>(STORAGE_KEYS.FAVORITES, []);
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((item) => item._id === id);
}

export function addFavorite(exercise: Exercise): void {
  const list = getFavorites();

  if (list.some((item) => item._id === exercise._id)) return;

  writeJSON(STORAGE_KEYS.FAVORITES, [...list, exercise]);
}

export function removeFavorite(id: string): void {
  writeJSON(
    STORAGE_KEYS.FAVORITES,
    getFavorites().filter((item) => item._id !== id),
  );
}

export function toggleFavorite(exercise: Exercise): boolean {
  if (isFavorite(exercise._id)) {
    removeFavorite(exercise._id);
    return false;
  }

  addFavorite(exercise);
  return true;
}
