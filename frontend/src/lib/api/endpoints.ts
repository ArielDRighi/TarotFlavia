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

  // Readings
  READINGS: {
    BASE: '/readings',
    BY_ID: (id: string) => `/readings/${id}`,
    TRASH: '/readings/trash',
    RESTORE: (id: string) => `/readings/${id}/restore`,
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
    BY_ID: (id: string) => `/tarotistas/${id}`,
    AVAILABLE: '/tarotistas/available',
    REVIEWS: (id: string) => `/tarotistas/${id}/reviews`,
  },

  // Sessions (Live readings)
  SESSIONS: {
    BASE: '/sessions',
    BY_ID: (id: string) => `/sessions/${id}`,
    BOOK: '/sessions/book',
  },
} as const;
