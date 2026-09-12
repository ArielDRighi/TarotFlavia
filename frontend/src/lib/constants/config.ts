/**
 * Application Configuration
 *
 * Configuraciones globales de la aplicación
 */

export const CONFIG = {
  // App info
  APP_NAME: 'Auguria',
  APP_DESCRIPTION: 'Marketplace de tarotistas profesionales',

  // Contact
  /**
   * Única dirección de contacto pública. Es la casilla real del dominio del
   * proyecto (`auguriatarot.com`); cualquier otro dominio rebota.
   */
  CONTACT_EMAIL: 'consultas@auguriatarot.com',
  /**
   * Dónde está el equipo, para la página de contacto (T-SEO-015): una página
   * de confianza dice desde dónde responde. La ciudad/provincia concreta es una
   * decisión de negocio ligada a quién firma (T-SEO-017); hasta entonces, el
   * país y la zona horaria en la que se responde.
   */
  CONTACT_LOCATION: 'Argentina',
  /** Ventana de respuesta que se promete en /contacto y en /premium. */
  CONTACT_RESPONSE_WINDOW: '24-48 horas',

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
