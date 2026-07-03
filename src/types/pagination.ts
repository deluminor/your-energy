export interface PaginatedResponse<T> {
  results: T[];
  totalPages: number;
  page: number;
}

export interface PaginationState {
  page: number;
  totalPages: number;
}
