/**
 * Application Configuration
 *
 * Configuraciones globales de la aplicación
 */

export const CONFIG = {
  // App info
  APP_NAME: 'Auguria',
  APP_DESCRIPTION: 'Marketplace de tarotistas profesionales',

  // API
  API_TIMEOUT: 30000,
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,

  // Reading
  MIN_QUESTION_LENGTH: 10,
  MAX_QUESTION_LENGTH: 500,

  // Plan limits
  /** Default daily reading limit for FREE users */
  DEFAULT_FREE_DAILY_LIMIT: 3,

  // Validation
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
} as const;
