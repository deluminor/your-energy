import axios from 'axios';
import { resolveAxiosErrorMessage } from '../utils/api-error-message.js';
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
    emitApiEvent(API_EVENT.NOTIFY_ERROR, resolveAxiosErrorMessage(error));
    return Promise.reject(error);
  },
);
