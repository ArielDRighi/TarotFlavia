'use client';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { ROUTES } from '@/lib/constants/routes';
import { ArticleCategory, ARTICLE_CATEGORY_LABELS } from '@/types/encyclopedia-article.types';
import type { ArticleDetail, ArticleSummary } from '@/types/encyclopedia-article.types';
import { cn } from '@/lib/utils';

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
  const isGuide = cta !== undefined;
  const hasRelatedTarotCards =
    article.relatedTarotCards !== null && article.relatedTarotCards.length > 0;
  const hasRelatedArticles = article.relatedArticles.length > 0;

  return (
    <div data-testid="article-detail-view" className={cn('space-y-8', className)}>
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

      {/* Contenido Markdown */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
      </div>

      {/* Cartas de tarot relacionadas */}
      {hasRelatedTarotCards && (
        <section data-testid="related-tarot-cards" className="space-y-4">
          <h2 className="text-foreground text-xl font-bold">Cartas de Tarot Relacionadas</h2>
          <div className="flex flex-wrap gap-2">
            {article.relatedTarotCards!.map((cardId) => (
              <span
                key={cardId}
                className="bg-muted text-muted-foreground rounded-md px-3 py-1 text-sm"
              >
                #{cardId}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Artículos relacionados */}
      {hasRelatedArticles && (
        <section data-testid="related-articles" className="space-y-4">
          <h2 className="text-foreground text-xl font-bold">Artículos Relacionados</h2>
          <div className="flex flex-col gap-3">
            {article.relatedArticles.map((relatedArticle) => (
              <RelatedArticleItem key={relatedArticle.id} article={relatedArticle} />
            ))}
          </div>
        </section>
      )}

      {/* CTA al módulo correspondiente (solo guías) */}
      {isGuide && cta && (
        <div className="border-t pt-6">
          <Link
            data-testid="article-cta"
            href={cta.href}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-lg px-6 py-3 font-semibold transition-colors"
          >
            {cta.label}
          </Link>
        </div>
      )}
    </div>
  );
}
