import Image from 'next/image';
import Link from 'next/link';

import { BrandIcon } from '@/components/ui/brand-icon';

import { ArticleCategory, ARTICLE_CATEGORY_LABELS } from '@/types/encyclopedia-article.types';
import type { ArticleSnippet } from '@/types/encyclopedia-article.types';
import { cn } from '@/lib/utils';
import { getArticlePath } from '@/lib/constants/article-routes';
import type { BrandIconName } from '@/lib/constants/brand-icons';

// ─── Constants ────────────────────────────────────────────────────────────────

type CategoryIcon =
  | { family: 'hubs'; name: BrandIconName<'hubs'> }
  | { family: 'elements'; name: BrandIconName<'elements'> };

/** Icono de marca por categoría (T-UI-12). Modalidad usa la rueda zodiacal: no tiene asset propio. */
const CATEGORY_ICONS: Record<ArticleCategory, CategoryIcon> = {
  [ArticleCategory.ZODIAC_SIGN]: { family: 'hubs', name: 'horoscope' },
  [ArticleCategory.PLANET]: { family: 'hubs', name: 'planets' },
  [ArticleCategory.ASTROLOGICAL_HOUSE]: { family: 'hubs', name: 'houses' },
  [ArticleCategory.ELEMENT]: { family: 'elements', name: 'fire' },
  [ArticleCategory.MODALITY]: { family: 'hubs', name: 'horoscope' },
  [ArticleCategory.GUIDE_NUMEROLOGY]: { family: 'hubs', name: 'numerology' },
  [ArticleCategory.GUIDE_PENDULUM]: { family: 'hubs', name: 'pendulum' },
  [ArticleCategory.GUIDE_BIRTH_CHART]: { family: 'hubs', name: 'birth-chart' },
  [ArticleCategory.GUIDE_RITUAL]: { family: 'hubs', name: 'rituals' },
  [ArticleCategory.GUIDE_HOROSCOPE]: { family: 'hubs', name: 'horoscope' },
  [ArticleCategory.GUIDE_CHINESE]: { family: 'hubs', name: 'chinese' },
  [ArticleCategory.GUIDE_TAROT]: { family: 'hubs', name: 'tarot' },
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
 * Sin `'use client'` a propósito: no usa hooks, y la portada (Server
 * Component) la renderiza para las siete guías del catálogo; con la directiva
 * viajarían en el HTML y otra vez en el payload RSC (T-SEO-022).
 *
 * @example
 * ```tsx
 * <ArticleCard article={articleSummary} />
 * ```
 */
/** Un `<BrandIcon>` por familia: el genérico no acepta la unión discriminada de golpe. */
function CategoryBrandIcon({ icon }: { icon: CategoryIcon }) {
  const shared = { size: 'md', frame: 'medallion', decorative: true } as const;
  return icon.family === 'hubs' ? (
    <BrandIcon family="hubs" name={icon.name} {...shared} data-testid="article-card-icon" />
  ) : (
    <BrandIcon family="elements" name={icon.name} {...shared} data-testid="article-card-icon" />
  );
}

export function ArticleCard({ article, thumbnailSrc, className }: ArticleCardProps) {
  const icon = CATEGORY_ICONS[article.category];
  const categoryLabel = ARTICLE_CATEGORY_LABELS[article.category];

  return (
    <Link
      href={getArticlePath(article.category, article.slug)}
      data-testid="article-card"
      className={cn(
        'bg-card hover:bg-accent group flex flex-col rounded-lg border transition-colors',
        thumbnailSrc ? 'hover:border-secondary overflow-hidden pb-4' : 'gap-2 p-4',
        className
      )}
    >
      {thumbnailSrc ? (
        /* Miniatura: alto reservado por el aspect-ratio, sin CLS */
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            data-testid="article-card-thumbnail"
            src={thumbnailSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
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
        <CategoryBrandIcon icon={icon} />
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
