'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ArticleCategory, ARTICLE_CATEGORY_LABELS } from '@/types/encyclopedia-article.types';
import type { ArticleSnippet } from '@/types/encyclopedia-article.types';
import { cn } from '@/lib/utils';
import { getArticlePath } from '@/lib/constants/article-routes';

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
  [ArticleCategory.GUIDE_TAROT]: '🃏',
};

/** Sombra de legibilidad sobre la miniatura (misma que `GuiaCard`). */
const THUMBNAIL_OVERLAY =
  'linear-gradient(180deg, rgba(26, 10, 46, 0) 35%, rgba(26, 10, 46, 0.45) 100%)';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Lo que la tarjeta necesita del artículo. Sin `id`: así la portada puede
 * renderizar el catálogo estático de guías (`guides-catalog.data.ts`), que no
 * tiene ids de base de datos, con la misma tarjeta (T-SEO-022).
 */
export type ArticleCardData = Omit<ArticleSnippet, 'id'>;

export interface ArticleCardProps {
  /** Article summary data to display */
  article: ArticleCardData;
  /**
   * Miniatura decorativa (16:9) en lugar del icono de categoría. Diferida:
   * la portada la usa por debajo del pliegue (T-SEO-022).
   */
  thumbnailSrc?: string;
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
export function ArticleCard({ article, thumbnailSrc, className }: ArticleCardProps) {
  const icon = CATEGORY_ICONS[article.category];
  const categoryLabel = ARTICLE_CATEGORY_LABELS[article.category];

  return (
    <Link
      href={getArticlePath(article.category, article.slug)}
      data-testid="article-card"
      className={cn(
        'bg-card hover:bg-accent hover:border-secondary group flex flex-col gap-2 overflow-hidden rounded-lg border transition-colors',
        thumbnailSrc ? 'pb-4' : 'p-4',
        className
      )}
    >
      {thumbnailSrc ? (
        /* Miniatura: alto reservado por el aspect-ratio, sin CLS */
        <div className="relative -mb-1 aspect-[16/9] w-full overflow-hidden">
          <Image
            data-testid="article-card-thumbnail"
            src={thumbnailSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0"
            style={{ background: THUMBNAIL_OVERLAY }}
            aria-hidden="true"
          />
        </div>
      ) : (
        /* Icon */
        <div data-testid="article-card-icon" className="text-2xl" aria-hidden="true">
          {icon}
        </div>
      )}

      <div className={cn('flex flex-col gap-2', thumbnailSrc && 'px-4 pt-3')}>
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
      </div>
    </Link>
  );
}
