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
  HOROSCOPO: '/horoscopo',
  HOROSCOPO_SIGN: (sign: string) => `/horoscopo/${sign}`,
  HOROSCOPO_CHINO: '/horoscopo-chino',
  HOROSCOPO_CHINO_ANIMAL: (animal: string) => `/horoscopo-chino/${animal}`,
  NUMEROLOGIA: '/numerologia',
  PENDULO: '/pendulo',
  CARTA_ASTRAL: '/carta-astral',

  // Dashboard (authenticated)
  DASHBOARD: '/dashboard',
  LECTURAS: '/lecturas',
  LECTURAS_NEW: '/lecturas/nueva',
  LECTURAS_PAPELERA: '/lecturas/papelera',
  LECTURA_DETAIL: (id: string) => `/lecturas/${id}`,

  // Premium
  PREMIUM: '/premium',
  PREMIUM_ACTIVACION: '/premium/activacion',

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

  // Holistic Services (Servicios Flavia)
  SERVICIOS: '/servicios',
  SERVICIO_DETAIL: (slug: string) => `/servicios/${slug}`,
  SERVICIO_PAGO: (slug: string) => `/servicios/${slug}/pago`,
  SERVICIO_RESERVAR: (purchaseId: number) => `/servicios/reservar/${purchaseId}`,
  MIS_SERVICIOS: '/mis-servicios',

  // Rituals
  RITUALES: '/rituales',
  RITUAL_DETAIL: (slug: string) => `/rituales/${slug}`,
  RITUALES_HISTORIAL: '/rituales/historial',

  // Encyclopedia
  ENCICLOPEDIA: '/enciclopedia',
  ENCICLOPEDIA_CARD: (slug: string) => `/enciclopedia/${slug}`,

  // Encyclopedia — Tarot
  ENCICLOPEDIA_TAROT: '/enciclopedia/tarot',
  ENCICLOPEDIA_TAROT_CARD: (slug: string) => `/enciclopedia/tarot/${slug}`,

  // Encyclopedia — Astrología
  ENCICLOPEDIA_ASTROLOGIA: '/enciclopedia/astrologia',
  ENCICLOPEDIA_ASTROLOGIA_SIGNOS: '/enciclopedia/astrologia/signos',
  ENCICLOPEDIA_ASTROLOGIA_PLANETAS: '/enciclopedia/astrologia/planetas',
  ENCICLOPEDIA_ASTROLOGIA_CASAS: '/enciclopedia/astrologia/casas',
  ENCICLOPEDIA_SIGNO: (slug: string) => `/enciclopedia/astrologia/signos/${slug}`,
  ENCICLOPEDIA_PLANETA: (slug: string) => `/enciclopedia/astrologia/planetas/${slug}`,
  ENCICLOPEDIA_CASA: (slug: string) => `/enciclopedia/astrologia/casas/${slug}`,

  // Encyclopedia — Guías
  ENCICLOPEDIA_GUIAS: '/enciclopedia/guias',
  ENCICLOPEDIA_GUIA: (slug: string) => `/enciclopedia/guias/${slug}`,

  // Encyclopedia — Elementos y modalidades
  ENCICLOPEDIA_ELEMENTO: (slug: string) => `/enciclopedia/elementos/${slug}`,
} as const;
