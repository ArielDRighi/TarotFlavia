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
  useArticlesByCategory: (category: ArticleCategory) => mockUseArticlesByCategory(category),
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
  });

  it('debe mostrar el listado de planetas cuando hay datos', () => {
    const planetas = [buildArticle(1, 'mercurio', 'Mercurio'), buildArticle(2, 'venus', 'Venus')];
    mockUseArticlesByCategory.mockReturnValue({ data: planetas, isLoading: false, error: null });

    renderWithProviders(<PlanetasPage />);

    expect(screen.getByText('Mercurio')).toBeInTheDocument();
    expect(screen.getByText('Venus')).toBeInTheDocument();
  });

  it('links de planetas deben apuntar a la ruta correcta', () => {
    const planetas = [buildArticle(1, 'mercurio', 'Mercurio')];
    mockUseArticlesByCategory.mockReturnValue({ data: planetas, isLoading: false, error: null });

    renderWithProviders(<PlanetasPage />);

    const link = screen.getByRole('link', { name: /mercurio/i });
    expect(link).toHaveAttribute('href', '/enciclopedia/astrologia/planetas/mercurio');
  });

  it('debe llamar a useArticlesByCategory con PLANET', () => {
    mockUseArticlesByCategory.mockReturnValue({ data: [], isLoading: false, error: null });

    renderWithProviders(<PlanetasPage />);

    expect(mockUseArticlesByCategory).toHaveBeenCalledWith(ArticleCategory.PLANET);
  });
});
