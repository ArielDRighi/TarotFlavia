import type { Metadata } from 'next';

import { getArticle, getArticlesByCategory } from '@/lib/api/encyclopedia-articles-api';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import { ArticleDetailPageContent } from '@/components/features/encyclopedia/ArticleDetailPageContent';

/**
 * Signo Zodiacal Detail Page
 *
 * Route: /enciclopedia/astrologia/signos/[slug]
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await getArticle(slug);
    return {
      title: `${article.nameEs} | Enciclopedia Mística`,
      description: article.snippet,
      openGraph: {
        title: `${article.nameEs} | Enciclopedia Mística`,
        description: article.snippet,
        type: 'article',
      },
    };
  } catch {
    return {};
  }
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const articles = await getArticlesByCategory(ArticleCategory.ZODIAC_SIGN);
    return articles.map((article) => ({ slug: article.slug }));
  } catch {
    return [];
  }
}

export default function SignoDetailPage() {
  return <ArticleDetailPageContent />;
}
