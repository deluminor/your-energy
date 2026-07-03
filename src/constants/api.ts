export const API_BASE_URL = 'https://your-energy.b.goit.study/api';

export const ENDPOINTS = {
  filters: '/filters',
  exercises: '/exercises',
  exerciseById: (id: string) => `/exercises/${id}`,
  rating: (id: string) => `/exercises/${id}/rating`,
  quote: '/quote',
  subscription: '/subscription',
} as const;
