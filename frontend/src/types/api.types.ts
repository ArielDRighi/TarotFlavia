/**
 * API Response Types
 *
 * Tipos para respuestas de la API del backend
 */

/**
 * Base API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * API Error response
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: Record<string, string[]>;
}

/**
 * Query parameters for pagination
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
