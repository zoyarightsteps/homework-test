import axios from 'axios';
import { pushLogEntry } from './apiLog';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.rightsteps.app/v1';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let getAccessToken = () => null;
let getRefreshToken = () => null;
let onTokensRefreshed = () => {};
let onAuthExpired = () => {};

export function registerAuthHooks(hooks) {
  getAccessToken = hooks.getAccessToken;
  getRefreshToken = hooks.getRefreshToken;
  onTokensRefreshed = hooks.onTokensRefreshed;
  onAuthExpired = hooks.onAuthExpired;
}

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.metadata = { startedAt: performance.now() };
  return config;
});

function logFromResponse(response, ok) {
  const config = response.config || {};
  const startedAt = config.metadata?.startedAt;
  pushLogEntry({
    method: (config.method || '').toUpperCase(),
    url: config.url,
    status: response.status,
    ok,
    durationMs: startedAt ? Math.round(performance.now() - startedAt) : null,
    timestamp: Date.now(),
  });
}

axiosClient.interceptors.response.use(
  (response) => {
    logFromResponse(response, true);
    return response;
  },
  async (error) => {
    if (error.response) logFromResponse(error.response, false);
    const originalRequest = error.config;
    const status = error.response && error.response.status;
    const isAuthRoute = originalRequest.url && originalRequest.url.includes('/auth/');

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        onAuthExpired();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${BASE_URL}/auth/refresh-token`, { refreshToken })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const refreshResponse = await refreshPromise;
        const tokens = refreshResponse.data?.data?.tokens;
        if (!tokens) throw new Error('No tokens in refresh response');

        onTokensRefreshed(tokens);
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        onAuthExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export { BASE_URL };
export default axiosClient;
