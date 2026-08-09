import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ArticleDetailPageContent } from './ArticleDetailPageContent';
import type { ArticleDetail } from '@/types/encyclopedia-article.types';

/**
 * Guardarraíl T-PROD-024.
 *
 * Este componente sirve las **53 fichas de artículo** de la enciclopedia (signos,
 * planetas, casas, guías y elementos): el contenido editorial más valioso del
 * sitio. Traía el artículo por el cliente, así que el HTML que recibía Googlebot
 * era el skeleton. Medido en producción tras el deploy de T-PROD-022:
 *
 *     /enciclopedia/astrologia/signos/geminis   → 5 palabras propias
 *     /enciclopedia/guias/guia-pendulo          → 7 palabras propias
 *
 * La ruta ahora resuelve el artículo en el servidor y lo pasa por `initialArticle`,
 * el mismo patrón ya probado en producción con la ficha de tarot (T-PROD-020),
 * que sirve entre 126 y 233 palabras.
 */

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockUseArticle = vi.fn();

vi.mock('@/hooks/api/useEncyclopediaArticles', () => ({
  useArticle: (slug: string, initialData?: ArticleDetail) => mockUseArticle(slug, initialData),
}));

vi.mock('@/components/features/encyclopedia/ArticleDetailView', () => ({
  ArticleDetailView: ({ article }: { article: { nameEs: string; content: string } }) => (
    <article data-testid="article-detail-view">
      <h1>{article.nameEs}</h1>
      <div>{article.content}</div>
    </article>
  ),
}));

const article = {
  id: 1,
  slug: 'geminis',
  nameEs: 'Géminis',
  content: 'Géminis es un signo de aire regido por Mercurio, curioso y comunicativo.',
} as ArticleDetail;

describe('ArticleDetailPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('⚠️ T-PROD-024: siembra la query con el artículo resuelto en el servidor', () => {
    mockUseArticle.mockReturnValue({ data: article, isLoading: false, error: null });

    render(<ArticleDetailPageContent slug="geminis" initialArticle={article} />);

    expect(mockUseArticle).toHaveBeenCalledWith('geminis', article);
  });

  it('⚠️ T-PROD-024: emite el contenido del artículo, no un skeleton', () => {
    mockUseArticle.mockReturnValue({ data: article, isLoading: false, error: null });

    render(<ArticleDetailPageContent slug="geminis" initialArticle={article} />);

    expect(screen.getByTestId('article-detail-view')).toBeInTheDocument();
    expect(screen.getByText(/regido por Mercurio/)).toBeInTheDocument();
  });

  it('muestra el skeleton solo mientras carga', () => {
    mockUseArticle.mockReturnValue({ data: undefined, isLoading: true, error: null });

    render(<ArticleDetailPageContent slug="geminis" initialArticle={article} />);

    expect(screen.queryByTestId('article-detail-view')).not.toBeInTheDocument();
  });

  it('muestra el mensaje de no encontrado cuando no hay artículo', () => {
    mockUseArticle.mockReturnValue({ data: undefined, isLoading: false, error: null });

    render(<ArticleDetailPageContent slug="geminis" initialArticle={article} />);

    expect(screen.getByText('Artículo no encontrado')).toBeInTheDocument();
  });

  it('mantiene el artículo visible si falla un refetch en background', () => {
    // Mismo criterio que `CardDetailPageContent`: en React Query v5 un refetch
    // fallido puebla `error` conservando el `data` bueno.
    mockUseArticle.mockReturnValue({
      data: article,
      isLoading: false,
      error: new Error('Network'),
    });

    render(<ArticleDetailPageContent slug="geminis" initialArticle={article} />);

    expect(screen.getByTestId('article-detail-view')).toBeInTheDocument();
  });
});
