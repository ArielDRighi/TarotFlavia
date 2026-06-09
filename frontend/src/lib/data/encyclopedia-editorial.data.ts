/**
 * Editorial configuration for encyclopedia articles.
 *
 * Models the "which image / callout goes in which section" decisions as DATA
 * (not hardcoded in the render), so the editorial template (`ArticleHero` +
 * `MarkdownArticle` editorial mode) can be reused across every guide. Images
 * follow the brand prompt formula documented in
 * `docs/FEEDBACK_ENCICLOPEDIA_DISENO.md` (§5–6) and live in
 * `public/images/enciclopedia/` as optimized WebP.
 *
 * Sections are keyed by their H2 number (`## 1. …`, `## 2. …`), matching the
 * Markdown structure of the guides so the renderer can attach assets by number
 * without parsing positions.
 */

const IMAGE_BASE = '/images/enciclopedia';

// ─── Types ────────────────────────────────────────────────────────────────────

/** An editorial image with a descriptive Spanish alt (accessibility/SEO). */
export interface EditorialImage {
  src: string;
  alt: string;
  /** Intrinsic width in px (for `next/image` sizing; omitted for `fill` heroes). */
  width?: number;
  /** Intrinsic height in px. */
  height?: number;
}

/** Callout flavors: a key takeaway ("Clave") or a did-you-know ("Sabías que…"). */
export type CalloutVariant = 'clave' | 'sabias';

/** An editorial callout rendered as a highlighted aside within a section. */
export interface EditorialCallout {
  variant: CalloutVariant;
  text: string;
}

/** Editorial resources attached to a single article section. */
export interface EditorialSection {
  image?: EditorialImage;
  callout?: EditorialCallout;
}

/** Full editorial configuration for an article. */
export interface ArticleEditorial {
  /** Header (hero) image. */
  hero?: EditorialImage;
  /** Per-section resources, keyed by the H2 section number (1-based). */
  sections?: Record<number, EditorialSection>;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ARTICLE_EDITORIAL: Record<string, ArticleEditorial> = {
  // ─── Guía del Tarot ────────────────────────────────────────────────────────
  'guia-tarot': {
    hero: {
      src: `${IMAGE_BASE}/guia-tarot-hero.webp`,
      alt: 'Tres cartas del Tarot estilo Rider-Waite iluminadas sobre un cielo cósmico violeta',
    },
    sections: {
      1: {
        image: {
          src: `${IMAGE_BASE}/tarot-que-es.webp`,
          alt: 'Una carta de Tarot irradiando luz dorada sobre fondo crema',
          width: 640,
          height: 794,
        },
        callout: {
          variant: 'clave',
          text: 'El Tarot no predice un futuro fijo: ilumina patrones, tendencias y posibilidades.',
        },
      },
      2: {
        image: {
          src: `${IMAGE_BASE}/tarot-arcanos-mayores.webp`,
          alt: 'Procesión de los 22 Arcanos Mayores a lo largo de un sendero dorado',
          width: 1000,
          height: 558,
        },
      },
      3: {
        image: {
          src: `${IMAGE_BASE}/tarot-tiradas.webp`,
          alt: 'Diagramas dorados de tres tiradas de Tarot: carta única, tres cartas y cruz celta',
          width: 1000,
          height: 558,
        },
        callout: {
          variant: 'sabias',
          text: 'Una carta invertida no es necesariamente negativa: puede señalar energía bloqueada o un aspecto interno del tema.',
        },
      },
      4: {
        image: {
          src: `${IMAGE_BASE}/tarot-autoconocimiento.webp`,
          alt: 'Persona meditando con una carta de Tarot luminosa flotando sobre sus manos',
          width: 1000,
          height: 558,
        },
      },
      5: {
        image: {
          src: `${IMAGE_BASE}/tarot-historia.webp`,
          alt: 'Antiguas cartas trionfi italianas del siglo XV sobre pergamino con detalle en pan de oro',
          width: 1000,
          height: 558,
        },
      },
    },
  },

  // ─── Guía de Numerología ───────────────────────────────────────────────────
  'guia-numerologia': {
    hero: {
      src: `${IMAGE_BASE}/guia-numerologia-hero.webp`,
      alt: 'Dígitos dorados del 1 al 9 flotando en geometría sagrada luminosa sobre cielo violeta índigo',
    },
    sections: {
      1: {
        image: {
          src: `${IMAGE_BASE}/numerologia-pitagoras.webp`,
          alt: 'Filósofo griego antiguo contemplando números dorados sobre un templo de mármol, atmósfera mística clásica',
          width: 640,
          height: 794,
        },
      },
      2: {
        image: {
          src: `${IMAGE_BASE}/numerologia-numeros-base.webp`,
          alt: 'Nueve numerales arquetípicos dorados radiantes dispuestos en círculo, cada uno brillando suavemente',
          width: 1000,
          height: 558,
        },
      },
      3: {
        image: {
          src: `${IMAGE_BASE}/numerologia-maestros.webp`,
          alt: 'Tres números maestros luminosos (11, 22 y 33) ascendiendo como pilares de luz dorada',
          width: 1000,
          height: 558,
        },
      },
      4: {
        image: {
          src: `${IMAGE_BASE}/numerologia-mapa-alma.webp`,
          alt: 'Fecha de nacimiento luminosa disolviéndose en corrientes de números dorados formando un mapa del alma',
          width: 1000,
          height: 558,
        },
      },
      5: {
        image: {
          src: `${IMAGE_BASE}/numerologia-ciclos.webp`,
          alt: 'Rueda espiral de calendario formada por dígitos dorados girando a través de las estaciones',
          width: 1000,
          height: 558,
        },
      },
    },
  },

  // ─── Guía del Péndulo ─────────────────────────────────────────────────────
  'guia-pendulo': {
    hero: {
      src: `${IMAGE_BASE}/guia-pendulo-hero.webp`,
      alt: 'Péndulo de cristal suspendido en pleno movimiento irradiando arcos dorados sobre un mapa místico',
    },
    sections: {
      1: {
        image: {
          src: `${IMAGE_BASE}/pendulo-historia.webp`,
          alt: 'Varillas de radiestesia antiguas y péndulo de latón sobre pergamino envejecido, ambiente místico vintage',
          width: 640,
          height: 794,
        },
      },
      2: {
        image: {
          src: `${IMAGE_BASE}/pendulo-tipos.webp`,
          alt: 'Fila de diferentes péndulos de cristal —cuarzo, amatista, latón— colgando y brillando suavemente',
          width: 1000,
          height: 558,
        },
      },
      3: {
        image: {
          src: `${IMAGE_BASE}/pendulo-limpieza.webp`,
          alt: 'Péndulo bañado en luz de luna y humo de incienso en espiral durante un ritual de purificación',
          width: 1000,
          height: 558,
        },
      },
      4: {
        image: {
          src: `${IMAGE_BASE}/pendulo-calibracion.webp`,
          alt: 'Péndulo oscilando a lo largo de ejes dorados de sí/no, diagrama de calibración elegante',
          width: 1000,
          height: 558,
        },
      },
      5: {
        image: {
          src: `${IMAGE_BASE}/pendulo-preguntar.webp`,
          alt: 'Mano sosteniendo un péndulo sobre un cuaderno abierto con un resplandor dorado de enfoque introspectivo',
          width: 1000,
          height: 558,
        },
      },
    },
  },

  // ─── Guía de Carta Astral ─────────────────────────────────────────────────
  'guia-carta-astral': {
    hero: {
      src: `${IMAGE_BASE}/guia-carta-astral-hero.webp`,
      alt: 'Rueda de carta natal luminosa con planetas y glifos zodiacales trazados en líneas doradas finas',
    },
    sections: {
      1: {
        image: {
          src: `${IMAGE_BASE}/carta-astral-requisitos.webp`,
          alt: 'Certificado de nacimiento, globo terráqueo y reloj antiguo irradiando luz, los datos del origen del alma',
          width: 640,
          height: 794,
        },
      },
      2: {
        image: {
          src: `${IMAGE_BASE}/carta-astral-big3.webp`,
          alt: 'Sol, Luna y ascendente alineados como trinidad luminosa sobre un paisaje cósmico dorado',
          width: 1000,
          height: 558,
        },
      },
      3: {
        image: {
          src: `${IMAGE_BASE}/carta-astral-planetas.webp`,
          alt: 'Procesión de planetas clásicos orbitando en cosmos violeta profundo con trazos dorados finos',
          width: 1000,
          height: 558,
        },
      },
      4: {
        image: {
          src: `${IMAGE_BASE}/carta-astral-casas.webp`,
          alt: 'Rueda de carta dividida en doce casas luminosas flotando sobre el horizonte terrestre',
          width: 1000,
          height: 558,
        },
      },
      5: {
        image: {
          src: `${IMAGE_BASE}/carta-astral-aspectos.webp`,
          alt: 'Líneas doradas geométricas (trígono, cuadratura, oposición) conectando planetas en la rueda astral',
          width: 1000,
          height: 558,
        },
      },
    },
  },

  // ─── Guía de Rituales ─────────────────────────────────────────────────────
  'guia-rituales': {
    hero: {
      src: `${IMAGE_BASE}/guia-rituales-hero.webp`,
      alt: 'Altar místico con velas encendidas, cristales y hierbas brillando en atmósfera de ritual sagrado',
    },
    sections: {
      1: {
        image: {
          src: `${IMAGE_BASE}/rituales-espacio.webp`,
          alt: 'Círculo brillante de sal y velas formando un espacio sagrado protegido',
          width: 640,
          height: 794,
        },
      },
      2: {
        image: {
          src: `${IMAGE_BASE}/rituales-rueda-tiempo.webp`,
          alt: 'Rueda de fases lunares rodeada de glifos dorados de días de la semana, calendario lunar',
          width: 1000,
          height: 558,
        },
      },
      3: {
        image: {
          src: `${IMAGE_BASE}/rituales-herramientas.webp`,
          alt: 'Hierbas, cristales, velas de colores e incienso dispuestos como herramientas rituales con detalle dorado',
          width: 1000,
          height: 558,
        },
      },
      4: {
        image: {
          src: `${IMAGE_BASE}/rituales-estructura.webp`,
          alt: 'Elegante diagrama de los pasos de un ritual ascendiendo como luz dorada, minimalista',
          width: 1000,
          height: 558,
        },
      },
    },
  },

  // ─── Guía de Horóscopo Occidental ─────────────────────────────────────────
  'guia-horoscopo-occidental': {
    hero: {
      src: `${IMAGE_BASE}/guia-horoscopo-occidental-hero.webp`,
      alt: 'Rueda zodiacal completa con doce glifos de signos brillantes y finas líneas de constelaciones',
    },
    sections: {
      1: {
        image: {
          src: `${IMAGE_BASE}/horoscopo-elementos.webp`,
          alt: 'Los cuatro símbolos elementales (fuego, tierra, aire, agua) en trazo dorado fino sobre cosmos violeta',
          width: 640,
          height: 794,
        },
      },
      2: {
        image: {
          src: `${IMAGE_BASE}/horoscopo-arquetipos.webp`,
          alt: 'Procesión de las doce constelaciones zodiacales a través de un cielo violeta estrellado',
          width: 1000,
          height: 558,
        },
      },
      3: {
        image: {
          src: `${IMAGE_BASE}/horoscopo-compatibilidad.webp`,
          alt: 'Dos ruedas de carta natal superpuestas en armonía dorada luminosa',
          width: 1000,
          height: 558,
        },
      },
    },
  },

  // ─── Guía de Horóscopo Chino ──────────────────────────────────────────────
  'guia-horoscopo-chino': {
    hero: {
      src: `${IMAGE_BASE}/guia-horoscopo-chino-hero.webp`,
      alt: 'Los doce animales del zodíaco chino en trazo dorado fino dispuestos en círculo luminoso',
    },
    sections: {
      1: {
        image: {
          src: `${IMAGE_BASE}/horoscopo-chino-carrera.webp`,
          alt: 'Los doce animales zodiacales corriendo a través de un río mítico bajo un cielo dorado',
          width: 640,
          height: 794,
        },
      },
      2: {
        image: {
          src: `${IMAGE_BASE}/horoscopo-chino-animales.webp`,
          alt: 'Procesión de los doce animales del zodíaco chino, elegantes siluetas en línea dorada fina',
          width: 1000,
          height: 558,
        },
      },
      3: {
        image: {
          src: `${IMAGE_BASE}/horoscopo-chino-wuxing.webp`,
          alt: 'El ciclo Wu Xing —madera, fuego, tierra, metal, agua— representado como pentágono dorado brillante',
          width: 1000,
          height: 558,
        },
      },
      4: {
        image: {
          src: `${IMAGE_BASE}/horoscopo-chino-compatibilidad.webp`,
          alt: 'Parejas de animales del zodíaco chino en alineación dorada armoniosa',
          width: 1000,
          height: 558,
        },
      },
    },
  },
};

// ─── Lookup ───────────────────────────────────────────────────────────────────

/**
 * Returns the editorial configuration for an article slug, or `undefined` when
 * the article has no editorial template (e.g. signs, planets). The caller falls
 * back to a plain render in that case.
 */
export function getArticleEditorial(slug: string): ArticleEditorial | undefined {
  return ARTICLE_EDITORIAL[slug];
}
