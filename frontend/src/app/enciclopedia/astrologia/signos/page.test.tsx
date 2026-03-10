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
  });

  it('debe mostrar el listado de signos cuando hay datos', () => {
    const signos = [buildArticle(1, 'aries', 'Aries'), buildArticle(2, 'tauro', 'Tauro')];
    mockUseArticlesByCategory.mockReturnValue({ data: signos, isLoading: false, error: null });

    renderWithProviders(<SignosPage />);

    expect(screen.getByText('Aries')).toBeInTheDocument();
    expect(screen.getByText('Tauro')).toBeInTheDocument();
  });

  it('links de signos deben apuntar a la ruta correcta', () => {
    const signos = [buildArticle(1, 'aries', 'Aries')];
    mockUseArticlesByCategory.mockReturnValue({ data: signos, isLoading: false, error: null });

    renderWithProviders(<SignosPage />);

    const link = screen.getByRole('link', { name: /aries/i });
    expect(link).toHaveAttribute('href', '/enciclopedia/astrologia/signos/aries');
  });

  it('debe llamar a useArticlesByCategory con ZODIAC_SIGN', () => {
    mockUseArticlesByCategory.mockReturnValue({ data: [], isLoading: false, error: null });

    renderWithProviders(<SignosPage />);

    expect(mockUseArticlesByCategory).toHaveBeenCalledWith(ArticleCategory.ZODIAC_SIGN);
  });
});
