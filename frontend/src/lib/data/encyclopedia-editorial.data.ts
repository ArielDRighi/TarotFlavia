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
