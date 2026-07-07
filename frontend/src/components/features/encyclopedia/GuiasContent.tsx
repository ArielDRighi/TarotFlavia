'use client';

// 1. React & Next.js
import Image from 'next/image';
import Link from 'next/link';

// 5. Components (common → ui → features)
import { Reveal } from '@/components/common';
// 6. Utils & types
import { useArticlesByCategory } from '@/hooks/api/useEncyclopediaArticles';
import { ROUTES } from '@/lib/constants/routes';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GuideTheme {
  /** Short category label shown in the gold chip. */
  chip: string;
  /** Themed thumbnail; falls back to a brand gradient when absent. */
  image?: { src: string; alt: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_BASE = '/images/enciclopedia';

/**
 * Brand-night gradient used as the header band background and as the thumbnail
 * fallback (kept in sync with `ArticleHero` / `EnciclopediaHubContent`).
 */
const HERO_GRADIENT = 'linear-gradient(160deg, #1a0a2e 0%, #2d1b69 55%, #1a0a2e 100%)';
const THUMB_FALLBACK_GRADIENT = 'linear-gradient(150deg, #2d1b69 0%, #1a0a2e 60%, #2d1b69 100%)';
const THUMB_OVERLAY =
  'linear-gradient(180deg, rgba(26, 10, 46, 0) 35%, rgba(26, 10, 46, 0.45) 100%)';
const GOLD_FILLET = 'linear-gradient(90deg, transparent, #d69e2e, transparent)';
const CREAM = '#f9f7f2';
const CREAM_MUTED = 'rgba(249, 247, 242, 0.72)';

/**
 * Guide categories, in display order. The Tarot guide stays first (BUG-017 fix).
 */
const GUIDE_CATEGORIES: ArticleCategory[] = [
  ArticleCategory.GUIDE_TAROT,
  ArticleCategory.GUIDE_NUMEROLOGY,
  ArticleCategory.GUIDE_PENDULUM,
  ArticleCategory.GUIDE_BIRTH_CHART,
  ArticleCategory.GUIDE_RITUAL,
  ArticleCategory.GUIDE_HOROSCOPE,
  ArticleCategory.GUIDE_CHINESE,
];

/**
 * Per-category editorial theme: short gold chip label and a themed thumbnail.
 * Each guide reuses its own hero (`guia-*-hero.webp`) as the listing thumbnail
 * (T-ENC-011), so the `✦` gradient fallback is now only a defensive safety net
 * for non-themed categories or a missing asset.
 *
 * NOTE: the 6 non-tarot heroes ship as provisional placeholders (copies of
 * `hub-guias.webp`) until T-ENC-014 generates the definitive WebP assets per the
 * §C base formula; replacing the files needs no code change.
 */
const GUIDE_THEME: Partial<Record<ArticleCategory, GuideTheme>> = {
  [ArticleCategory.GUIDE_TAROT]: {
    chip: 'Tarot',
    image: {
      src: `${IMAGE_BASE}/guia-tarot-hero.webp`,
      alt: 'Ilustración mística de cartas de tarot con resplandor dorado',
    },
  },
  [ArticleCategory.GUIDE_NUMEROLOGY]: {
    chip: 'Numerología',
    image: {
      src: `${IMAGE_BASE}/guia-numerologia-hero.webp`,
      alt: 'Numerales dorados luminosos del 1 al 9 dentro de una geometría sagrada',
    },
  },
  [ArticleCategory.GUIDE_PENDULUM]: {
    chip: 'Péndulo',
    image: {
      src: `${IMAGE_BASE}/guia-pendulo-hero.webp`,
      alt: 'Péndulo de cristal suspendido trazando arcos dorados sobre una carta mística',
    },
  },
  [ArticleCategory.GUIDE_BIRTH_CHART]: {
    chip: 'Carta Astral',
    image: {
      src: `${IMAGE_BASE}/guia-carta-astral-hero.webp`,
      alt: 'Rueda de carta natal luminosa con planetas y glifos zodiacales en finas líneas doradas',
    },
  },
  [ArticleCategory.GUIDE_RITUAL]: {
    chip: 'Rituales',
    image: {
      src: `${IMAGE_BASE}/guia-rituales-hero.webp`,
      alt: 'Altar místico con velas encendidas, cristales y hierbas en una atmósfera ritual',
    },
  },
  [ArticleCategory.GUIDE_HOROSCOPE]: {
    chip: 'Horóscopo',
    image: {
      src: `${IMAGE_BASE}/guia-horoscopo-hero.webp`,
      alt: 'Rueda zodiacal completa con los doce glifos brillando y finas líneas de constelaciones',
    },
  },
  [ArticleCategory.GUIDE_CHINESE]: {
    chip: 'Horóscopo Chino',
    image: {
      src: `${IMAGE_BASE}/guia-horoscopo-chino-hero.webp`,
      alt: 'Los doce animales del zodíaco chino en finas líneas doradas dispuestos en círculo luminoso',
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGuideTheme(category: ArticleCategory): GuideTheme {
  return GUIDE_THEME[category] ?? { chip: 'Guía' };
}

/**
 * Resolves the thumbnail for an article: prefers a backend-provided `imageUrl`
 * (future-proof), then the category theme asset, otherwise `null` (fallback).
 */
export function resolveThumbnail(
  article: ArticleSummary,
  theme: GuideTheme
): GuideTheme['image'] | null {
  if (article.imageUrl) {
    return { src: article.imageUrl, alt: `Imagen ilustrativa de ${article.nameEs}` };
  }
  return theme.image ?? null;
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

interface GuiaCardProps {
  article: ArticleSummary;
}

/**
 * GuiaCard
 *
 * Editorial card for a guide: themed thumbnail (or brand gradient fallback) with
 * a gold category chip, Cormorant title, 2-line snippet and a "Leer guía →" CTA.
 * Hover triggers a coherent micro-interaction (lift + gold border + image zoom).
 */
export function GuiaCard({ article }: GuiaCardProps) {
  const theme = getGuideTheme(article.category);
  const image = resolveThumbnail(article, theme);

  return (
    <Link
      href={ROUTES.ENCICLOPEDIA_GUIA(article.slug)}
      className="group border-border bg-card hover:border-secondary focus-visible:ring-secondary focus-visible:ring-offset-background relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgba(214,158,46,0.45)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            data-testid="guia-thumb-fallback"
            className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-105"
            style={{ background: THUMB_FALLBACK_GRADIENT }}
            aria-hidden="true"
          >
            <span className="font-serif text-5xl" style={{ color: 'rgba(214, 158, 46, 0.55)' }}>
              ✦
            </span>
          </div>
        )}

        {/* Overlay de legibilidad */}
        <div
          className="absolute inset-0"
          style={{ background: THUMB_OVERLAY }}
          aria-hidden="true"
        />

        {/* Chip de categoría dorado — texto noche profunda para contraste AA */}
        <span
          data-testid="guia-category-chip"
          className="bg-secondary text-bg-hero absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold tracking-[0.08em] uppercase"
        >
          {theme.chip}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-xl font-semibold">{article.nameEs}</h3>
        {article.snippet && (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
            {article.snippet}
          </p>
        )}
        <span
          className="text-secondary mt-4 inline-flex items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        >
          Leer guía →
        </span>
      </div>
    </Link>
  );
}

function CategorySection({
  category,
  categoryIndex,
}: {
  category: ArticleCategory;
  categoryIndex: number;
}) {
  const { data: articles } = useArticlesByCategory(category);
  return (
    <>
      {(articles ?? []).map((article, articleIndex) => (
        <Reveal key={article.id} index={categoryIndex + articleIndex} className="h-full">
          <GuiaCard article={article} />
        </Reveal>
      ))}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * GuiasContent
 *
 * Listado editorial de las 7 guías prácticas. Muestra una banda de cabecera con
 * identidad de marca (gradiente noche + título Cormorant + filete dorado) y una
 * grilla de tarjetas editoriales (thumbnail temático, chip de categoría dorado,
 * título Cormorant, snippet y CTA), reemplazando las filas planas previas
 * (T-ENC-006 / hallazgo ENC-005). Usa una llamada al hook por categoría.
 */
export function GuiasContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banda de cabecera con identidad de marca */}
      <header
        data-testid="guias-hero"
        className="relative mb-8 overflow-hidden rounded-2xl"
        style={{ background: HERO_GRADIENT }}
      >
        <div className="relative z-10 px-6 py-10 text-center sm:px-10 sm:py-12">
          <h1
            className="font-serif text-3xl leading-tight font-bold sm:text-4xl"
            style={{ color: CREAM }}
          >
            Guías
          </h1>
          <p
            className="mx-auto mt-3 max-w-xl text-base leading-relaxed"
            style={{ color: CREAM_MUTED }}
          >
            Aprende con nuestras guías prácticas sobre espiritualidad y esoterismo.
          </p>
        </div>

        {/* Filete dorado inferior */}
        <div
          className="absolute inset-x-0 bottom-0 h-0.5"
          style={{ background: GOLD_FILLET }}
          aria-hidden="true"
        />
      </header>

      {/* Grid de tarjetas — reveal fade-up escalonado al entrar en viewport */}
      <div className="grid gap-6 md:grid-cols-2">
        {GUIDE_CATEGORIES.map((category, categoryIndex) => (
          <CategorySection key={category} category={category} categoryIndex={categoryIndex} />
        ))}
      </div>
    </div>
  );
}
