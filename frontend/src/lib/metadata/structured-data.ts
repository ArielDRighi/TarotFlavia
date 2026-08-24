import { ABOUT_PAGE } from '@/lib/constants/about-page.data';
import { LOGO } from '@/lib/constants/branding';
import { CONFIG } from '@/lib/constants';
import { ROUTES } from '@/lib/constants/routes';
import { getBaseUrl } from './base-url';

/**
 * Datos estructurados (JSON-LD) del sitio — T-SEO-011.
 *
 * ## Qué resuelve
 *
 * Google no infiere quién publica un sitio a partir del texto: lo lee del
 * `Organization` declarado en JSON-LD. Auguria no emitía ninguno, así que las
 * señales de autoría que aporta `/sobre-nosotros` quedaban en prosa suelta,
 * invisibles para el parser.
 *
 * ## Por qué un `@id` en vez de repetir el Organization
 *
 * El `Organization` es una entidad única del sitio. Cada página que lo necesite
 * (la de autoría hoy; artículos y fichas más adelante) lo referencia por su
 * `@id` estable en lugar de volver a describirlo: así Google consolida todo en
 * **una** entidad en vez de tratar cada copia como un publisher distinto.
 *
 * ## Todo absoluto
 *
 * Las URLs relativas dentro de un JSON-LD se descartan silenciosamente: no dan
 * error, simplemente el campo no cuenta. Por eso cada `url`, `logo` y `@id` se
 * construye sobre `getBaseUrl()`, que además es lo que permite que los tests
 * simulen producción sin acoplarse al dominio.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Referencia a una entidad ya declarada en otro bloque, por su `@id`. */
export type SchemaReference = {
  '@id': string;
};

/** Imagen de schema.org (el logo del `Organization`). */
export type SchemaImageObject = {
  '@type': 'ImageObject';
  url: string;
};

/** Punto de contacto público de la organización. */
export type SchemaContactPoint = {
  '@type': 'ContactPoint';
  contactType: string;
  email: string;
  availableLanguage: string;
};

/** `Organization` del sitio: la entidad que publica todo el contenido. */
export type OrganizationSchema = {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  '@id': string;
  name: string;
  url: string;
  logo: SchemaImageObject;
  description: string;
  /** Áreas sobre las que el equipo produce contenido (señal E-E-A-T). */
  knowsAbout: string[];
  foundingDate: string;
  /**
   * Contacto verificable. AdSense lo enumera entre lo que busca en un sitio, y
   * hasta ahora solo existía como `mailto:` en `/contacto`.
   *
   * `inLanguage` NO va acá: schema.org la define sobre `CreativeWork`, no sobre
   * `Organization`. En `AboutPage` sí es válida.
   */
  email: string;
  contactPoint: SchemaContactPoint;
};

/** `AboutPage`: el tipo que schema.org reserva para la página institucional. */
export type AboutPageSchema = {
  '@context': 'https://schema.org';
  '@type': 'AboutPage';
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  /** De quién trata la página. */
  about: SchemaReference;
  /** Quién la publica. Misma entidad, referenciada y no duplicada. */
  publisher: SchemaReference;
  /** Última revisión editorial del contenido, de `ABOUT_PAGE.lastReviewed`. */
  dateModified: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Fragmento del `@id` de la organización.
 *
 * Es un identificador, no una ruta navegable: el `#` evita que se confunda con
 * una URL del sitio y mantiene el id estable aunque la home cambie de forma.
 */
export const ORGANIZATION_ID = '/#organization';

const SITE_NAME = 'Auguria';

/** Año en que el proyecto empezó a publicar. */
const FOUNDING_DATE = '2025';

const LANGUAGE = 'es';

/**
 * Áreas de conocimiento declaradas. Son exactamente las disciplinas que el sitio
 * cubre: declarar de más es una señal falsa, y Google la contrasta con el
 * contenido que efectivamente publicamos.
 */
const KNOWS_ABOUT = [
  'Tarot',
  'Astrología',
  'Carta natal',
  'Numerología',
  'Radiestesia',
  'Horóscopo chino',
  'Rituales',
];

// ─── Builders ─────────────────────────────────────────────────────────────────

/**
 * `Organization` del sitio. Se emite en el layout raíz, así que **toda** URL lo
 * declara: si viviera solo en `/sobre-nosotros`, la entidad editora existiría
 * para Google en una página hoja y las ~120 URLs de enciclopedia quedarían sin
 * publisher declarado.
 */
export function buildOrganizationJsonLd(): OrganizationSchema {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}${ORGANIZATION_ID}`,
    name: SITE_NAME,
    url: `${baseUrl}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}${LOGO.path}`,
    },
    description:
      'Equipo dedicado al tarot, la astrología, la numerología y el trabajo con péndulo, que publica una enciclopedia esotérica de acceso libre y acompaña consultas personales.',
    knowsAbout: KNOWS_ABOUT,
    foundingDate: FOUNDING_DATE,
    email: CONFIG.CONTACT_EMAIL,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: CONFIG.CONTACT_EMAIL,
      availableLanguage: LANGUAGE,
    },
  };
}

/** `AboutPage` de `/sobre-nosotros`, enlazada al `Organization` por `@id`. */
export function buildAboutPageJsonLd(): AboutPageSchema {
  const baseUrl = getBaseUrl();
  const organizationReference: SchemaReference = { '@id': `${baseUrl}${ORGANIZATION_ID}` };

  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `Sobre Nosotros | ${SITE_NAME}`,
    description:
      'Quiénes escriben Auguria, con qué trayectoria, cómo se produce el contenido de la enciclopedia y qué límites tiene lo que ofrecemos.',
    url: `${baseUrl}${ROUTES.SOBRE_NOSOTROS}`,
    inLanguage: LANGUAGE,
    about: organizationReference,
    publisher: organizationReference,
    dateModified: ABOUT_PAGE.lastReviewed,
  };
}
