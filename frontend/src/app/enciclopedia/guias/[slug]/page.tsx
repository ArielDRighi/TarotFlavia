import type { Metadata } from 'next';

import { getArticle, getArticlesByCategory } from '@/lib/api/encyclopedia-articles-api';
import { getArticleMetadata } from '@/lib/metadata/seo';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import { ArticleDetailPageContent } from '@/components/features/encyclopedia/ArticleDetailPageContent';

/**
 * Guía Detail Page
 *
 * Route: /enciclopedia/guias/[slug]
 */

const GUIDE_CATEGORIES = [
  ArticleCategory.GUIDE_NUMEROLOGY,
  ArticleCategory.GUIDE_PENDULUM,
  ArticleCategory.GUIDE_BIRTH_CHART,
  ArticleCategory.GUIDE_RITUAL,
  ArticleCategory.GUIDE_HOROSCOPE,
  ArticleCategory.GUIDE_CHINESE,
] as const;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await getArticle(slug);
    return getArticleMetadata(article);
  } catch {
    return {};
  }
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const results = await Promise.all(
      GUIDE_CATEGORIES.map((category) => getArticlesByCategory(category))
    );
    return results.flat().map((article) => ({ slug: article.slug }));
  } catch {
    return [];
  }
}

export default function GuiaDetailPage() {
  return <ArticleDetailPageContent />;
}
