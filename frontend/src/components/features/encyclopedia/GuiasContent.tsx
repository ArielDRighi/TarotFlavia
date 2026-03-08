'use client';

import Link from 'next/link';

import { useArticlesByCategory } from '@/hooks/api/useEncyclopediaArticles';
import { ROUTES } from '@/lib/constants/routes';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const GUIDE_CATEGORIES: ArticleCategory[] = [
  ArticleCategory.GUIDE_NUMEROLOGY,
  ArticleCategory.GUIDE_PENDULUM,
  ArticleCategory.GUIDE_BIRTH_CHART,
  ArticleCategory.GUIDE_RITUAL,
  ArticleCategory.GUIDE_HOROSCOPE,
  ArticleCategory.GUIDE_CHINESE,
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface GuiaItemProps {
  article: ArticleSummary;
}

function GuiaItem({ article }: GuiaItemProps) {
  return (
    <Link
      href={ROUTES.ENCICLOPEDIA_GUIA(article.slug)}
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CategorySection({ category }: { category: ArticleCategory }) {
  const { data: articles } = useArticlesByCategory(category);
  return (
    <>
      {(articles ?? []).map((article) => (
        <GuiaItem key={article.id} article={article} />
      ))}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * GuiasContent
 *
 * Fetches and renders all guide articles across the 6 guide categories.
 * Uses one hook call per category (as per the API design).
 */
export function GuiasContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold">Guías</h1>
        <p className="text-muted-foreground">
          Aprende con nuestras guías prácticas sobre espiritualidad y esoterismo.
        </p>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {GUIDE_CATEGORIES.map((category) => (
          <CategorySection key={category} category={category} />
        ))}
      </div>
    </div>
  );
}
