'use client';

import Link from 'next/link';

import { ArticleHero } from './ArticleHero';
import { useArticlesByCategory } from '@/hooks/api/useEncyclopediaArticles';
import { Skeleton } from '@/components/ui/skeleton';
import { getAstroCategoryHero, isAstroCategory } from '@/lib/data/encyclopedia-editorial.data';
import { ArticleCategory, ARTICLE_CATEGORY_LABELS } from '@/types/encyclopedia-article.types';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArticleListPageContentProps {
  /** Category to list */
  category: ArticleCategory;
  /** Page title */
  title: string;
  /** Page subtitle */
  subtitle: string;
  /** Base path for detail URLs — slug will be appended: `${detailHrefPrefix}/${slug}` */
  detailHrefPrefix: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ArticleListItemProps {
  article: ArticleSummary;
  detailHref: string;
}

function ArticleListItem({ article, detailHref }: ArticleListItemProps) {
  return (
    <Link
      href={detailHref}
      className="bg-card hover:bg-accent flex items-center justify-between rounded-lg border p-4 transition-colors"
    >
      <div>
        <h3 className="font-medium">{article.nameEs}</h3>
        {article.snippet && (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{article.snippet}</p>
        )}
      </div>
      <span className="text-muted-foreground ml-4 shrink-0 text-sm">→</span>
    </Link>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ArticleListPageContent
 *
 * Shared client component for article list pages (signos, planetas, casas).
 * Fetches articles by category and renders a navigable list. For astrology
 * categories, renders a themed hero band above the list using the category's
 * generic image; for other categories, falls back to a plain text header.
 */
export function ArticleListPageContent({
  category,
  title,
  subtitle,
  detailHrefPrefix,
}: ArticleListPageContentProps) {
  const { data: articles, isLoading } = useArticlesByCategory(category);

  const isAstro = isAstroCategory(category);
  const heroImage = isAstro ? getAstroCategoryHero(category) : undefined;

  return (
    <div data-testid="article-list-page">
      {/* Banda hero temática para categorías de astrología */}
      {isAstro ? (
        <ArticleHero
          category={ARTICLE_CATEGORY_LABELS[category]}
          title={title}
          lead={subtitle}
          image={heroImage}
        />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 font-serif text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      )}

      {/* Lista de artículos */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {(articles ?? []).map((article) => (
              <ArticleListItem
                key={article.id}
                article={article}
                detailHref={`${detailHrefPrefix}/${article.slug}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
