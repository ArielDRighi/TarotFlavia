import type { Metadata } from 'next';

import { getArticle, getArticlesByCategory } from '@/lib/api/encyclopedia-articles-api';
import { getArticleMetadata } from '@/lib/metadata/seo';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import { ArticleDetailPageContent } from '@/components/features/encyclopedia/ArticleDetailPageContent';

/**
 * Planeta Detail Page
 *
 * Route: /enciclopedia/astrologia/planetas/[slug]
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
    const articles = await getArticlesByCategory(ArticleCategory.PLANET);
    return articles.map((article) => ({ slug: article.slug }));
  } catch {
    return [];
  }
}

export default function PlanetaDetailPage() {
  return <ArticleDetailPageContent />;
}
