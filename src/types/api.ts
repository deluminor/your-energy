export interface AxiosLikeError {
  response?: {
    status?: number;
    data?: unknown;
  };
  code?: string;
}
