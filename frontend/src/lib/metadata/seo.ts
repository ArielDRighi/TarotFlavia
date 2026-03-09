import type { Metadata } from 'next';

/**
 * SEO Configuration for Auguria
 *
 * Centralized metadata configuration for consistent SEO across all pages.
 */

/**
 * Base URL for the application
 * Used for canonical URLs and Open Graph images
 */
const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === 'production'
    ? (() => {
        throw new Error('NEXT_PUBLIC_APP_URL environment variable must be set in production.');
      })()
    : 'http://localhost:3001');

/**
 * Default Open Graph image
 * Should be 1200x630px for optimal social media sharing
 */
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * Site name used across all metadata
 */
const SITE_NAME = 'Auguria';

/**
 * Default metadata shared across all pages
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description:
    'Marketplace de tarotistas profesionales. Conecta con guías espirituales y descubre tu camino.',
  keywords: ['tarot', 'tarotistas', 'lecturas de tarot', 'guía espiritual', 'consulta tarot'],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.svg', type: 'image/svg+xml', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE_NAME,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Home Page Metadata
 */
export const homeMetadata: Metadata = {
  title: 'Tu guía espiritual',
  description:
    'Lecturas de tarot personalizadas y sesiones con tarotistas profesionales. Descubre tu destino y conecta con guías espirituales.',
  openGraph: {
    title: `${SITE_NAME} - Tu guía espiritual`,
    description:
      'Descubre tu destino con lecturas de tarot y sesiones con tarotistas profesionales',
    images: [DEFAULT_OG_IMAGE],
  },
};

/**
 * Login Page Metadata
 */
export const loginMetadata: Metadata = {
  title: 'Iniciar Sesión',
  description:
    'Ingresa a tu cuenta para acceder a tus lecturas de tarot y sesiones con tarotistas.',
  robots: {
    index: false,
    follow: true,
  },
};

/**
 * Register Page Metadata
 */
export const registerMetadata: Metadata = {
  title: 'Crear Cuenta',
  description:
    'Regístrate gratis y comienza tu viaje espiritual con lecturas de tarot personalizadas.',
  robots: {
    index: false,
    follow: true,
  },
};

/**
 * Ritual Page Metadata
 */
export const ritualMetadata: Metadata = {
  title: 'Tirada de Tarot',
  description:
    'Inicia una nueva lectura de tarot. Selecciona tu categoría y descubre las respuestas que buscas.',
  openGraph: {
    title: `Tirada de Tarot | ${SITE_NAME}`,
    description: 'Descubre las respuestas que buscas con una lectura de tarot personalizada',
    images: [DEFAULT_OG_IMAGE],
  },
};

/**
 * History Page Metadata
 */
export const historialMetadata: Metadata = {
  title: 'Mis Lecturas',
  description:
    'Revisa el historial de tus lecturas de tarot y vuelve a consultar las interpretaciones.',
  robots: {
    index: false,
    follow: true,
  },
};

/**
 * Daily Card Page Metadata
 */
export const cartaDelDiaMetadata: Metadata = {
  title: 'Tarot del Día',
  description: 'Descubre tu carta del día y recibe orientación espiritual para el día de hoy.',
  openGraph: {
    title: `Tarot del Día | ${SITE_NAME}`,
    description: 'Descubre tu carta del día y recibe orientación espiritual',
    images: [DEFAULT_OG_IMAGE],
  },
};

/**
 * Explore Page Metadata
 */
export const explorarMetadata: Metadata = {
  title: 'Explorar Tarotistas',
  description:
    'Descubre tarotistas profesionales y reserva sesiones personalizadas. Encuentra tu guía espiritual ideal.',
  openGraph: {
    title: `Explorar Tarotistas | ${SITE_NAME}`,
    description: 'Encuentra tu tarotista profesional ideal y reserva sesiones personalizadas',
    images: [DEFAULT_OG_IMAGE],
  },
};

/**
 * Profile Page Metadata
 */
export const perfilMetadata: Metadata = {
  title: 'Mi Perfil',
  description: 'Gestiona tu cuenta, suscripción y preferencias de notificaciones.',
  robots: {
    index: false,
    follow: true,
  },
};

/**
 * Generate dynamic metadata for tarotista profile pages
 */
export function generateTarotistaMetadata(
  tarotista: {
    nombre: string;
    especialidades: string[];
    descripcion?: string;
  },
  id: number
): Metadata {
  const title = `${tarotista.nombre} - Tarotista Profesional`;
  const description =
    tarotista.descripcion ||
    `Consulta con ${tarotista.nombre}, especialista en ${tarotista.especialidades.join(', ')}. Reserva tu sesión de tarot personalizada.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [DEFAULT_OG_IMAGE],
      type: 'profile',
    },
    alternates: {
      canonical: `/tarotistas/${id}`,
    },
  };
}

/**
 * Generate metadata for encyclopedia article detail pages
 */
export function getArticleMetadata(article: { nameEs: string; snippet: string }): Metadata {
  const title = `${article.nameEs} | Enciclopedia Mística`;

  return {
    title,
    description: article.snippet,
    openGraph: {
      title,
      description: article.snippet,
      type: 'article',
    },
  };
}

/**
 * Generate dynamic metadata for shared reading pages
 */
export function generateSharedReadingMetadata(reading: {
  question: string;
  categoryName?: string;
}): Metadata {
  const title = `Lectura de Tarot: ${reading.question}`;
  const description = reading.categoryName
    ? `Lectura de tarot sobre ${reading.categoryName}. Descubre la interpretación completa.`
    : 'Descubre esta lectura de tarot compartida y su interpretación completa.';

  // Generate descriptive alt text for image
  const imageAlt = reading.categoryName
    ? `Lectura de Tarot: ${reading.question} - ${reading.categoryName} en Auguria`
    : `Lectura de Tarot: ${reading.question} en Auguria`;

  // Current date for article published time
  const publishedTime = new Date().toISOString();

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
      type: 'article',
      locale: 'es_ES',
      siteName: SITE_NAME,
      publishedTime,
      authors: [SITE_NAME],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [DEFAULT_OG_IMAGE],
      site: '@auguriatarot',
      creator: '@auguriatarot',
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      languages: {
        es: '',
        'es-ES': '',
        'es-MX': '',
        'es-AR': '',
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
  };
}
