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
    MY_AVAILABLE: '/spreads/my-available',
  },

  // Readings
  READINGS: {
    BASE: '/readings',
    BY_ID: (id: number) => `/readings/${id}`,
    TRASH: '/readings/trash',
    RESTORE: (id: number) => `/readings/${id}/restore`,
    REGENERATE: (id: number) => `/readings/${id}/regenerate`,
    SHARE: (id: number) => `/readings/${id}/share`,
    SHARE_TEXT: (id: number) => `/readings/${id}/share-text`,
  },

  // Shared Readings (Public - No authentication required)
  SHARED: {
    BY_TOKEN: (token: string) => `/shared/${token}`,
  },

  // Daily Reading (Carta del Día)
  DAILY_READING: {
    BASE: '/daily-reading',
    TODAY: '/daily-reading/today',
    PUBLIC: '/public/daily-reading', // POST - Anonymous users with fingerprint
    HISTORY: '/daily-reading/history',
    REGENERATE: '/daily-reading/regenerate',
    SHARE_TEXT: '/daily-reading/share-text',
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: number) => `/users/${id}`,
    PROFILE: '/users/profile',
    PASSWORD: '/users/me/password',
    CAPABILITIES: '/users/capabilities', // NEW: User capabilities endpoint
  },

  // Tarotistas (Marketplace)
  TAROTISTAS: {
    BASE: '/tarotistas',
    BY_ID: (id: number) => `/tarotistas/${id}`,
    AVAILABLE: '/tarotistas/available',
    REVIEWS: (id: number) => `/tarotistas/${id}/reviews`,
    // Metrics
    METRICS_PLATFORM: '/tarotistas/metrics/platform',
    METRICS_TAROTISTA: '/tarotistas/metrics/tarotista',
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    MY_SUBSCRIPTION: '/subscriptions/my-subscription',
    SET_FAVORITE: '/subscriptions/set-favorite',
  },

  // Scheduling (Sessions)
  SCHEDULING: {
    AVAILABLE_SLOTS: '/scheduling/available-slots',
    BOOK: '/scheduling/book',
    MY_SESSIONS: '/scheduling/my-sessions',
    SESSION_DETAIL: (id: number) => `/scheduling/my-sessions/${id}`,
    CANCEL_SESSION: (id: number) => `/scheduling/my-sessions/${id}/cancel`,
  },

  // Horoscope (Horóscopo Diario)
  HOROSCOPE: {
    TODAY_ALL: '/horoscope/today',
    TODAY_SIGN: (sign: string) => `/horoscope/today/${sign}`,
    MY_SIGN: '/horoscope/my-sign',
    BY_DATE: (date: string) => `/horoscope/${date}`,
    BY_DATE_SIGN: (date: string, sign: string) => `/horoscope/${date}/${sign}`,
  },

  // Chinese Horoscope (Horóscopo Chino - Anual)
  CHINESE_HOROSCOPE: {
    CALCULATE: '/chinese-horoscope/calculate',
    MY_ANIMAL: '/chinese-horoscope/my-animal',
    BY_YEAR: (year: number) => `/chinese-horoscope/${year}`,
    BY_YEAR_ANIMAL_ELEMENT: (year: number, animal: string, element: string) =>
      `/chinese-horoscope/${year}/${animal}/${element}`,
  },

  // Numerology (Numerología)
  NUMEROLOGY: {
    CALCULATE: '/numerology/calculate',
    MY_PROFILE: '/numerology/my-profile',
    INTERPRET: '/numerology/my-profile/interpret',
    MEANINGS: '/numerology/meanings',
    MEANING_BY_NUMBER: (num: number) => `/numerology/meanings/${num}`,
    DAY_NUMBER: '/numerology/day-number',
  },

  // Rituals (Rituales)
  RITUALS: {
    LIST: '/rituals',
    FEATURED: '/rituals/featured',
    CATEGORIES: '/rituals/categories',
    LUNAR_INFO: '/rituals/lunar-info',
    DETAIL: (slug: string) => `/rituals/${slug}`,
    COMPLETE: (id: number) => `/rituals/${id}/complete`,
    HISTORY: '/rituals/history',
    STATS: '/rituals/history/stats',
    RECOMMENDATIONS: '/rituals/recommendations',
  },

  // Encyclopedia (Enciclopedia del Tarot)
  ENCYCLOPEDIA: {
    CARDS: '/encyclopedia/cards',
    MAJOR: '/encyclopedia/cards/major',
    BY_SUIT: (suit: string) => `/encyclopedia/cards/suit/${suit}`,
    SEARCH: '/encyclopedia/cards/search',
    CARD_DETAIL: (slug: string) => `/encyclopedia/cards/${slug}`,
    CARD_RELATED: (slug: string) => `/encyclopedia/cards/${slug}/related`,
    CARD_NAVIGATION: (slug: string) => `/encyclopedia/cards/${slug}/navigation`,
    // Articles
    ARTICLES: '/encyclopedia/articles',
    ARTICLE_SNIPPET: (slug: string) => `/encyclopedia/articles/snippet/${slug}`,
    ARTICLE_DETAIL: (slug: string) => `/encyclopedia/articles/${slug}`,
    ARTICLE_BY_CATEGORY: (category: string) => `/encyclopedia/articles/category/${category}`,
    SEARCH_GLOBAL: '/encyclopedia/search',
  },

  // Sacred Calendar (Calendario Sagrado)
  SACRED_CALENDAR: {
    UPCOMING: '/rituals/calendar/upcoming',
    TODAY: '/rituals/calendar/today',
    MONTH: (year: number, month: number) => `/rituals/calendar/month/${year}/${month}`,
  },

  // Notifications (Notificaciones In-App)
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: number) => `/notifications/${id}`,
    COUNT: '/notifications/count',
    MARK_READ: (id: number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },

  // Pendulum (Péndulo Digital)
  PENDULUM: {
    QUERY: '/pendulum/query',
    HISTORY: '/pendulum/history',
    STATS: '/pendulum/history/stats',
  },

  // Birth Chart (Carta Astral)
  BIRTH_CHART: {
    GENERATE: '/birth-chart/generate',
    GENERATE_ANONYMOUS: '/birth-chart/generate/anonymous',
    USAGE: '/birth-chart/usage',
    HISTORY: '/birth-chart/history',
    BY_ID: (id: number) => `/birth-chart/history/${id}`,
    RENAME: (id: number) => `/birth-chart/history/${id}/name`,
    PDF: '/birth-chart/pdf',
    PDF_BY_ID: (id: number) => `/birth-chart/history/${id}/pdf`,
    GEOCODE: '/birth-chart/geocode',
  },

  // Holistic Services (Servicios Holísticos de Flavia)
  HOLISTIC_SERVICES: {
    // Public
    LIST: '/holistic-services',
    DETAIL: (slug: string) => `/holistic-services/${slug}`,
    // Authenticated user (purchases)
    PURCHASE: '/holistic-services/purchases',
    MY_PURCHASES: '/holistic-services/purchases/my',
    PURCHASE_DETAIL: (id: number) => `/holistic-services/purchases/${id}`,
    CANCEL_PURCHASE: (id: number) => `/holistic-services/purchases/${id}/cancel`,
    // Admin
    ADMIN_LIST: '/admin/holistic-services',
    ADMIN_BY_ID: (id: number) => `/admin/holistic-services/${id}`,
    ADMIN_PENDING_PAYMENTS: '/admin/holistic-services/payments',
    ADMIN_APPROVE_PAYMENT: (id: number) => `/admin/holistic-services/payments/${id}/approve`,
  },

  // Admin Dashboard
  ADMIN: {
    DASHBOARD_STATS: '/admin/dashboard/stats',
    DASHBOARD_CHARTS: '/admin/dashboard/charts',
    USERS: '/admin/users',
    USER_BY_ID: (id: number) => `/admin/users/${id}`,
    BAN_USER: (id: number) => `/admin/users/${id}/ban`,
    UNBAN_USER: (id: number) => `/admin/users/${id}/unban`,
    UPDATE_USER_PLAN: (id: number) => `/admin/users/${id}/plan`,
    ADD_TAROTIST_ROLE: (id: number) => `/admin/users/${id}/roles/tarotist`,
    REMOVE_TAROTIST_ROLE: (id: number) => `/admin/users/${id}/roles/tarotist`,
    ADD_ADMIN_ROLE: (id: number) => `/admin/users/${id}/roles/admin`,
    REMOVE_ADMIN_ROLE: (id: number) => `/admin/users/${id}/roles/admin`,
    // Tarotistas
    TAROTISTAS: '/admin/tarotistas',
    TAROTISTA_BY_ID: (id: number) => `/admin/tarotistas/${id}`,
    DEACTIVATE_TAROTISTA: (id: number) => `/admin/tarotistas/${id}/deactivate`,
    REACTIVATE_TAROTISTA: (id: number) => `/admin/tarotistas/${id}/reactivate`,
    TAROTISTA_CONFIG: (id: number) => `/admin/tarotistas/${id}/config`,
    // Applications
    TAROTISTA_APPLICATIONS: '/admin/tarotistas/applications',
    APPROVE_APPLICATION: (id: number) => `/admin/tarotistas/applications/${id}/approve`,
    REJECT_APPLICATION: (id: number) => `/admin/tarotistas/applications/${id}/reject`,
    // AI Usage
    AI_USAGE: '/admin/ai-usage',
    // Plan Configuration
    PLAN_CONFIG: '/plan-config',
    PLAN_CONFIG_BY_TYPE: (planType: string) => `/plan-config/${planType}`,
    // Security & Rate Limiting
    RATE_LIMIT_DATA: '/admin/rate-limits/violations', // Retorna violations + blockedIPs
    SECURITY_EVENTS: '/admin/security/events',
    // TODO: Backend endpoints pendientes
    // BLOCK_IP: '/admin/security/block-ip',
    // UNBLOCK_IP: (ip: string) => `/admin/security/block-ip/${ip}`,
    // Audit Logs
    AUDIT_LOGS: '/admin/audit-logs',
    // Cache Management
    CACHE_ANALYTICS: '/admin/cache/analytics', // GET - retorna CacheAnalyticsDto
    CACHE_WARMING_STATUS: '/admin/cache/warm/status', // GET - retorna WarmingStatus separado
    INVALIDATE_ALL_CACHE: '/admin/cache/global', // DELETE - endpoint correcto
    INVALIDATE_TAROTISTA_CACHE: (tarotistaId: number) => `/admin/cache/tarotistas/${tarotistaId}`, // DELETE
    // NOTA: No existe endpoint para invalidar por spread en el backend
    TRIGGER_CACHE_WARMING: '/admin/cache/warm', // POST - endpoint correcto
  },
} as const;
