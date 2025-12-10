/**
 * API Endpoints
 *
 * Centralización de todas las rutas de API del backend
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },

  // Categories
  CATEGORIES: {
    BASE: '/categories',
  },

  // Predefined Questions
  PREDEFINED_QUESTIONS: {
    BASE: '/predefined-questions',
  },

  // Spreads (Tiradas)
  SPREADS: {
    BASE: '/spreads',
    BY_ID: (id: number) => `/spreads/${id}`,
  },

  // Readings
  READINGS: {
    BASE: '/readings',
    BY_ID: (id: number) => `/readings/${id}`,
    TRASH: '/readings/trash',
    RESTORE: (id: number) => `/readings/${id}/restore`,
    REGENERATE: (id: number) => `/readings/${id}/regenerate`,
    SHARE: (id: number) => `/readings/${id}/share`,
  },

  // Daily Reading (Carta del Día)
  DAILY_READING: {
    BASE: '/daily-reading',
    TODAY: '/daily-reading/today',
    HISTORY: '/daily-reading/history',
    REGENERATE: '/daily-reading/regenerate',
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
  },

  // Tarotistas (Marketplace)
  TAROTISTAS: {
    BASE: '/tarotistas',
    BY_ID: (id: number) => `/tarotistas/${id}`,
    AVAILABLE: '/tarotistas/available',
    REVIEWS: (id: number) => `/tarotistas/${id}/reviews`,
  },

  // Sessions (Live readings)
  SESSIONS: {
    BASE: '/sessions',
    BY_ID: (id: string) => `/sessions/${id}`,
    BOOK: '/sessions/book',
  },
} as const;
