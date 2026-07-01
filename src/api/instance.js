import axios from 'axios';
import { emitApiEvent } from '../utils/api-events.js';
import { API_BASE_URL, API_EVENT, LOADER } from '../utils/constants.js';

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

/**
 * @param {import('axios').InternalAxiosRequestConfig} [config]
 * @returns {string}
 */
function loaderMode(config) {
  return config?.meta?.loader ?? LOADER.GLOBAL;
}

http.interceptors.request.use((config) => {
  emitApiEvent(API_EVENT.LOADER_SHOW, loaderMode(config));
  return config;
});

http.interceptors.response.use(
  (response) => {
    emitApiEvent(API_EVENT.LOADER_HIDE, loaderMode(response.config));
    return response;
  },
  (error) => {
    emitApiEvent(API_EVENT.LOADER_HIDE, loaderMode(error.config));
    emitApiEvent(API_EVENT.NOTIFY_ERROR, toUserMessage(error));
    return Promise.reject(error);
  },
);

/**
 * @param {import('axios').AxiosError} error
 * @returns {string}
 */
function toUserMessage(error) {
  if (error.response) {
    const { status } = error.response;

    if (status === 404) return 'Not found. Please try again.';
    if (status >= 500) return 'Server error. Please try later.';

    return 'Request failed. Please check your input.';
  }

  if (error.code === 'ECONNABORTED') return 'Request timed out. Please retry.';

  return 'Network error. Check your connection.';
}
