import type { Category } from './category.ts';

export interface AppState {
  activeFilter: string;
  category: Category | null;
  page: number;
  totalPages: number;
  keyword: string;
}

export interface PersistedUiState {
  activeFilter: string;
  page: number;
  category: Category | null;
  keyword: string;
}
