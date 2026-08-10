import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import SignosPage from './page';
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
    category: ArticleCategory.ZODIAC_SIGN,
    snippet: `Descripción de ${nameEs}`,
    imageUrl: null,
    sortOrder: id,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SignosPage (/enciclopedia/astrologia/signos)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetArticlesByCategory.mockResolvedValue([]);
  });

  it('debe mostrar el listado de signos cuando hay datos', async () => {
    const signos = [buildArticle(1, 'aries', 'Aries'), buildArticle(2, 'tauro', 'Tauro')];
    mockUseArticlesByCategory.mockReturnValue({ data: signos, isLoading: false, error: null });

    renderWithProviders(await SignosPage());

    expect(screen.getByText('Aries')).toBeInTheDocument();
    expect(screen.getByText('Tauro')).toBeInTheDocument();
  });

  it('links de signos deben apuntar a la ruta correcta', async () => {
    const signos = [buildArticle(1, 'aries', 'Aries')];
    mockUseArticlesByCategory.mockReturnValue({ data: signos, isLoading: false, error: null });

    renderWithProviders(await SignosPage());

    const link = screen.getByRole('link', { name: /aries/i });
    expect(link).toHaveAttribute('href', '/enciclopedia/astrologia/signos/aries');
  });

  it('debe llamar a useArticlesByCategory con ZODIAC_SIGN', async () => {
    mockUseArticlesByCategory.mockReturnValue({ data: [], isLoading: false, error: null });

    renderWithProviders(await SignosPage());

    expect(mockUseArticlesByCategory).toHaveBeenCalledWith(ArticleCategory.ZODIAC_SIGN, []);
  });

  it('⚠️ T-SEO-003: resuelve el listado en el servidor y lo siembra en el cliente', async () => {
    const articulos = [buildArticle(1, 'un-slug', 'Un Artículo')];
    mockGetArticlesByCategory.mockResolvedValue(articulos);
    mockUseArticlesByCategory.mockReturnValue({ data: articulos, isLoading: false, error: null });

    renderWithProviders(await SignosPage());

    expect(mockGetArticlesByCategory).toHaveBeenCalledWith(ArticleCategory.ZODIAC_SIGN);
    expect(mockUseArticlesByCategory).toHaveBeenCalledWith(ArticleCategory.ZODIAC_SIGN, articulos);
  });

  it('⚠️ T-SEO-003: si la API falla, la ruta sigue sirviendo su contenido propio', async () => {
    mockGetArticlesByCategory.mockRejectedValue(new Error('API caída'));
    mockUseArticlesByCategory.mockReturnValue({ data: [], isLoading: false, error: null });

    renderWithProviders(await SignosPage());

    expect(mockUseArticlesByCategory).toHaveBeenCalledWith(ArticleCategory.ZODIAC_SIGN, undefined);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Cómo se ordenan los doce signos' })
    ).toBeInTheDocument();
  });
});
