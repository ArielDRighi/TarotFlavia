import type { Metadata } from 'next';

import { ROUTES } from '@/lib/constants/routes';
import { CHINESE_ZODIAC_INFO } from '@/lib/utils/chinese-zodiac';
import { ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';
import type { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';
import type { ZodiacSign } from '@/types/horoscope.types';
import { OG_IMAGE_ALT, OG_IMAGE_PATH, OG_IMAGE_SIZE } from './og-image';

/**
 * `title` y `description` propios de cada ruta pública (T-PROD-020).
 *
 * ## Por qué existe este módulo
 *
 * Search Console reportó *"Duplicada: Google ha elegido una versión canónica
 * diferente a la del usuario"*. La causa no era el canonical — `defaultMetadata`
 * ya declara un self-canonical correcto (`'./'`, ver `seo.ts`) — sino que casi
 * todas las URLs del sitemap **heredaban el mismo `<title>` ("Auguria") y la misma
 * description** del root layout. Con título, description y (en las fichas client)
 * HTML inicial idénticos, Google agrupa las URLs como duplicadas y elige UNA
 * canónica por su cuenta, ignorando la declarada.
 *
 * La defensa es que cada ruta diga algo distinto. El test de este módulo asevera
 * justamente eso: **ningún título, description ni canonical se repite**.
 *
 * ## Por qué cada metadata repite `openGraph`
 *
 * Next **no hace merge profundo** de metadata: una página que declara `openGraph`
 * pisa el `openGraph` del padre entero, no solo los campos que nombra. Sin repetir
 * `images`/`siteName`/`locale` acá, cada página con metadata propia perdería la
 * preview social que `defaultMetadata` configura.
 */

/** Longitud a partir de la cual Google trunca la description en el SERP. */
const MAX_DESCRIPTION_LENGTH = 160;

/** Ídem para el título, contando el " | Auguria" que agrega el root layout. */
const MAX_TITLE_LENGTH = 60;

const SITE_NAME = 'Auguria';

const TITLE_SUFFIX = ` | ${SITE_NAME}`;

interface PageMetadataInput {
  /** Sin el sufijo del sitio: el template del root layout agrega " | Auguria". */
  title: string;
  description: string;
  /** Path absoluto de la ruta (`/rituales`), nunca relativo. */
  canonical: string;
}

/**
 * Recorta en el último espacio para no cortar una palabra por la mitad.
 *
 * Las descripciones dinámicas vienen de la API (descripción de una carta, de un
 * ritual, de un servicio) y pueden ser párrafos enteros.
 */
function clampText(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const cut = normalized.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(' ');

  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function clampDescription(text: string): string {
  return clampText(text, MAX_DESCRIPTION_LENGTH);
}

/**
 * Los títulos dinámicos interpolan datos de la API (nombre de un ritual, de un
 * servicio) cuya longitud no controlamos: sin tope, Google los corta donde le
 * conviene y el `<title>` deja de leerse.
 */
function clampTitle(text: string): string {
  return clampText(text, MAX_TITLE_LENGTH - TITLE_SUFFIX.length);
}

/**
 * Metadata para un valor de ruta que no existe (`/horoscopo/unicornio`).
 *
 * Devolver `{}` no alcanzaba: la página heredaba el `alternates.canonical` del
 * layout del hub, así que una URL basura respondía 200 declarándose duplicada de
 * `/horoscopo` — el patrón exacto que originó T-PROD-020, fabricado a propósito.
 * `'./'` la hace self-canonical y el `noindex` la deja fuera del índice.
 */
export const INVALID_ROUTE_PARAM_METADATA: Metadata = {
  alternates: { canonical: './' },
  robots: { index: false, follow: true },
};

export function buildPageMetadata({ title, description, canonical }: PageMetadataInput): Metadata {
  const clampedTitle = clampTitle(title);

  return {
    title: clampedTitle,
    description,
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      siteName: SITE_NAME,
      title: clampedTitle,
      description,
      url: canonical,
      images: [{ url: OG_IMAGE_PATH, ...OG_IMAGE_SIZE, alt: OG_IMAGE_ALT }],
    },
    alternates: {
      canonical,
    },
  };
}

// ─── Rutas públicas estáticas ─────────────────────────────────────────────────

export const STATIC_PAGE_METADATA = {
  enciclopedia: buildPageMetadata({
    title: 'Enciclopedia Mística',
    description:
      'Significados del tarot, astrología y guías esotéricas explicados paso a paso. Consultá la enciclopedia completa de Auguria.',
    canonical: ROUTES.ENCICLOPEDIA,
  }),

  enciclopediaTarot: buildPageMetadata({
    title: 'Significado de las Cartas del Tarot',
    description:
      'Las 78 cartas del tarot con su significado al derecho e invertido, arcanos mayores y menores, y sus palabras clave.',
    canonical: ROUTES.ENCICLOPEDIA_TAROT,
  }),

  enciclopediaAstrologia: buildPageMetadata({
    title: 'Astrología: Signos, Planetas y Casas',
    description:
      'Guía de astrología: los 12 signos, los planetas y las 12 casas astrológicas explicados para interpretar tu carta natal.',
    canonical: ROUTES.ENCICLOPEDIA_ASTROLOGIA,
  }),

  enciclopediaSignos: buildPageMetadata({
    title: 'Los 12 Signos del Zodíaco',
    description:
      'Personalidad, elemento y compatibilidad de cada signo del zodíaco, de Aries a Piscis, explicados uno por uno.',
    canonical: ROUTES.ENCICLOPEDIA_ASTROLOGIA_SIGNOS,
  }),

  enciclopediaPlanetas: buildPageMetadata({
    title: 'Los Planetas en Astrología',
    description:
      'Qué significa cada planeta en la carta natal: Sol, Luna, Mercurio, Venus, Marte y los planetas transpersonales.',
    canonical: ROUTES.ENCICLOPEDIA_ASTROLOGIA_PLANETAS,
  }),

  enciclopediaCasas: buildPageMetadata({
    title: 'Las 12 Casas Astrológicas',
    description:
      'Qué área de la vida rige cada una de las 12 casas astrológicas y cómo interpretarlas dentro de tu carta natal.',
    canonical: ROUTES.ENCICLOPEDIA_ASTROLOGIA_CASAS,
  }),

  enciclopediaGuias: buildPageMetadata({
    title: 'Guías Esotéricas',
    description:
      'Cómo tirar el tarot, usar el péndulo, calcular tu numerología y leer tu carta natal: guías prácticas para empezar.',
    canonical: ROUTES.ENCICLOPEDIA_GUIAS,
  }),

  horoscopo: buildPageMetadata({
    title: 'Horóscopo Diario',
    description:
      'El horóscopo de hoy para los 12 signos del zodíaco: amor, trabajo y energía del día, actualizado cada mañana.',
    canonical: ROUTES.HOROSCOPO,
  }),

  horoscopoChino: buildPageMetadata({
    title: 'Horóscopo Chino',
    description:
      'Los 12 animales del zodíaco chino y su predicción: encontrá tu animal según tu año de nacimiento y su elemento.',
    canonical: ROUTES.HOROSCOPO_CHINO,
  }),

  cartaAstral: buildPageMetadata({
    title: 'Carta Astral',
    description:
      'Descubre tu carta astral natal: la posición de los planetas en el momento de tu nacimiento y su interpretación personalizada.',
    canonical: ROUTES.CARTA_ASTRAL,
  }),

  numerologia: buildPageMetadata({
    title: 'Numerología: Calculá tu Número',
    description:
      'Calculá tu número de vida a partir de tu fecha de nacimiento y conocé qué revela sobre tu personalidad y tu camino.',
    canonical: ROUTES.NUMEROLOGIA,
  }),

  pendulo: buildPageMetadata({
    title: 'Péndulo Virtual',
    description:
      'Consultá el péndulo online y obtené una respuesta de sí o no a tus preguntas, con una guía para interpretarla.',
    canonical: ROUTES.PENDULO,
  }),

  rituales: buildPageMetadata({
    title: 'Rituales y Ceremonias',
    description:
      'Rituales de luna llena, limpieza energética, abundancia y protección, con sus materiales y su paso a paso.',
    canonical: ROUTES.RITUALES,
  }),

  servicios: buildPageMetadata({
    title: 'Servicios Holísticos',
    description:
      'Sesiones personales con Flavia: registros akáshicos, terapias holísticas y acompañamiento espiritual. Reservá tu turno.',
    canonical: ROUTES.SERVICIOS,
  }),

  premium: buildPageMetadata({
    // Sin la marca: el template del root layout ya agrega " | Auguria".
    title: 'Plan Premium',
    description:
      'Tiradas ilimitadas, interpretaciones personalizadas y navegación sin publicidad. Conocé los beneficios del plan Premium.',
    canonical: ROUTES.PREMIUM,
  }),

  contacto: buildPageMetadata({
    title: 'Contacto',
    description:
      'Escribinos tus dudas, sugerencias o consultas sobre Auguria y te respondemos a la brevedad.',
    canonical: ROUTES.CONTACTO,
  }),

  privacidad: buildPageMetadata({
    title: 'Política de Privacidad',
    description:
      'Cómo Auguria recolecta, usa y protege tus datos personales, y qué derechos tenés sobre ellos.',
    canonical: ROUTES.PRIVACIDAD,
  }),

  terminos: buildPageMetadata({
    title: 'Términos y Condiciones',
    description:
      'Las condiciones de uso de Auguria: cuentas, suscripciones, pagos y responsabilidades del servicio.',
    canonical: ROUTES.TERMINOS,
  }),
} satisfies Record<string, Metadata>;

// ─── Rutas públicas dinámicas ─────────────────────────────────────────────────

/**
 * Ficha de horóscopo por signo.
 *
 * Los datos salen de constantes locales (`ZODIAC_SIGNS_INFO`), no de la API: el
 * texto del horóscopo cambia todos los días y el `<title>` no debería.
 */
export function getHoroscopeSignMetadata(sign: ZodiacSign): Metadata {
  const { nameEs, symbol } = ZODIAC_SIGNS_INFO[sign];

  return buildPageMetadata({
    title: `Horóscopo de ${nameEs} Hoy`,
    description: `El horóscopo de hoy para ${nameEs} ${symbol}: amor, trabajo, salud y la energía que marca el día para el signo.`,
    canonical: ROUTES.HOROSCOPO_SIGN(sign),
  });
}

/** Ficha de horóscopo chino por animal. */
export function getChineseZodiacMetadata(animal: ChineseZodiacAnimal): Metadata {
  const { nameEs, emoji } = CHINESE_ZODIAC_INFO[animal];

  return buildPageMetadata({
    title: `Horóscopo Chino: ${nameEs}`,
    description: `Predicción para el signo ${nameEs} ${emoji} del zodíaco chino: personalidad, elemento y años de nacimiento.`,
    canonical: ROUTES.HOROSCOPO_CHINO_ANIMAL(animal),
  });
}

/** Ficha de una carta de tarot (`/enciclopedia/tarot/[slug]`). */
export function getCardDetailMetadata(card: {
  slug: string;
  nameEs: string;
  description: string | null;
  meaningUpright: string;
}): Metadata {
  return buildPageMetadata({
    // Corto a propósito: los nombres largos ("Caballero de Pentáculos") dejaban
    // el título al filo de los 60 caracteres del SERP con el sufijo del layout.
    title: `${card.nameEs} — Significado`,
    // `description` es opcional en el modelo de carta; el significado al derecho
    // no lo es, y describe la carta igual de bien para el SERP.
    description: clampDescription(card.description ?? card.meaningUpright),
    canonical: ROUTES.ENCICLOPEDIA_TAROT_CARD(card.slug),
  });
}

/** Ficha de un ritual (`/rituales/[slug]`). */
export function getRitualDetailMetadata(ritual: {
  slug: string;
  title: string;
  description: string;
}): Metadata {
  return buildPageMetadata({
    title: `${ritual.title} — Ritual`,
    description: clampDescription(ritual.description),
    canonical: ROUTES.RITUAL_DETAIL(ritual.slug),
  });
}

/** Ficha de un servicio holístico (`/servicios/[slug]`). */
export function getServiceDetailMetadata(service: {
  slug: string;
  name: string;
  shortDescription: string;
}): Metadata {
  return buildPageMetadata({
    title: `${service.name} — Sesión con Flavia`,
    description: clampDescription(service.shortDescription),
    canonical: ROUTES.SERVICIO_DETAIL(service.slug),
  });
}
