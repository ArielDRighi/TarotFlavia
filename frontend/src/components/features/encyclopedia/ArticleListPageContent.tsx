'use client';

import Link from 'next/link';

import { useArticlesByCategory } from '@/hooks/api/useEncyclopediaArticles';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
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
 * Shared client component for article list pages (signos, planetas, casas,
 * guías). Fetches articles by category and renders a navigable list.
 */
export function ArticleListPageContent({
  category,
  title,
  subtitle,
  detailHrefPrefix,
}: ArticleListPageContentProps) {
  const { data: articles, isLoading } = useArticlesByCategory(category);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
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
  );
}
