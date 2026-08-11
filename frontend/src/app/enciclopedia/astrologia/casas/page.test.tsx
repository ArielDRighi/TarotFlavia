import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import CasasPage from './page';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    'data-testid': dataTestId,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    'data-testid'?: string;
  } & Record<string, unknown>) => (
    <a href={href} data-testid={dataTestId} {...rest}>
      {children}
    </a>
  ),
}));

const mockUseArticlesByCategory = vi.fn();

vi.mock('@/hooks/api/useEncyclopediaArticles', () => ({
  useArticlesByCategory: (category: ArticleCategory, initialData?: ArticleSummary[]) =>
    mockUseArticlesByCategory(category, initialData),
}));

const mockGetArticlesByCategory = vi.fn();

vi.mock('@/lib/api/encyclopedia-articles-api', () => ({
  getArticlesByCategory: (category: ArticleCategory) => mockGetArticlesByCategory(category),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function buildArticle(id: number, slug: string, nameEs: string): ArticleSummary {
  return {
    id,
    slug,
    nameEs,
    category: ArticleCategory.ASTROLOGICAL_HOUSE,
    snippet: `Descripción de ${nameEs}`,
    imageUrl: null,
    sortOrder: id,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CasasPage (/enciclopedia/astrologia/casas)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetArticlesByCategory.mockResolvedValue([]);
  });

  it('debe mostrar el listado de casas cuando hay datos', async () => {
    const casas = [
      buildArticle(1, 'primera-casa', 'Primera Casa'),
      buildArticle(2, 'segunda-casa', 'Segunda Casa'),
    ];
    mockUseArticlesByCategory.mockReturnValue({ data: casas, isLoading: false, error: null });

    renderWithProviders(await CasasPage());

    expect(screen.getByText('Primera Casa')).toBeInTheDocument();
    expect(screen.getByText('Segunda Casa')).toBeInTheDocument();
  });

  it('links de casas deben apuntar a la ruta correcta', async () => {
    const casas = [buildArticle(1, 'primera-casa', 'Primera Casa')];
    mockUseArticlesByCategory.mockReturnValue({ data: casas, isLoading: false, error: null });

    renderWithProviders(await CasasPage());

    const link = screen.getByRole('link', { name: /primera casa/i });
    expect(link).toHaveAttribute('href', '/enciclopedia/astrologia/casas/primera-casa');
  });

  it('debe llamar a useArticlesByCategory con ASTROLOGICAL_HOUSE', async () => {
    mockUseArticlesByCategory.mockReturnValue({ data: [], isLoading: false, error: null });

    renderWithProviders(await CasasPage());

    expect(mockUseArticlesByCategory).toHaveBeenCalledWith(
      ArticleCategory.ASTROLOGICAL_HOUSE,
      undefined
    );
  });

  it('⚠️ T-SEO-003: resuelve el listado en el servidor y lo siembra en el cliente', async () => {
    const articulos = [buildArticle(1, 'un-slug', 'Un Artículo')];
    mockGetArticlesByCategory.mockResolvedValue(articulos);
    mockUseArticlesByCategory.mockReturnValue({ data: articulos, isLoading: false, error: null });

    renderWithProviders(await CasasPage());

    expect(mockGetArticlesByCategory).toHaveBeenCalledWith(ArticleCategory.ASTROLOGICAL_HOUSE);
    expect(mockUseArticlesByCategory).toHaveBeenCalledWith(
      ArticleCategory.ASTROLOGICAL_HOUSE,
      articulos
    );
  });

  it('⚠️ T-SEO-003: si la API falla, la ruta sigue sirviendo su contenido propio', async () => {
    mockGetArticlesByCategory.mockRejectedValue(new Error('API caída'));
    mockUseArticlesByCategory.mockReturnValue({ data: [], isLoading: false, error: null });

    renderWithProviders(await CasasPage());

    expect(mockUseArticlesByCategory).toHaveBeenCalledWith(
      ArticleCategory.ASTROLOGICAL_HOUSE,
      undefined
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'Doce casas, doce áreas de la vida' })
    ).toBeInTheDocument();
  });
});
