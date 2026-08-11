import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import PlanetasPage from './page';
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
    category: ArticleCategory.PLANET,
    snippet: `Descripción de ${nameEs}`,
    imageUrl: null,
    sortOrder: id,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PlanetasPage (/enciclopedia/astrologia/planetas)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetArticlesByCategory.mockResolvedValue([]);
  });

  it('debe mostrar el listado de planetas cuando hay datos', async () => {
    const planetas = [buildArticle(1, 'mercurio', 'Mercurio'), buildArticle(2, 'venus', 'Venus')];
    mockUseArticlesByCategory.mockReturnValue({ data: planetas, isLoading: false, error: null });

    renderWithProviders(await PlanetasPage());

    expect(screen.getByText('Mercurio')).toBeInTheDocument();
    expect(screen.getByText('Venus')).toBeInTheDocument();
  });

  it('links de planetas deben apuntar a la ruta correcta', async () => {
    const planetas = [buildArticle(1, 'mercurio', 'Mercurio')];
    mockUseArticlesByCategory.mockReturnValue({ data: planetas, isLoading: false, error: null });

    renderWithProviders(await PlanetasPage());

    const link = screen.getByRole('link', { name: /mercurio/i });
    expect(link).toHaveAttribute('href', '/enciclopedia/astrologia/planetas/mercurio');
  });

  it('debe llamar a useArticlesByCategory con PLANET', async () => {
    mockUseArticlesByCategory.mockReturnValue({ data: [], isLoading: false, error: null });

    renderWithProviders(await PlanetasPage());

    expect(mockUseArticlesByCategory).toHaveBeenCalledWith(ArticleCategory.PLANET, undefined);
  });

  it('⚠️ T-SEO-003: resuelve el listado en el servidor y lo siembra en el cliente', async () => {
    const articulos = [buildArticle(1, 'un-slug', 'Un Artículo')];
    mockGetArticlesByCategory.mockResolvedValue(articulos);
    mockUseArticlesByCategory.mockReturnValue({ data: articulos, isLoading: false, error: null });

    renderWithProviders(await PlanetasPage());

    expect(mockGetArticlesByCategory).toHaveBeenCalledWith(ArticleCategory.PLANET);
    expect(mockUseArticlesByCategory).toHaveBeenCalledWith(ArticleCategory.PLANET, articulos);
  });

  it('⚠️ T-SEO-003: si la API falla, la ruta sigue sirviendo su contenido propio', async () => {
    mockGetArticlesByCategory.mockRejectedValue(new Error('API caída'));
    mockUseArticlesByCategory.mockReturnValue({ data: [], isLoading: false, error: null });

    renderWithProviders(await PlanetasPage());

    expect(mockUseArticlesByCategory).toHaveBeenCalledWith(ArticleCategory.PLANET, undefined);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Personales, sociales y generacionales' })
    ).toBeInTheDocument();
  });
});
