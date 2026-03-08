'use client';

import Link from 'next/link';

import { ArticleCategory, ARTICLE_CATEGORY_LABELS } from '@/types/encyclopedia-article.types';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<ArticleCategory, string> = {
  [ArticleCategory.ZODIAC_SIGN]: '♈',
  [ArticleCategory.PLANET]: '🪐',
  [ArticleCategory.ASTROLOGICAL_HOUSE]: '🏠',
  [ArticleCategory.ELEMENT]: '🔥',
  [ArticleCategory.MODALITY]: '⟳',
  [ArticleCategory.GUIDE_NUMEROLOGY]: '🔢',
  [ArticleCategory.GUIDE_PENDULUM]: '⚖️',
  [ArticleCategory.GUIDE_BIRTH_CHART]: '🌟',
  [ArticleCategory.GUIDE_RITUAL]: '🕯️',
  [ArticleCategory.GUIDE_HOROSCOPE]: '♏',
  [ArticleCategory.GUIDE_CHINESE]: '🐉',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArticleCardProps {
  /** Article summary data to display */
  article: ArticleSummary;
  /** Additional CSS classes */
  className?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ArticleCard Component
 *
 * Adaptive card that renders different content depending on the article category.
 * Supports zodiac signs, planets, astrological houses, elements, modalities, and guides.
 *
 * @example
 * ```tsx
 * <ArticleCard article={articleSummary} />
 * ```
 */
export function ArticleCard({ article, className }: ArticleCardProps) {
  const icon = CATEGORY_ICONS[article.category];
  const categoryLabel = ARTICLE_CATEGORY_LABELS[article.category];

  return (
    <Link
      href={`/enciclopedia/${article.slug}`}
      data-testid="article-card"
      className={cn(
        'bg-card hover:bg-accent group flex flex-col gap-2 rounded-lg border p-4 transition-colors',
        className
      )}
    >
      {/* Icon */}
      <div className="text-2xl" aria-hidden="true">
        {icon}
      </div>

      {/* Name */}
      <h3 className="text-foreground leading-tight font-semibold">{article.nameEs}</h3>

      {/* Category badge */}
      <span
        data-testid="article-card-category"
        className="text-muted-foreground w-fit rounded-full border px-2 py-0.5 text-xs"
      >
        {categoryLabel}
      </span>

      {/* Snippet */}
      {article.snippet && (
        <p className="text-muted-foreground line-clamp-2 text-sm">{article.snippet}</p>
      )}
    </Link>
  );
}
