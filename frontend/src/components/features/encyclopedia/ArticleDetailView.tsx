'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import { ArticleHero } from './ArticleHero';
import { ArticleToc } from './ArticleToc';
import { MarkdownArticle } from './MarkdownArticle';
import { RelatedTarotCards } from './RelatedTarotCards';
import { Reveal } from './Reveal';
import { ROUTES } from '@/lib/constants/routes';
import { getArticleEditorial } from '@/lib/data/encyclopedia-editorial.data';
import { ArticleCategory, ARTICLE_CATEGORY_LABELS } from '@/types/encyclopedia-article.types';
import type { ArticleDetail, ArticleSummary } from '@/types/encyclopedia-article.types';
import { cn } from '@/lib/utils';
import {
  extractArticleHeadings,
  getArticleReadingMeta,
  stripLeadingMarkdownHeading,
} from '@/lib/utils/text';

// ─── Constants ────────────────────────────────────────────────────────────────

interface GuideCta {
  label: string;
  href: string;
}

/**
 * Maps guide categories to their corresponding CTA.
 * Single source of truth: a category is a guide if and only if it has an entry here.
 */
const GUIDE_CTA_MAP: Partial<Record<ArticleCategory, GuideCta>> = {
  [ArticleCategory.GUIDE_NUMEROLOGY]: {
    label: 'Calcular mi Numerología',
    href: ROUTES.NUMEROLOGIA,
  },
  [ArticleCategory.GUIDE_PENDULUM]: {
    label: 'Usar el Péndulo Digital',
    href: ROUTES.PENDULO,
  },
  [ArticleCategory.GUIDE_BIRTH_CHART]: {
    label: 'Generar mi Carta Astral',
    href: ROUTES.CARTA_ASTRAL,
  },
  [ArticleCategory.GUIDE_RITUAL]: {
    label: 'Explorar Rituales',
    href: ROUTES.RITUALES,
  },
  [ArticleCategory.GUIDE_HOROSCOPE]: {
    label: 'Ver mi Horóscopo',
    href: ROUTES.HOROSCOPO,
  },
  [ArticleCategory.GUIDE_CHINESE]: {
    label: 'Ver mi Horóscopo Chino',
    href: ROUTES.HOROSCOPO_CHINO,
  },
};

/**
 * Whether a category is one of the activity guides (`guide_*`). Drives the
 * editorial template (hero + editorial Markdown), independent of whether the
 * guide has a module CTA configured above.
 */
function isGuideCategory(category: ArticleCategory): boolean {
  return category.startsWith('guide_');
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArticleDetailViewProps {
  /** Full article data to display */
  article: ArticleDetail;
  /** Additional CSS classes */
  className?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RelatedArticleItemProps {
  article: ArticleSummary;
}

/**
 * Resolves the correct encyclopedia route for an article based on its category.
 */
function getArticleRoute(article: ArticleSummary): string {
  switch (article.category) {
    case ArticleCategory.ZODIAC_SIGN:
      return ROUTES.ENCICLOPEDIA_SIGNO(article.slug);
    case ArticleCategory.PLANET:
      return ROUTES.ENCICLOPEDIA_PLANETA(article.slug);
    case ArticleCategory.ASTROLOGICAL_HOUSE:
      return ROUTES.ENCICLOPEDIA_CASA(article.slug);
    case ArticleCategory.ELEMENT:
    case ArticleCategory.MODALITY:
      return ROUTES.ENCICLOPEDIA_ELEMENTO(article.slug);
    default:
      return ROUTES.ENCICLOPEDIA_GUIA(article.slug);
  }
}

function RelatedArticleItem({ article }: RelatedArticleItemProps) {
  return (
    <Link
      href={getArticleRoute(article)}
      data-testid="related-article-item"
      className="bg-card hover:bg-accent flex items-center gap-3 rounded-lg border p-3 transition-colors"
    >
      <span className="text-foreground font-medium">{article.nameEs}</span>
      <span className="text-muted-foreground ml-auto text-xs">
        {ARTICLE_CATEGORY_LABELS[article.category]}
      </span>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ArticleDetailView Component
 *
 * Full detail view for an encyclopedia article. Renders the article's Markdown
 * content using react-markdown with GFM support, related tarot cards, related
 * articles, and a CTA button for guide articles.
 *
 * @example
 * ```tsx
 * <ArticleDetailView article={articleDetail} />
 * ```
 */
export function ArticleDetailView({ article, className }: ArticleDetailViewProps) {
  const categoryLabel = ARTICLE_CATEGORY_LABELS[article.category];
  const cta = GUIDE_CTA_MAP[article.category];
  const isGuide = isGuideCategory(article.category);
  const editorial = getArticleEditorial(article.slug);
  const readingMeta = getArticleReadingMeta(article.content);
  // Memoized so the array identity is stable across re-renders: ArticleToc keys
  // its IntersectionObserver effect on `headings`, so a fresh array each render
  // would tear down and rebuild the observer needlessly.
  const headings = useMemo(
    () => (isGuide ? extractArticleHeadings(article.content) : []),
    [isGuide, article.content]
  );
  const hasToc = headings.length > 0;
  const hasRelatedTarotCards =
    article.relatedTarotCards !== null && article.relatedTarotCards.length > 0;
  const hasRelatedArticles = article.relatedArticles.length > 0;

  // Reading column body — shared between the guide layout (centered column with a
  // lateral TOC) and the simple layout (signs, planets, …) so it stays DRY.
  const articleBody = (
    <>
      {/* Contenido Markdown — se elimina el título `#` inicial para no duplicar
          el <h1> de la página (ya renderizado en el hero/cabecera). En guías se
          activa el modo editorial (drop-cap, badges numerados, ✦, imágenes y
          callouts por sección modelados como datos). */}
      <MarkdownArticle
        content={stripLeadingMarkdownHeading(article.content)}
        editorial={isGuide}
        sections={editorial?.sections}
        className={cn(isGuide && 'max-w-none')}
      />

      {/* Cartas de tarot relacionadas — RelatedTarotCards renderiza la sección
          completa (título incluido) o nada si ningún ID resuelve. Las secciones
          complementarias se revelan con un fade-up escalonado al hacer scroll. */}
      {hasRelatedTarotCards && (
        <Reveal index={0}>
          <RelatedTarotCards cardIds={article.relatedTarotCards!} />
        </Reveal>
      )}

      {/* Artículos relacionados */}
      {hasRelatedArticles && (
        <Reveal index={1}>
          <section data-testid="related-articles" className="space-y-4">
            <h2 className="text-foreground text-xl font-bold">Artículos Relacionados</h2>
            <div className="flex flex-col gap-3">
              {article.relatedArticles.map((relatedArticle) => (
                <RelatedArticleItem key={relatedArticle.id} article={relatedArticle} />
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* CTA al módulo correspondiente (guías con herramienta asociada) */}
      {cta && (
        <Reveal index={2}>
          <div className="border-t pt-6">
            <Link
              data-testid="article-cta"
              href={cta.href}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-lg px-6 py-3 font-semibold transition-colors"
            >
              {cta.label}
            </Link>
          </div>
        </Reveal>
      )}
    </>
  );

  return (
    <div data-testid="article-detail-view" className={cn('space-y-8', className)}>
      {isGuide ? (
        /* Guías: plantilla editorial con hero inmersivo (imagen opcional) */
        <ArticleHero
          category={categoryLabel}
          title={article.nameEs}
          lead={article.snippet}
          image={editorial?.hero}
          readingTimeMinutes={readingMeta.readingTimeMinutes}
          sectionCount={readingMeta.sectionCount}
        />
      ) : (
        /* Resto de artículos (signos, planetas, etc.): cabecera simple existente */
        <>
          {/* Breadcrumb de navegación */}
          <nav aria-label="Navegación" className="flex items-center gap-2 text-sm">
            <Link
              data-testid="breadcrumb-enciclopedia"
              href={ROUTES.ENCICLOPEDIA}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Enciclopedia
            </Link>
            <span className="text-muted-foreground" aria-hidden="true">
              /
            </span>
            <span
              data-testid="breadcrumb-current"
              className="text-foreground font-medium"
              aria-current="page"
            >
              {article.nameEs}
            </span>
          </nav>

          {/* Header: nombre del artículo + badge de categoría */}
          <div className="space-y-3">
            <h1 className="font-serif text-4xl font-bold">{article.nameEs}</h1>
            <span
              data-testid="article-category-badge"
              className="bg-secondary text-secondary-foreground inline-block rounded-full px-3 py-1 text-sm font-medium"
            >
              {categoryLabel}
            </span>
            {article.snippet && <p className="text-muted-foreground text-lg">{article.snippet}</p>}
          </div>
        </>
      )}

      {/* Columna de lectura. En guías con secciones se acompaña de un índice (TOC)
          lateral en desktop / colapsable en mobile; el hero va a ancho completo
          arriba. El resto de artículos conserva su flujo simple. */}
      {isGuide ? (
        <div className="lg:flex lg:items-start lg:justify-center lg:gap-10">
          {hasToc && (
            <ArticleToc
              headings={headings}
              className="mb-8 lg:order-2 lg:mb-0 lg:w-60 lg:shrink-0"
            />
          )}
          <div className="mx-auto w-full max-w-[68ch] space-y-8 lg:order-1 lg:mx-0">
            {articleBody}
          </div>
        </div>
      ) : (
        <div className="space-y-8">{articleBody}</div>
      )}
    </div>
  );
}
