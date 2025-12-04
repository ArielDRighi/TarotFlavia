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
  resolve: (value: AxiosResponse) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
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

// Extended config type to track retry attempts
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // Handle 401 Unauthorized - Attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response = await apiClient.post('/auth/refresh');
        const { access_token } = response.data as { access_token: string };

        // Save new token
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access_token);
        }

        // Update the failed request's authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        // Process queued requests
        processQueue(null);

        // Retry the original request
        return apiClient.request(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        processQueue(refreshError as Error);

        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      return Promise.reject(new ForbiddenError());
    }

    // Handle 429 Too Many Requests (Rate Limit)
    if (error.response?.status === 429) {
      return Promise.reject(new RateLimitError());
    }

    // Re-throw other errors
    return Promise.reject(error);
  }
);

export default apiClient;
