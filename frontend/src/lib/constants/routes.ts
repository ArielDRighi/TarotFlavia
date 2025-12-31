/**
 * Application Routes
 *
 * Centralización de rutas de la aplicación
 */

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/registro',
  CARTA_DEL_DIA: '/carta-del-dia',

  // Dashboard (authenticated)
  DASHBOARD: '/dashboard',
  LECTURAS: '/lecturas',
  LECTURAS_NEW: '/lecturas/nueva',
  LECTURAS_PAPELERA: '/lecturas/papelera',
  LECTURA_DETAIL: (id: string) => `/lecturas/${id}`,

  // Marketplace
  MARKETPLACE: '/marketplace',
  TAROTISTA_PROFILE: (id: string) => `/marketplace/tarotista/${id}`,

  // Profile
  PERFIL: '/perfil',
  PERFIL_SETTINGS: '/perfil/settings',

  // Admin
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_STATS: '/admin/stats',
} as const;
