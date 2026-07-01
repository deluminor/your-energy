import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    meta?: {
      loader?: string;
    };
  }
}
