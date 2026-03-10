import type { Metadata } from 'next';

import { getArticle, getArticlesByCategory } from '@/lib/api/encyclopedia-articles-api';
import { getArticleMetadata } from '@/lib/metadata/seo';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import { ArticleDetailPageContent } from '@/components/features/encyclopedia/ArticleDetailPageContent';

/**
 * Elemento / Modalidad Detail Page
 *
 * Route: /enciclopedia/elementos/[slug]
 */

const ELEMENT_CATEGORIES = [ArticleCategory.ELEMENT, ArticleCategory.MODALITY] as const;

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
      ELEMENT_CATEGORIES.map((category) => getArticlesByCategory(category))
    );
    return results.flat().map((article) => ({ slug: article.slug }));
  } catch {
    return [];
  }
}

export default function ElementoDetailPage() {
  return <ArticleDetailPageContent />;
}
