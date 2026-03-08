import type { Metadata } from 'next';

import { getArticle, getArticlesByCategory } from '@/lib/api/encyclopedia-articles-api';
import { getArticleMetadata } from '@/lib/metadata/seo';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import { ArticleDetailPageContent } from '@/components/features/encyclopedia/ArticleDetailPageContent';

/**
 * Casa Astral Detail Page
 *
 * Route: /enciclopedia/astrologia/casas/[slug]
 */

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
    const articles = await getArticlesByCategory(ArticleCategory.ASTROLOGICAL_HOUSE);
    return articles.map((article) => ({ slug: article.slug }));
  } catch {
    return [];
  }
}

export default function CasaDetailPage() {
  return <ArticleDetailPageContent />;
}
