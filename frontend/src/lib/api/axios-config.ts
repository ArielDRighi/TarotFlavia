/**
 * API Configuration
 *
 * Configuración base de Axios con interceptors para JWT y manejo de errores
 */
import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

// ============================================================================
// Custom Error Classes
// ============================================================================

/**
 * Error thrown when user lacks permissions (403 Forbidden)
 */
export class ForbiddenError extends Error {
  constructor(message = 'No tienes permisos para realizar esta acción') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Error thrown when rate limit is exceeded (429 Too Many Requests)
 */
export class RateLimitError extends Error {
  constructor(message = 'Demasiadas solicitudes. Por favor, intenta más tarde') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// ============================================================================
// Token Refresh State
// ============================================================================

// Flag to prevent multiple refresh attempts simultaneously
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: Error) => void;
  config: ExtendedAxiosRequestConfig;
}> = [];

// Extended config type to track retry attempts
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Process queued requests after token refresh
 * On success: retries each request with the new token
 * On error: rejects all queued requests
 */
const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      // Update the queued request's authorization header and retry
      if (prom.config.headers) {
        prom.config.headers.Authorization = `Bearer ${token}`;
      }
      prom.resolve(apiClient.request(prom.config));
    }
  });
  failedQueue = [];
};

// ============================================================================
// Axios Instance Configuration
// ============================================================================

/**
 * Configured Axios instance for API communication
 *
 * Features:
 * - Base URL from environment variable
 * - 30 second timeout
 * - Automatic JWT token injection
 * - Token refresh on 401
 * - Custom error handling for 403 and 429
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Request Interceptor
// ============================================================================

/**
 * Request interceptor to add JWT token to outgoing requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// Response Interceptor
// ============================================================================

/**
 * Response interceptor to handle errors globally
 *
 * - 401: Attempt token refresh, retry original request on success
 * - 403: Throw ForbiddenError
 * - 429: Throw RateLimitError
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined;

    // Handle 401 Unauthorized - Attempt token refresh
    // BUT: Skip refresh for auth endpoints (login, register, refresh)
    // Check originalRequest exists to handle network errors without config
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request to retry after refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token from localStorage
        const refreshToken =
          typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh the token with refreshToken in body
        const response = await apiClient.post('/auth/refresh', {
          refreshToken: refreshToken,
        });

        const { access_token, refresh_token } = response.data as {
          access_token: string;
          refresh_token: string;
        };

        // Save both tokens (token rotation support)
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
        }

        // Update the failed request's authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        // Process queued requests with the new token
        processQueue(null, access_token);

        // Reset flag before retrying
        isRefreshing = false;

        // Retry the original request
        return apiClient.request(originalRequest);
      } catch (refreshError) {
        // Refresh failed - process queue with error
        processQueue(refreshError as Error, null);

        // Reset flag before redirect to avoid hanging requests
        isRefreshing = false;

        // Clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle 429 Too Many Requests (Rate Limit)
    // 403 Forbidden is NOT transformed here - preserved as AxiosError for component handling
    if (error.response?.status === 429) {
      return Promise.reject(new RateLimitError());
    }

    // Re-throw other errors
    return Promise.reject(error);
  }
);

export default apiClient;
