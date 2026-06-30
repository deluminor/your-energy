import 'axios';

/**
 * Per-request loader hint consumed by the Axios interceptors in
 * `src/api/instance.js` and forwarded to the loader via the API event bus.
 */
declare module 'axios' {
  interface AxiosRequestConfig {
    meta?: {
      loader?: string;
    };
  }
}
