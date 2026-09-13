/**
 * Catálogo estático de las siete guías de la enciclopedia (T-SEO-022).
 *
 * ## Por qué existe
 *
 * Dos consumidores necesitaban lo mismo y lo tenían a medias:
 *
 * - `GuiasContent` (el listado `/enciclopedia/guias`) tenía el chip y la
 *   miniatura por categoría (`guia-*-hero.webp`, T-ENC-011) pero dependía de la
 *   API para título y extracto.
 * - `LatestGuides` (la portada) mostraba una **caja vacía punteada** cuando la
 *   API no respondía durante el ISR: exactamente lo que ve el revisor de
 *   AdSense si el build pega en un mal momento.
 *
 * Acá vive la fuente única: slug, título, extracto, chip y miniatura de cada
 * guía. La portada cae a este catálogo cuando no hay guías de la API, y el
 * listado toma de acá el chip y la miniatura.
 *
 * ## ⚠️ Al editar
 *
 * - El `slug` tiene que coincidir con el del corpus sembrado
 *   (`backend/.../activity-guides.data.ts`): es la URL real de la guía.
 * - Título y extracto son los del corpus, para que el fallback sea igual a lo
 *   que muestra la API y no un texto paralelo.
 * - Sin "salud", sin promesas de resultado (T-SEO-013 / T-SEO-018).
 * - Los siete assets `guia-*-hero.webp` son definitivos (no placeholders).
 */

import { ArticleCategory, GUIDE_CATEGORIES } from '@/types/encyclopedia-article.types';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Miniatura de una guía: asset del catálogo de la enciclopedia. */
export interface GuideImage {
  src: string;
  alt: string;
}

/** Chip corto y miniatura por categoría: lo que el listado ya llamaba "tema". */
export interface GuideTheme {
  /** Etiqueta corta del chip dorado. */
  chip: string;
  /** Miniatura temática; sin ella, el listado cae a su degradé de marca. */
  image?: GuideImage;
}

/** Categorías que son guías (las siete de `GUIDE_CATEGORIES`). */
export type GuideCategory =
  | ArticleCategory.GUIDE_TAROT
  | ArticleCategory.GUIDE_NUMEROLOGY
  | ArticleCategory.GUIDE_PENDULUM
  | ArticleCategory.GUIDE_BIRTH_CHART
  | ArticleCategory.GUIDE_RITUAL
  | ArticleCategory.GUIDE_HOROSCOPE
  | ArticleCategory.GUIDE_CHINESE;

/** Una guía del catálogo: lo que la portada necesita para renderizar su tarjeta sin API. */
export interface GuideCatalogEntry {
  slug: string;
  nameEs: string;
  category: GuideCategory;
  snippet: string;
  chip: string;
  image: GuideImage;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = '/images/enciclopedia';

export const GUIDES_CATALOG: Record<GuideCategory, GuideCatalogEntry> = {
  [ArticleCategory.GUIDE_TAROT]: {
    slug: 'guia-tarot',
    nameEs: 'Guía del Tarot',
    category: ArticleCategory.GUIDE_TAROT,
    snippet:
      'Descubre el antiguo arte adivinatorio del Tarot. Conoce los 78 arcanos, los significados de los Arcanos Mayores y Menores, y aprende cómo una tirada de cartas puede revelar mensajes sobre tu camino de vida.',
    chip: 'Tarot',
    image: {
      src: `${IMAGE_BASE}/guia-tarot-hero.webp`,
      alt: 'Ilustración mística de cartas de tarot con resplandor dorado',
    },
  },
  [ArticleCategory.GUIDE_NUMEROLOGY]: {
    slug: 'guia-numerologia',
    nameEs: 'Guía de Numerología',
    category: ArticleCategory.GUIDE_NUMEROLOGY,
    snippet:
      'Descubre el lenguaje oculto de los números. Aprende a calcular tu Camino de Vida, tu Número del Alma y comprende cómo la numerología pitagórica revela el propósito de tu destino y tus ciclos personales.',
    chip: 'Numerología',
    image: {
      src: `${IMAGE_BASE}/guia-numerologia-hero.webp`,
      alt: 'Numerales dorados luminosos del 1 al 9 dentro de una geometría sagrada',
    },
  },
  [ArticleCategory.GUIDE_PENDULUM]: {
    slug: 'guia-pendulo',
    nameEs: 'Guía del Péndulo',
    category: ArticleCategory.GUIDE_PENDULUM,
    snippet:
      'Aprende el antiguo arte de la radiestesia. Descubre cómo elegir, programar y limpiar tu péndulo para obtener respuestas claras de tu subconsciente y guías espirituales.',
    chip: 'Péndulo',
    image: {
      src: `${IMAGE_BASE}/guia-pendulo-hero.webp`,
      alt: 'Péndulo de cristal suspendido trazando arcos dorados sobre una carta mística',
    },
  },
  [ArticleCategory.GUIDE_BIRTH_CHART]: {
    slug: 'guia-carta-astral',
    nameEs: 'Guía de Carta Astral',
    category: ArticleCategory.GUIDE_BIRTH_CHART,
    snippet:
      'Entiende el mapa del cielo en el momento exacto de tu nacimiento. Domina la interpretación del Sol, la Luna, el Ascendente, las casas astrológicas y los planetas para revelar tu diseño cósmico.',
    chip: 'Carta Astral',
    image: {
      src: `${IMAGE_BASE}/guia-carta-astral-hero.webp`,
      alt: 'Rueda de carta natal luminosa con planetas y glifos zodiacales en finas líneas doradas',
    },
  },
  [ArticleCategory.GUIDE_RITUAL]: {
    slug: 'guia-rituales',
    nameEs: 'Guía de Rituales',
    category: ArticleCategory.GUIDE_RITUAL,
    snippet:
      'Una introducción práctica a la magia natural. Descubre cómo usar las fases lunares, la limpieza energética y la intención focalizada para manifestar cambios reales en tu vida.',
    chip: 'Rituales',
    image: {
      src: `${IMAGE_BASE}/guia-rituales-hero.webp`,
      alt: 'Altar místico con velas encendidas, cristales y hierbas en una atmósfera ritual',
    },
  },
  [ArticleCategory.GUIDE_HOROSCOPE]: {
    slug: 'guia-horoscopo-occidental',
    nameEs: 'Guía del Horóscopo Occidental',
    category: ArticleCategory.GUIDE_HOROSCOPE,
    snippet:
      'Comprende los 12 signos zodiacales tropicales. Explora cómo los elementos y modalidades conforman las personalidades y descubre cómo los tránsitos diarios afectan tu energía.',
    chip: 'Horóscopo',
    image: {
      src: `${IMAGE_BASE}/guia-horoscopo-hero.webp`,
      alt: 'Rueda zodiacal completa con los doce glifos brillando y finas líneas de constelaciones',
    },
  },
  [ArticleCategory.GUIDE_CHINESE]: {
    slug: 'guia-horoscopo-chino',
    nameEs: 'Guía del Horóscopo Chino',
    category: ArticleCategory.GUIDE_CHINESE,
    snippet:
      'Adéntrate en el sistema astrológico oriental. Conoce tu animal regente y descubre cómo interactúan los Cinco Elementos (Wu Xing) en ciclos de 60 años para moldear tu destino.',
    chip: 'Horóscopo Chino',
    image: {
      src: `${IMAGE_BASE}/guia-horoscopo-chino-hero.webp`,
      alt: 'Los doce animales del zodíaco chino en finas líneas doradas dispuestos en círculo luminoso',
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isGuideCategory(category: ArticleCategory): category is GuideCategory {
  return category in GUIDES_CATALOG;
}

/** Las siete guías en el orden editorial del listado (`GUIDE_CATEGORIES`). */
export const GUIDES_CATALOG_LIST: GuideCatalogEntry[] = GUIDE_CATEGORIES.filter(
  isGuideCategory
).map((category) => GUIDES_CATALOG[category]);

/**
 * Chip + miniatura de una categoría. Para una categoría que no es guía
 * devuelve el chip genérico sin imagen, y el listado cae a su degradé.
 */
export function getGuideTheme(category: ArticleCategory): GuideTheme {
  if (!isGuideCategory(category)) {
    return { chip: 'Guía' };
  }
  const { chip, image } = GUIDES_CATALOG[category];
  return { chip, image };
}
